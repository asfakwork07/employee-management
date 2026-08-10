import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { SalaryService } from './salary.service';
import { EmployeeService } from '../services/employee';

@Component({
  selector: 'app-salary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salary.html',
  styleUrl: './salary.css',
})
export class Salary implements OnInit {
  employees: any[] = [];
  salaryList: any[] = [];

  selectedEmployeeId!: number;

  salaryMonth = new Date().getMonth() + 1;

  salaryYear = new Date().getFullYear();

  loading = false;
  generating = false;

  showGenerateModal = false;
  showPayslipModal = false;
  selectedPayslip: any = null;
  payslipLoading = false;

  role = localStorage.getItem('role') || '';

  loggedInEmployeeId = Number(localStorage.getItem('employeeId'));

  employeeName = localStorage.getItem('employeeName') || '';

  department = localStorage.getItem('department') || '';

  designation = localStorage.getItem('designation') || '';
  constructor(
    private salaryService: SalaryService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.role === 'ADMIN') {
      this.loadEmployees();

      this.loadAllSalary();
    } else if (this.role === 'EMPLOYEE') {
      if (!this.loggedInEmployeeId) {
        Swal.fire(
          'Employee Not Linked',
          'Your login account is not linked with an employee record.',
          'error',
        );

        return;
      }

      this.selectedEmployeeId = this.loggedInEmployeeId;

      this.loadEmployeeSalary();
    }
  }

  loadEmployeeSalary(): void {
    if (!this.selectedEmployeeId) {
      return;
    }

    this.loading = true;

    this.salaryService.getEmployeeSalary(this.selectedEmployeeId).subscribe({
      next: (res: any) => {
        this.salaryList = res || [];

        this.filteredSalaryList = [...this.salaryList];

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);

        this.loading = false;

        Swal.fire('Error', 'Unable to load your salary records.', 'error');
      },
    });
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (res: any[]) => {
        this.employees = res;

        if (res.length > 0) {
          this.selectedEmployeeId = res[0].id;
        }
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  loadAllSalary(): void {
    this.loading = true;

    this.salaryService.getAllSalary().subscribe({
      next: (res: any) => {
        this.salaryList = res;
        this.filteredSalaryList = [...res];
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);

        this.loading = false;
      },
    });
  }

  openGenerateModal(): void {
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    if (this.generating) {
      return;
    }

    this.showGenerateModal = false;
  }

  generateSalary(): void {
    if (!this.selectedEmployeeId) {
      Swal.fire('Select Employee', 'Please select an employee.', 'warning');

      return;
    }

    const request = {
      employeeId: this.selectedEmployeeId,

      salaryMonth: this.salaryMonth,

      salaryYear: this.salaryYear,
    };

    this.generating = true;

    this.salaryService.generateSalary(request).subscribe({
      next: () => {
        this.generating = false;

        this.showGenerateModal = false;

        Swal.fire('Salary Generated', 'Salary generated successfully.', 'success');

        this.loadAllSalary();
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.generating = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Generate Salary',
          text: err.error?.message || err.error || 'Something went wrong.',
        });
        this.generating = false;
        this.cdr.detectChanges();
      },
    });
  }
  filteredSalaryList: any[] = [];

  filterEmployeeId: number | null = null;

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  filterSalary(): void {
    if (!this.filterEmployeeId) {
      this.filteredSalaryList = [...this.salaryList];
      return;
    }

    /*
     * Current SalaryResponse me employeeId agar available hai
     * to direct filtering hogi.
     */
    this.filteredSalaryList = this.salaryList.filter(
      (salary) => salary.employeeId === this.filterEmployeeId,
    );
    this.cdr.detectChanges();
  }

  getMonthName(month: number): string {
    return this.months.find((m) => m.value === month)?.name || '';
  }

  getDeductions(salary: any): number {
    return (
      Number(salary.pf || 0) + Number(salary.professionalTax || 0) + Number(salary.incomeTax || 0)
    );
  }

  getTotalGross(): number {
    return this.salaryList.reduce((total, salary) => total + Number(salary.grossSalary || 0), 0);
  }

  getTotalNet(): number {
    return this.salaryList.reduce((total, salary) => total + Number(salary.netSalary || 0), 0);
  }

  getCurrentMonthPayroll(): number {
    const currentMonth = new Date().getMonth() + 1;

    const currentYear = new Date().getFullYear();

    return this.salaryList
      .filter((salary) => salary.salaryMonth === currentMonth && salary.salaryYear === currentYear)
      .reduce((total, salary) => total + Number(salary.netSalary || 0), 0);
  }

  viewPayslip(salaryId: number): void {
    // this.payslipLoading = true;
    this.showPayslipModal = true;
    this.selectedPayslip = null;
    this.selectedSalaryId = salaryId;
    this.salaryService.getPayslip(salaryId).subscribe({
      next: (res: any) => {
        this.selectedPayslip = res;
        this.payslipLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(err);

        this.payslipLoading = false;
        this.showPayslipModal = false;

        Swal.fire('Error', err.error?.message || err.error || 'Unable to load payslip.', 'error');
      },
    });
  }
  closePayslipModal(): void {
    this.showPayslipModal = false;
    this.selectedPayslip = null;
  }

  selectedSalaryId!: number;

  downloadPayslip(): void {
    if (!this.selectedSalaryId) {
      return;
    }

    this.salaryService.downloadPayslip(this.selectedSalaryId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = `payslip-${this.selectedSalaryId}.pdf`;

        link.click();

        window.URL.revokeObjectURL(url);
      },

      error: (err) => {
        console.error(err);

        Swal.fire('Error', 'Unable to download payslip.', 'error');
      },
    });
  }
}
