import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import Swal from 'sweetalert2';

import { EmployeeService } from '../services/employee';
import { AttendanceService } from '../attendance/attendance.service';
import { LeavesService } from '../leaves/leaves.service';
import { SalaryService } from '../salary/salary.service';

@Component({
  selector: 'app-get-employee-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './get-employee-details.html',
  styleUrl: './get-employee-details.css',
})
export class GetEmployeeDetails implements OnInit {
  employees: any[] = [];

  filteredEmployees: any[] = [];

  paginatedEmployees: any[] = [];

  loading = false;

  searchText = '';

  selectedDepartment = 'ALL';

  selectedStatus = 'ALL';

  selectedLoginStatus = 'ALL';

  sortColumn = '';

  sortDirection = true;

  currentPage = 1;

  itemsPerPage = 10;

  totalPages = 0;

  employeeForm!: FormGroup;

  showModal = false;

  isEditMode = false;

  selectedEmployeeId!: number;

  showImportModal = false;

  selectedFile!: File;

  selectedEmployee: any = null;

  showViewModal = false;

  // activeEmployeeTab: 'profile' | 'attendance' | 'leaves' | 'salary' = 'profile';

  activeEmployeeTab: 'profile' | 'attendance' | 'leaves' | 'salary' | 'ai' = 'profile';
  employeeAttendance: any[] = [];

  employeeLeaves: any[] = [];

  employeeSalary: any[] = [];

  employeeTabLoading = false;

  aiPerformanceSummary: any = null;

  aiSummaryLoading = false;

  selectedAiMonth = new Date().getMonth() + 1;

  selectedAiYear = new Date().getFullYear();

  aiMonths = [
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

  aiYears: number[] = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);

  constructor(
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private leavesService: LeavesService,
    private salaryService: SalaryService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],

      lastName: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', Validators.required],

      department: ['', Validators.required],

      designation: ['', Validators.required],

      salary: ['', [Validators.required, Validators.min(1)]],

      joiningDate: ['', Validators.required],

