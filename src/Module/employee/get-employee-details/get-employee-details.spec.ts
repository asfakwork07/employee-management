import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetEmployeeDetails } from './get-employee-details';

describe('GetEmployeeDetails', () => {
  let component: GetEmployeeDetails;
  let fixture: ComponentFixture<GetEmployeeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetEmployeeDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(GetEmployeeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
