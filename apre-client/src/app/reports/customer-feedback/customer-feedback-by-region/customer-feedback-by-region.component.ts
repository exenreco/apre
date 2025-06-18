import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-feedback-by-region',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
    <h1>Customer Feedback By Region</h1>
    <div class="report-container">

      <form class="form" [formGroup]="regionsForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <select class="select" formControlName="region" id="region" name="region" required>
            <option value="" disabled selected>Select a region</option>
            @for(region of regions; track region) {
              <option value="{{ region }}">{{ region }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <input
            type="submit"
            class="button button--primary"
            value="Generate Report"
            [disabled]="regionsForm.invalid" />
        </div>
      </form>

      @if (feedbackData.length > 0 && selectedRegion ) {
        <div class="card">
          <div class="card__body">
            <app-table
              [data]="feedbackData"
              [title]="'Customer feedback for region: ' + selectedRegion"
              [headers]="['Region', 'Customer', 'Sales Person', 'Sales Amount', 'Category', 'Product', 'Channel', 'Rating', 'Feedback Sentiment', 'Feedback Status', 'Feedback Source']"
            ></app-table>
          </div>
        </div>
      }

    </div>
  `,
  styles: ``
})
export class CustomerFeedbackByRegionComponent implements AfterViewInit {

  regions: string[] = [];

  feedbackData: any[] = [];

  constructor( private http: HttpClient, private fb: FormBuilder ) {
    // Fetch the list of teams
    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/regions`).subscribe({
      next: (data: any) => this.regions = data,
      error: (err) => console.error('Error fetching regions:', err)
    });
  }

  // reactive form should have empty string or a valid string
  regionsForm = this.fb.group({
    region: ['', Validators.compose([Validators.required])]
  });

  get selectedRegion(): string {
    return this.regionsForm.controls['region'].value || '';
  }

  tableView() {
    for (let data of this.feedbackData) {
      // Map directly to the expected table fields
      data['Region'] = data['region'] || 'N/A';
      data['Customer'] = data['customer'] || 'N/A';
      data['Sales Person'] = data['salesperson'] || 'N/A';
      data['Sales Amount'] = data['salesAmount'] || 'N/A';
      data['Category'] = data['category'] || 'N/A';
      data['Product'] = data['product'] || 'N/A';
      data['Channel'] = data['channel'] || 'N/A';
      data['Rating'] = data['rating'] || 'N/A';
      data['Feedback Sentiment'] = data['feedbackSentiment'] || 'N/A';
      data['Feedback Status'] = data['feedbackStatus'] || 'N/A';
      data['Feedback Source'] = data['feedbackSource'] || 'N/A';
    }
    console.log('performance data:', this.feedbackData);
  }

  onSubmit() {
    // nothing happens on invalid selection
    if (this.regionsForm.invalid) return;

    // the selected region
    const region = this.selectedRegion;

    // Fetch the customer feedback by region data
    this.http.get(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-region`
      + `?region=${encodeURIComponent(region)}`
    ).subscribe({
      next: (data: any) => {
        this.feedbackData = data;
        this.tableView();
      },
      error: (err) => console.error('Error fetching customer feedback data from server: ', err)
    });
  }

  ngAfterViewInit(): void {
    // No need to create chart here, it will be handled by ChartComponent
  }
}
