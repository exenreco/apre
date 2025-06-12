import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { TableComponent } from '../../../shared/table/table.component';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales-by-region-and-product',
  standalone: true,
  imports: [ReactiveFormsModule, ChartComponent, TableComponent],
  template: `
    <h1>Sales by Region and Product</h1>
    <div class="report-container">
      <form class="form" [formGroup]="regionAndProductForm" (ngSubmit)="onSubmit()">

        <div class="form__group">
          <label for="regions">Select Region:</label>
          <select class="select" formControlName="regions" id="regions" name="regions" required>
            <option value="" disabled selected>Region</option>
            @for(region of regions; track region) {
              <option value="{{ region }}">{{ region }}</option>
            }
          </select>
        </div>

        <div class="form__group">
          <label for="products">Select Product:</label>
          <select class="select" formControlName="products" id="products" name="products" required>
            <option value="" disabled selected>Product</option>
            @for(product of products; track product) {
              <option value="{{ product }}">{{ product }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <input
            type="submit"
            class="button button--primary"
            value="Generate Report"
            [disabled]="regionAndProductForm.invalid" />
        </div>

      </form>

      @if (salesData.length > 0 && selectedRegion && selectedProduct) {
        <div class="card toggles">
          <div class="toggle-title">
            <h2>Report View</h2>
          </div>
          <div class="view-toggle">
            <button (click)="viewMode = 'table'"
              [class.active]="viewMode === 'table'" class="button button--primary">Table View</button>
            <button (click)="viewMode = 'chart'"
              [class.active]="viewMode === 'chart'" class="button button--primary">Chart View</button>
          </div>
        </div>

        @if (viewMode === 'chart' && salesAmount.length && salesPerson.length) {
          <div class="card">
            <div class="card__body">
              <app-chart
                type="bar"
                [label]="'Sales by Region and Product'"
                [data]="salesAmount"
                [labels]="salesPerson"
              ></app-chart>
            </div>
          </div>
        }

        @if (viewMode === 'table' && salesData.length > 0) {
          <div class="card">
            <div class="card__body">
              <app-table
                [title]="'Sales Report for ' + selectedRegion + ' Region ' + selectedProduct"
                [data]="salesData"
                [headers]="['Region', 'Sales Person', 'Product', 'Total Sales']"
              ></app-table>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .toggles {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
    .toggles .toggle-title {
      width: 70%;
      display: flex;
      flex: 0 0 auto;
      align-items: left;
      justify-content: left;
      text-indent: 10px;
    }
    .toggles .view-toggle {
      width: 30%;
      display: flex;
      flex: 0 0 auto;
      justify-content: right;
    }
    .view-toggle button {
      width: 45%;
      margin: auto;
    }
    .view-toggle button.active {
      opacity: 0.5;
    }
  `
})
export class SalesByRegionAndProductComponent implements AfterViewInit {
  salesData: any[] = [];

  regions: string[] = [];

  products: string[] = [];

  salesAmount: number[] = [];

  salesPerson: string[] = [];

  viewMode: 'table' | 'chart' = 'table';

  regionAndProductForm = this.fb.group({
    regions: ['', Validators.required],
    products: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Fetch the list of regions
    this.http.get(`${environment.apiBaseUrl}/reports/sales/regions`).subscribe({
      next: (data: any) => {
        this.regions = data;
      },
      error: (err) => {
        console.error('Error fetching regions:', err);
      }
    });

    // Fetch the list of products
    this.http.get(`${environment.apiBaseUrl}/reports/sales/products`).subscribe({
      next: (data: any) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error fetching regions:', err);
      }
    });
  }

  get selectedRegion(): string {
    return this.regionAndProductForm.controls['regions'].value || '';
  }

  get selectedProduct(): string {
    return this.regionAndProductForm.controls['products'].value || '';
  }

  ngAfterViewInit(): void {
    // No need to create chart here, it will be handled by ChartComponent
  }

  onSubmit() {
    if (this.regionAndProductForm.invalid) return;

    const
      region = this.selectedRegion,
      product = this.selectedProduct;

    this.http.get(
      `${environment.apiBaseUrl}/reports/sales/sales-by-region-and-product`
      + `?region=${encodeURIComponent(region)}`
      + `&product=${encodeURIComponent(product)}`
    ).subscribe({
      next: (data: any) => {
        this.salesData = data;
        this.chartView();
        this.tableView();
        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching data from server: ', err);
      }
    });
  }

  chartView() {
    // an array of each salesperson’s name
    this.salesPerson = this.salesData.map(item => item.salesperson);
    // an array of each salesman’s totalSales
    this.salesAmount = this.salesData.map(item => item.amount);
  }

  tableView() {
    for (let data of this.salesData) {
      data['Region'] = data['region'] || 'N/A';
      data['Product'] = data['product'] || 'N/A';
      data['Total Sales'] = data['amount'] || 0;
      data['Sales Person'] = data['salesperson'] || 'N/A';
    }
    console.log('Sales data:', this.salesData);
  }
}