      status: ['Active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.loading = true;

    this.employeeService.getAllEmployees().subscribe({
      next: (data: any[]) => {
        this.employees = data || [];

        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Employee loading error:', err);

        this.loading = false;

        Swal.fire('Error', 'Unable to load employees.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  get totalEmployees(): number {
    return this.employees.length;
  }

  get activeEmployees(): number {
    return this.employees.filter((employee) => employee.status?.toLowerCase() === 'active').length;
  }

  get inactiveEmployees(): number {
    return this.employees.filter((employee) => employee.status?.toLowerCase() === 'inactive')
      .length;
  }

  get loginEnabledEmployees(): number {
    return this.employees.filter((employee) => employee.loginEnabled === true).length;
  }

  get departments(): string[] {
    return [
      ...new Set(this.employees.map((employee) => employee.department).filter(Boolean)),
    ].sort();
  }

  searchEmployee(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredEmployees = this.employees.filter((employee) => {
      const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();

      const email = (employee.email || '').toLowerCase();

      const phone = (employee.phone || '').toLowerCase();

      const designation = (employee.designation || '').toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        designation.includes(search);

      const matchesDepartment =
        this.selectedDepartment === 'ALL' || employee.department === this.selectedDepartment;

      const matchesStatus =
        this.selectedStatus === 'ALL' || employee.status === this.selectedStatus;

      let matchesLogin = true;

      if (this.selectedLoginStatus === 'ACTIVE') {
        matchesLogin = employee.loginEnabled === true;
      }

      if (this.selectedLoginStatus === 'NO_LOGIN') {
        matchesLogin = !employee.loginEnabled;
      }

      return matchesSearch && matchesDepartment && matchesStatus && matchesLogin;
    });

    this.currentPage = 1;

    this.updatePagination();
  }

  resetFilters(): void {
    this.searchText = '';

    this.selectedDepartment = 'ALL';

    this.selectedStatus = 'ALL';

    this.selectedLoginStatus = 'ALL';

    this.applyFilters();
  }

  sort(column: string): void {
    this.sortDirection = this.sortColumn === column ? !this.sortDirection : true;

    this.sortColumn = column;

    this.filteredEmployees.sort((a, b) => {
      const x = a[column] ?? '';

      const y = b[column] ?? '';

      if (typeof x === 'string' && typeof y === 'string') {
        return this.sortDirection ? x.localeCompare(y) : y.localeCompare(x);
      }

      if (x < y) {
        return this.sortDirection ? -1 : 1;
      }

      if (x > y) {
        return this.sortDirection ? 1 : -1;
      }

      return 0;
    });

    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;

    const end = start + this.itemsPerPage;

    this.paginatedEmployees = this.filteredEmployees.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;

      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;

      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;

    this.updatePagination();
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, i) => i + 1,
    );
  }

  get startRecord(): number {
    if (this.filteredEmployees.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,

      this.filteredEmployees.length,
    );
  }

  openAddModal(): void {
    this.isEditMode = false;

    this.selectedEmployeeId = 0;

    this.employeeForm.reset({
      status: 'Active',
    });

    this.showModal = true;
  }

  editEmployee(employee: any): void {
    this.isEditMode = true;

    this.selectedEmployeeId = employee.id;

    this.employeeForm.patchValue(employee);

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;

    this.isEditMode = false;

    this.employeeForm.reset({
      status: 'Active',
    });
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    if (this.isEditMode) {
      this.employeeService
        .updateEmployee(this.selectedEmployeeId, this.employeeForm.value)
        .subscribe({
          next: () => {
            Swal.fire('Updated!', 'Employee updated successfully.', 'success');

            this.closeModal();

            this.getEmployees();
          },

          error: (err) => {
            Swal.fire('Update Failed', this.getErrorMessage(err), 'error');
          },
        });
    } else {
      this.employeeService.addEmployee(this.employeeForm.value).subscribe({
        next: () => {
          Swal.fire('Added!', 'Employee added successfully.', 'success');

          this.closeModal();

          this.getEmployees();
        },

        error: (err) => {
          Swal.fire('Unable to Add Employee', this.getErrorMessage(err), 'error');
        },
      });
    }
  }

  deleteEmployee(id: number): void {
    const employee = this.employees.find((item) => item.id === id);

    Swal.fire({
      title: 'Delete Employee?',

      text: employee
        ? `${employee.firstName} ${employee.lastName} will be permanently deleted.`
        : 'This employee will be permanently deleted.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Delete Employee',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'Employee deleted successfully.', 'success');

          this.getEmployees();
        },

        error: (err) => {
          Swal.fire('Delete Failed', this.getErrorMessage(err), 'error');
        },
      });
    });
  }

  // viewEmployee(employee: any): void {
  //   this.selectedEmployee = employee;

  //   this.activeEmployeeTab = 'profile';

  //   this.employeeAttendance = [];

  //   this.employeeLeaves = [];

  //   this.employeeSalary = [];

  //   this.employeeTabLoading = false;

  //   this.showViewModal = true;
  // }

  viewEmployee(employee: any): void {
    this.selectedEmployee = employee;

    this.activeEmployeeTab = 'profile';

    this.employeeAttendance = [];

    this.employeeLeaves = [];

    this.employeeSalary = [];

    this.aiPerformanceSummary = null;

    this.aiSummaryLoading = false;

    this.selectedAiMonth = new Date().getMonth() + 1;

    this.selectedAiYear = new Date().getFullYear();

    this.employeeTabLoading = false;

    this.showViewModal = true;
  }

  // closeViewModal(): void {
  //   this.showViewModal = false;

  //   this.selectedEmployee = null;

  //   this.activeEmployeeTab = 'profile';

  //   this.employeeAttendance = [];

  //   this.employeeLeaves = [];

  //   this.employeeSalary = [];

  //   this.employeeTabLoading = false;
  // }

  closeViewModal(): void {
    this.showViewModal = false;

    this.selectedEmployee = null;

    this.activeEmployeeTab = 'profile';

    this.employeeAttendance = [];

    this.employeeLeaves = [];

    this.employeeSalary = [];

    this.aiPerformanceSummary = null;

    this.aiSummaryLoading = false;

    this.employeeTabLoading = false;
  }

  changeEmployeeTab(tab: 'profile' | 'attendance' | 'leaves' | 'salary' | 'ai'): void {
    this.activeEmployeeTab = tab;

    if (!this.selectedEmployee) {
      return;
    }

    if (tab === 'attendance' && this.employeeAttendance.length === 0) {
      this.loadEmployeeAttendance();
    }

    if (tab === 'leaves' && this.employeeLeaves.length === 0) {
      this.loadEmployeeLeaves();
    }

    if (tab === 'salary' && this.employeeSalary.length === 0) {
      this.loadEmployeeSalary();
    }
  }

  generateAiPerformanceSummary(): void {
    if (!this.selectedEmployee?.id) {
      return;
    }

    if (!this.selectedAiMonth || !this.selectedAiYear) {
      Swal.fire('Select Period', 'Please select month and year.', 'warning');

      return;
    }

    this.aiSummaryLoading = true;

    this.aiPerformanceSummary = null;

    this.employeeService
      .getPerformanceSummary(
        this.selectedEmployee.id,
        this.selectedAiMonth,
        this.selectedAiYear,
        false,
      )
      .subscribe({
        next: (res: any) => {
          this.aiPerformanceSummary = res;
          this.aiSummaryLoading = false;

          this.cdr.detectChanges();
        },

        error: (err: any) => {
          this.aiSummaryLoading = false;

          const message =
            err.status === 429
              ? 'AI free quota reached. Please wait about 1 minute and try again.'
              : err.error?.detail ||
                err.error?.message ||
                err.error ||
                'Unable to generate AI summary.';

          Swal.fire({
            icon: 'warning',
            title: 'AI Temporarily Unavailable',
            text: message,
          });

          this.cdr.detectChanges();
        },
      });
  }

  regenerateAiSummary(): void {
    if (this.aiSummaryLoading) {
      return;
    }

    if (!this.selectedEmployee?.id) {
      Swal.fire('Employee Missing', 'Please select an employee first.', 'warning');
      return;
    }

    if (!this.selectedAiMonth || !this.selectedAiYear) {
      Swal.fire('Select Period', 'Please select month and year.', 'warning');
      return;
    }

    this.aiSummaryLoading = true;

    this.employeeService
      .getPerformanceSummary(
        this.selectedEmployee.id,
        this.selectedAiMonth,
        this.selectedAiYear,
        true,
      )
      .subscribe({
        next: (res: any) => {
          this.aiPerformanceSummary = res;
          this.aiSummaryLoading = false;

          Swal.fire({
            icon: 'success',
            title: 'Summary Updated',
            text: 'AI performance summary has been regenerated successfully.',
          });

          this.cdr.detectChanges();
        },

        error: (err: any) => {
          this.aiSummaryLoading = false;

          const message =
            err.status === 429
              ? 'AI free quota reached. Please wait and try again.'
              : err.error?.detail ||
                err.error?.message ||
                err.error ||
                'AI service is temporarily unavailable.';

          Swal.fire({
            icon: 'error',
            title: 'Unable to Generate Summary',
            text: message,
          });

          this.cdr.detectChanges();
        },
      });
  }

  // changeEmployeeTab(tab: 'profile' | 'attendance' | 'leaves' | 'salary'): void {
  //   this.activeEmployeeTab = tab;

  //   if (!this.selectedEmployee) {
  //     return;
  //   }

  //   if (tab === 'attendance' && this.employeeAttendance.length === 0) {
  //     this.loadEmployeeAttendance();
  //   }

  //   if (tab === 'leaves' && this.employeeLeaves.length === 0) {
  //     this.loadEmployeeLeaves();
  //   }

  //   if (tab === 'salary' && this.employeeSalary.length === 0) {
  //     this.loadEmployeeSalary();
  //   }
  // }

  loadEmployeeAttendance(): void {
    if (!this.selectedEmployee?.id) {
      return;
    }

    this.employeeTabLoading = true;

    this.attendanceService.getEmployeeAttendance(this.selectedEmployee.id).subscribe({
      next: (res: any) => {
        this.employeeAttendance = Array.isArray(res) ? res : [];

        this.employeeTabLoading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Employee attendance error:', err);

        this.employeeAttendance = [];

        this.employeeTabLoading = false;

        Swal.fire('Error', 'Unable to load employee attendance.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  loadEmployeeLeaves(): void {
    if (!this.selectedEmployee?.id) {
      return;
    }

    this.employeeTabLoading = true;

    this.leavesService.getEmployeeLeaves(this.selectedEmployee.id).subscribe({
      next: (res: any) => {
        this.employeeLeaves = Array.isArray(res) ? res : [];

        this.employeeTabLoading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Employee leave error:', err);

        this.employeeLeaves = [];

        this.employeeTabLoading = false;

        Swal.fire('Error', 'Unable to load employee leave records.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  loadEmployeeSalary(): void {
    if (!this.selectedEmployee?.id) {
      return;
    }

    this.employeeTabLoading = true;

    this.salaryService.getEmployeeSalary(this.selectedEmployee.id).subscribe({
      next: (res: any) => {
        this.employeeSalary = Array.isArray(res) ? res : [];

        this.employeeTabLoading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Employee salary error:', err);

        this.employeeSalary = [];

        this.employeeTabLoading = false;

        Swal.fire('Error', 'Unable to load employee salary records.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  showImportModals(): void {
    this.selectedFile = undefined as any;

    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  importExcel(): void {
    if (!this.selectedFile) {
      Swal.fire('Select File', 'Please select an Excel file first.', 'warning');

      return;
    }

    this.employeeService.importExcel(this.selectedFile).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',

          title: 'Import Completed',

          text: res,
        });

        this.closeImportModal();

        this.getEmployees();
      },

      error: (err) => {
        Swal.fire('Import Failed', this.getErrorMessage(err), 'error');
      },
    });
  }

  createLogin(employee: any): void {
    Swal.fire({
      title: 'Create Login Account?',

      html: `Create employee login for <b>${employee.firstName} ${employee.lastName}</b>?`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Create Login',

      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.createLoginAccount(employee.id).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',

            title: 'Login Account Created',

            html: `
                  <div style="text-align:left">

                    <p>
                      <b>Employee:</b>
                      ${res.employeeName}
                    </p>

                    <p style="margin-top:6px">
                      <b>Email:</b>
                      ${res.email}
                    </p>

                    <p style="margin-top:6px">
                      <b>Role:</b>
                      ${res.role}
                    </p>

                    <hr style="margin:15px 0">

                    <p>
                      <b>Temporary Password:</b>
                    </p>

                    <div style="
                      background:#f1f5f9;
                      padding:12px;
                      border-radius:8px;
                      font-family:monospace;
                      font-size:18px;
                      margin-top:7px;
                      text-align:center;
                    ">
                      ${res.temporaryPassword}
                    </div>

                    <p style="
                      margin-top:12px;
                      color:#64748b;
                      font-size:13px;
                    ">
                      Save this temporary password before closing.
                    </p>

                  </div>
                `,

            confirmButtonText: 'Done',
          });

          this.getEmployees();
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',

            title: 'Unable to Create Login',

            text: this.getErrorMessage(err),
          });
        },
      });
    });
  }

  getErrorMessage(err: any): string {
    if (typeof err?.error === 'string') {
      return err.error;
    }

    if (err?.error?.detail) {
      return err.error.detail;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    return 'Something went wrong.';
  }
  resetEmployeePassword(employee: any): void {
    Swal.fire({
      title: 'Reset Password?',
      html: `
      Reset password for
      <b>${employee.firstName} ${employee.lastName}</b>?
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#7c3aed',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.resetEmployeePassword(employee.id).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful',
            html: `
              <div style="text-align:left">

                <p>
                  <b>Employee:</b>
                  ${res.employeeName}
                </p>

                <p style="margin-top:6px">
                  <b>Email:</b>
                  ${res.email}
                </p>

                <hr style="margin:15px 0">

                <p>
                  <b>New Temporary Password:</b>
                </p>

                <div style="
                  background:#f1f5f9;
                  padding:12px;
                  border-radius:8px;
                  font-family:monospace;
                  font-size:18px;
                  margin-top:8px;
                  text-align:center;
                ">
                  ${res.temporaryPassword}
                </div>

                <p style="
                  margin-top:12px;
                  color:#64748b;
                  font-size:13px;
                ">
                  Share this temporary password securely with the employee.
                </p>

              </div>
            `,
            confirmButtonText: 'Done',
          });
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Password Reset Failed',
            text:
              err.error?.detail || err.error?.message || err.error || 'Unable to reset password.',
          });
        },
      });
    });
  }

  disableEmployeeLogin(employee: any): void {
    Swal.fire({
      title: 'Disable Login?',
      html: `
      Disable login for
      <b>${employee.firstName} ${employee.lastName}</b>?
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Disable Login',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.disableEmployeeLogin(employee.id).subscribe({
        next: (res: any) => {
          Swal.fire(
            'Login Disabled',
            res.message || 'Employee login disabled successfully.',
            'success',
          );

          this.getEmployees();
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          Swal.fire('Unable to Disable Login', this.getErrorMessage(err), 'error');
        },
      });
    });
  }
  enableEmployeeLogin(employee: any): void {
    Swal.fire({
      title: 'Enable Login?',
      html: `
      Enable login for
      <b>${employee.firstName} ${employee.lastName}</b>?
    `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enable Login',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.employeeService.enableEmployeeLogin(employee.id).subscribe({
        next: (res: any) => {
          Swal.fire(
            'Login Enabled',
            res.message || 'Employee login enabled successfully.',
            'success',
          );

          this.getEmployees();
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          Swal.fire('Unable to Enable Login', this.getErrorMessage(err), 'error');
        },
      });
    });
  }
}
