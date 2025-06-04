import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-sales-by-month',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Sales by Month</h1>
    <div class="sales-container">

      <!-- form for month selection -->
      <form class="form" [formGroup]="monthForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label for="month">Select Month:</label>
          <select class="select" formControlName="month" id="month" name="month" required>
            <option value="" disabled selected>Select a month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        <div class="form__actions">
          <input type="submit" class="button button--primary" value="Generate Report" />
        </div>
      </form>

      <!-- div to display the data -->
      @if (salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Sales for ' + selectedMonth"
            [data]="salesData"
            [headers]="['region', 'product', 'category', 'salesperson', 'channel', 'amount']"
            >
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `

  `
})
export class SalesByMonthComponent {
  salesData: any[] = [];

  readonly monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ];

  get selectedMonth(): string {
    const monthNum = this.monthForm.controls['month'].value;
    return monthNum ? this.monthNames[+monthNum] : '';
  }

  monthForm = this.fb.group({
    month: ['', Validators.required]
  })

  constructor(private fb: FormBuilder, private http: HttpClient) {

  }

  onSubmit() {
    const selectedMonth = this.monthForm.controls['month'].value;

    this.http.get(`${environment.apiBaseUrl}/reports/sales/sales-by-month?month=${selectedMonth}`).subscribe({
      next: (data) => {
        this.salesData = data as any[];
      },
      error: (err) => {
        console.error('Error fetching data from server: ', err);
      }
    })
  }
}