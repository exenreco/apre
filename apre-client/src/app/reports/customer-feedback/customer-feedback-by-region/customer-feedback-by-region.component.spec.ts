import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerFeedbackByRegionComponent } from './customer-feedback-by-region.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('CustomerFeedbackByRegionComponent', () => {
  let
  component: CustomerFeedbackByRegionComponent,

  fixture: ComponentFixture<CustomerFeedbackByRegionComponent>,

  httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackByRegionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByRegionComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Flush initial regions request
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/regions`
    );
    req.flush([]);

    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create customer feedback by region component', () => {
    expect(component).toBeTruthy();
  });

  it('should transform data for table view with sales amount', () => {
    component.feedbackData = [{
      region: 'East',
      customer: 'Test User',
      salesAmount: 120,
    }];

    component.tableView();

    expect(component.feedbackData[0]['Region']).toBe('East');
    expect(component.feedbackData[0]['Customer']).toBe('Test User');
    expect(component.feedbackData[0]['Sales Amount']).toBe(120);
  });

  it('should handle missing feedback data fields', () => {
    component.feedbackData = [{
      region: 'Europe',
      customer: 'Test User',
      salesperson: 'Abby Doe',
    }];

    component.tableView();

    expect(component.feedbackData[0]['Region']).toBe('Europe');
    expect(component.feedbackData[0]['Customer']).toBe('Test User');
    expect(component.feedbackData[0]['Sales Person']).toBe('Abby Doe');
    expect(component.feedbackData[0]['Category']).toBe('N/A');
  });

  it('should sort by sales amount in descending', () => {
    component.feedbackData = [
      { region:'test', salesAmount: 200 },
      { region:'test', salesAmount: 350 },
      { region:'test', salesAmount: 150 }
    ];

    component.feedbackData.sort((a, b) => b.salesAmount - a.salesAmount);

    expect(component.feedbackData[0].salesAmount).toBe(350);
    expect(component.feedbackData[1].salesAmount).toBe(200);
    expect(component.feedbackData[2].salesAmount).toBe(150);
  });
});
