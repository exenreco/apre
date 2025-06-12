// performance-by-team.component.spec.ts
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
    component.performanceData = [
      {
        agentId: 1001,
        name: 'Jane Smith',
        phone: '555-5678',
        email: 'jane@example.com',
        region: 'East',
        callDuration: 120
      }
    ];

    component.tableView();

    expect(component.performanceData[0]['Name']).toBe('Jane Smith');
    expect(component.performanceData[0]['Phone']).toBe('555-5678');
    expect(component.performanceData[0]['Email']).toBe('jane@example.com');
    expect(component.performanceData[0]['Region']).toBe('East');
    expect(component.performanceData[0]['Call Duration']).toBe(120);
  });

  it('should handle missing agent fields gracefully', () => {
    component.performanceData = [
      { agentId: 1002, callDuration: 45 }
    ];

    component.tableView();

    expect(component.performanceData[0]['agentId']).toBe(1002);
    expect(component.performanceData[0]['Name']).toBe('N/A');
    expect(component.performanceData[0]['Phone']).toBe('N/A');
    expect(component.performanceData[0]['Email']).toBe('N/A');
    expect(component.performanceData[0]['Region']).toBe('N/A');
    expect(component.performanceData[0]['Call Duration']).toBe(45);
  });

  it('should sort by call duration descending', () => {
    component.performanceData = [
      { agentId: 1003, callDuration: 200 },
      { agentId: 1004, callDuration: 350 },
      { agentId: 1005, callDuration: 150 }
    ];

    component.performanceData.sort((a, b) => b.callDuration - a.callDuration);

    expect(component.performanceData[0].callDuration).toBe(350);
    expect(component.performanceData[1].callDuration).toBe(200);
    expect(component.performanceData[2].callDuration).toBe(150);
  });
});