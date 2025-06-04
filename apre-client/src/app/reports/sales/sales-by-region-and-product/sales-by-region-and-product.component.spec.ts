import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SalesByRegionAndProductComponent } from './sales-by-region-and-product.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

describe('SalesByRegionAndProductComponent', () => {
  let component: SalesByRegionAndProductComponent;
  let fixture: ComponentFixture<SalesByRegionAndProductComponent>;
  let httpMock: HttpTestingController;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesByRegionAndProductComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesByRegionAndProductComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);

    // Handle initial region and product requests
    const regionsReq = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/regions`);
    regionsReq.flush(['North', 'South']);

    const productsReq = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/products`);
    productsReq.flush(['Widget', 'Gadget']);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch regions and products on initialization', () => {
    expect(component.regions).toEqual(['North', 'South']);
    expect(component.products).toEqual(['Widget', 'Gadget']);
  });

  it('should initialize form with required validators', () => {
    expect(component.regionAndProductForm.valid).toBeFalse();
    expect(component.regionAndProductForm.controls['regions'].hasError('required')).toBeTrue();
    expect(component.regionAndProductForm.controls['products'].hasError('required')).toBeTrue();
  });

  it('should disable submit button when form is invalid', () => {
    const submitButton = fixture.nativeElement.querySelector('input[type="submit"]');
    expect(submitButton.disabled).toBeTrue();
  });

  it('should fetch sales data on valid form submission', fakeAsync(() => {
    component.regionAndProductForm.patchValue({
      regions: 'North',
      products: 'Widget'
    });

    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-region-and-product?region=North&product=Widget`
    );

    const mockResponse = [
      { region: 'North', salesperson: 'John', product: 'Widget', amount: 100 },
      { region: 'North', salesperson: 'Jane', product: 'Widget', amount: 200 }
    ];

    req.flush(mockResponse);
    tick();
    fixture.detectChanges();

    expect(component.salesData).toEqual(mockResponse);
    expect(component.salesPerson).toEqual(['John', 'Jane']);
    expect(component.salesAmount).toEqual([100, 200]);
  }));

  it('should switch between table and chart views', fakeAsync(() => {
    component.regionAndProductForm.patchValue({
      regions: 'North',
      products: 'Widget'
    });
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-region-and-product?region=North&product=Widget`
    );

    req.flush([{ region: 'North', salesperson: 'John', product: 'Widget', amount: 100 }]);
    tick();
    fixture.detectChanges();

    // Initial view is table
    expect(component.viewMode).toBe('table');
    expect(fixture.nativeElement.querySelector('app-table')).toBeTruthy();

    // Switch to chart view
    const chartButton = fixture.nativeElement.querySelectorAll('.view-toggle button')[1];
    chartButton.click();
    fixture.detectChanges();

    expect(component.viewMode).toBe('chart');
    expect(fixture.nativeElement.querySelector('app-chart')).toBeTruthy();
  }));

  it('should handle HTTP errors when fetching regions and products', () => {
    // Recreate component to test error scenario
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      imports: [SalesByRegionAndProductComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });

    const newFixture = TestBed.createComponent(SalesByRegionAndProductComponent);
    const newComponent = newFixture.componentInstance;
    const newHttpMock = TestBed.inject(HttpTestingController);

    // Handle initial requests with errors
    const regionsReq = newHttpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/regions`);
    regionsReq.error(new ProgressEvent('error'));

    const productsReq = newHttpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/products`);
    productsReq.error(new ProgressEvent('error'));

    newFixture.detectChanges();

    expect(newComponent.regions).toEqual([]);
    expect(newComponent.products).toEqual([]);
  });

  it('should handle HTTP errors when fetching sales data', fakeAsync(() => {
    component.regionAndProductForm.patchValue({
      regions: 'North',
      products: 'Widget'
    });

    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/sales/sales-by-region-and-product?region=North&product=Widget`
    );

    req.error(new ProgressEvent('error'));
    tick();

    expect(component.salesData).toEqual([]);
  }));
});