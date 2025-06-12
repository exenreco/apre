import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/**
 * Week 3: MAjor Development
 * Task : Create an API to fetch agent performance data by team
 * and build an Angular component to display agent performance
 * by team using ChartComponent or TableComponent with 3 unit
 * tests each.
 *
 * @Dev Exenreco Bell
 */
@Component({
  selector: 'app-performance-by-team',
  standalone: true,
  imports: [ ReactiveFormsModule, TableComponent ],
  template: `
    <h1>Agent Performance by Team</h1>
    <div class="report-container">

      <form class="form" [formGroup]="performanceByTeamForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <select class="select" formControlName="team" id="team" name="team" required>
            <option value="" disabled selected>Select team</option>
            @for(team of teams; track team) {
              <option value="{{ team }}">{{ team }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <input
            type="submit"
            class="button button--primary"
            value="Generate Report"
            [disabled]="performanceByTeamForm.invalid" />
        </div>
      </form>

      @if (performanceData.length > 0 && selectedTeam ) {
        <div class="card">
          <div class="card__body">
            <app-table
              [data]="performanceData"
              [title]="'Performance report for team: ' + selectedTeam"
              [headers]="['Team', 'Region', 'Call Duration', 'Resolution Time']"
            ></app-table>
          </div>
        </div>
      }

    </div>
  `,
  styles: ``
})
export class PerformanceByTeamComponent implements AfterViewInit {

  teams: string[] = [];

  performanceData: any[] = [];

  performanceByTeamForm = this.fb.group({
    team: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Fetch the list of teams
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/teams`).subscribe({
      next: (data: any) => this.teams = data,
      error: (err) => console.error('Error fetching regions:', err)
    });
  }

  get selectedTeam(): string {
    return this.performanceByTeamForm.controls['team'].value || '';
  }

  tableView() {
    for (let data of this.performanceData) {
      // Map directly to the expected table fields
      data['Team'] = data['team'] || 'N/A';
      data['Region'] = data['region'] || 'N/A';
      data['Call Duration'] = data['callDuration'] || 'N/A';
      data['Resolution Time'] = data['resolutionTime'] || 'N/A';
    }
    console.log('performance data:', this.performanceData);
  }

  onSubmit() {
    // nothing happens on invalid selection
    if (this.performanceByTeamForm.invalid) return;

    // the selected team name
    const team = this.selectedTeam;

    // Fetch the performance by team data
    this.http.get(
      `${environment.apiBaseUrl}/reports/agent-performance/performance-by-team`
      + `?team=${encodeURIComponent(team)}`
    ).subscribe({
      next: (data: any) => {
        this.performanceData = data;
        this.tableView();
      },
      error: (err) => console.error('Error fetching data from server: ', err)
    });
  }

  ngAfterViewInit(): void {
    // No need to create chart here, it will be handled by ChartComponent
  }
}
