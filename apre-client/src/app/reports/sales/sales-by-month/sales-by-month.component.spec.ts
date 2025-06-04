import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalesByMonthComponent } from './sales-by-month.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { By } from '@angular/platform-browser';
import { TableComponent } from '../../../shared/table/table.component';

describe('SalesByMonthComponent', () => {
  let component: SalesByMonthComponent;
  let fixture: ComponentFixture<SalesByMonthComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByMonthComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesByMonthComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validator', () => {
    expect(component.monthForm.valid).toBeFalse();
    expect(component.monthForm.controls['month'].hasError('required')).toBeTrue();
  });

  it('should fetch sales data on form submission', fakeAsync(() => {
    const mockResponse = [
      { region: 'North', product: 'Widget', category: 'Tech', salesperson: 'John', channel: 'Online', amount: 1000 }
    ];

    component.monthForm.patchValue({ month: '5' });
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-month?month=5`
    );
    req.flush(mockResponse);
    tick();

    expect(component.salesData).toEqual(mockResponse);
    expect(component.selectedMonth).toBe('May');
  }));

  it('should handle HTTP errors', fakeAsync(() => {
    component.monthForm.patchValue({ month: '3' });
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-month?month=3`
    );
    req.error(new ProgressEvent('error'));
    tick();

    expect(component.salesData).toEqual([]);
  }));

  it('should display table when data is available', fakeAsync(() => {
    component.monthForm.patchValue({ month: '8' });
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-month?month=8`
    );
    req.flush([{ region: 'West', product: 'Gadget', category: 'Tech', salesperson: 'Jane', channel: 'Retail', amount: 1500 }]);
    tick();
    fixture.detectChanges();

    // Verify table component is rendered
    const tableElement = fixture.nativeElement.querySelector('app-table');
    expect(tableElement).toBeTruthy();

    // Verify title is passed correctly to child component
    const tableComponent = fixture.debugElement.query(By.directive(TableComponent)).componentInstance;
    expect(tableComponent.title).toBe('Sales for August');
  }));

  it('should return correct month names', () => {
    component.monthForm.patchValue({ month: '1' });
    expect(component.selectedMonth).toBe('January');

    component.monthForm.patchValue({ month: '12' });
    expect(component.selectedMonth).toBe('December');

    component.monthForm.patchValue({ month: '' });
    expect(component.selectedMonth).toBe('');
  });
});