import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerformanceByTeamComponent } from './performance-by-team.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('PerformanceByTeamComponent', () => {
  let component: PerformanceByTeamComponent;
  let fixture: ComponentFixture<PerformanceByTeamComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceByTeamComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceByTeamComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Flush initial teams request
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/agent-performance/teams`
    );
    req.flush([]);

    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should transform data for table view with call duration', () => {
    component.performanceData = [{
      team: 'Test',
      region: 'East',
      callDuration: 120,
      resolutionTime: 200,
    }];

    component.tableView();

    expect(component.performanceData[0]['Team']).toBe('Test');
    expect(component.performanceData[0]['Region']).toBe('East');
    expect(component.performanceData[0]['Call Duration']).toBe(120);
    expect(component.performanceData[0]['Resolution Time']).toBe(200);
  });

  it('should handle missing performance data fields', () => {
    component.performanceData = [{ team: 'Test', callDuration: 45 }];

    component.tableView();

    expect(component.performanceData[0]['Team']).toBe('Test');
    expect(component.performanceData[0]['Region']).toBe('N/A');
    expect(component.performanceData[0]['Call Duration']).toBe(45);
    expect(component.performanceData[0]['Resolution Time']).toBe('N/A');
  });

  it('should sort by call duration descending', () => {
    component.performanceData = [
      { team:'test', callDuration: 200 },
      { team:'test', callDuration: 350 },
      { team:'test', callDuration: 150 }
    ];

    component.performanceData.sort((a, b) => b.callDuration - a.callDuration);

    expect(component.performanceData[0].callDuration).toBe(350);
    expect(component.performanceData[1].callDuration).toBe(200);
    expect(component.performanceData[2].callDuration).toBe(150);
  });
});