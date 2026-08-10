import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { LeavesService } from './leaves.service';
import { EmployeeService } from '../services/employee';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.html',
  styleUrl: './leaves.css',
})
export class Leaves implements OnInit {
  // =========================================================
  // AUTH / LOGGED-IN USER
  // =========================================================

  role = localStorage.getItem('role') || '';

  loggedInEmployeeId = Number(localStorage.getItem('employeeId'));

  employeeName = localStorage.getItem('employeeName') || '';

  department = localStorage.getItem('department') || '';

  designation = localStorage.getItem('designation') || '';

  employees: any[] = [];

  leaveTypes: any[] = [];

  leaveList: any[] = [];

  filteredLeaves: any[] = [];

  selectedEmployeeId!: number;

  selectedLeaveTypeId!: number;

  fromDate = '';

  toDate = '';

  reason = '';

  todayDate = '';

  selectedStatus = 'ALL';

  loading = false;

  submitting = false;

  showApplyModal = false;

  constructor(
    private leavesService: LeavesService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.setTodayDate();

    this.loadLeaveTypes();

    if (this.role === 'ADMIN') {
      // Admin ko employee dropdown chahiye
      this.loadEmployees();

      // Admin sab leaves dekhega
      this.loadAllLeaves();
    }

    // =======================================================
    // EMPLOYEE
    // =======================================================
    else if (this.role === 'EMPLOYEE') {
      if (!this.loggedInEmployeeId) {
        Swal.fire(
          'Employee Not Linked',
          'Your login account is not linked with an employee record.',
          'error',
        );

        return;
      }

      // Employee automatically khud select hoga
      this.selectedEmployeeId = this.loggedInEmployeeId;

      // Sirf own leave history
      this.loadEmployeeLeaves();
    }
  }

  // =========================================================
  // TODAY DATE
  // =========================================================

  setTodayDate(): void {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    const day = String(now.getDate()).padStart(2, '0');

    this.todayDate = `${year}-${month}-${day}`;
  }

  // =========================================================
  // LOAD EMPLOYEES
  // ADMIN ONLY
  // =========================================================

  loadEmployees(): void {
    // Employee role ko ye API call nahi karni
    if (this.role !== 'ADMIN') {
      return;
    }

    this.employeeService.getAllEmployees().subscribe({
      next: (res: any[]) => {
        this.employees = res || [];

        if (this.employees.length > 0) {
          this.selectedEmployeeId = this.employees[0].id;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Employee loading error:', err);

        Swal.fire('Error', 'Unable to load employees.', 'error');
      },
    });
  }

  // =========================================================
  // LOAD LEAVE TYPES
  // ADMIN + EMPLOYEE
  // =========================================================

  loadLeaveTypes(): void {
    this.leavesService.getLeaveTypes().subscribe({
      next: (res: any) => {
        this.leaveTypes = res || [];

        if (this.leaveTypes.length > 0) {
          this.selectedLeaveTypeId = this.leaveTypes[0].id;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Leave type loading error:', err);

        Swal.fire('Error', 'Unable to load leave types.', 'error');
      },
    });
  }

  // =========================================================
  // LOAD ALL LEAVES
  // ADMIN ONLY
  // =========================================================

  loadAllLeaves(): void {
    if (this.role !== 'ADMIN') {
      return;
    }

    this.loading = true;

    this.leavesService.getAllLeaves().subscribe({
      next: (res: any) => {
        this.leaveList = res || [];

        this.filterLeaves();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Leave loading error:', err);

        this.loading = false;

        Swal.fire('Error', 'Unable to load leave requests.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  // =========================================================
  // LOAD EMPLOYEE OWN LEAVES
  // EMPLOYEE ONLY
  // =========================================================

  loadEmployeeLeaves(): void {
    if (!this.selectedEmployeeId) {
      return;
    }

    this.loading = true;

    this.leavesService.getEmployeeLeaves(this.selectedEmployeeId).subscribe({
      next: (res: any) => {
        this.leaveList = res || [];

        this.filterLeaves();

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Employee leave loading error:', err);

        this.loading = false;

        Swal.fire('Error', 'Unable to load your leave requests.', 'error');

        this.cdr.detectChanges();
      },
    });
  }

  // =========================================================
  // OPEN APPLY MODAL
  // =========================================================

  openApplyModal(): void {
    this.resetForm();

    // Employee apne liye hi leave apply karega
    if (this.role === 'EMPLOYEE') {
      this.selectedEmployeeId = this.loggedInEmployeeId;
    }

    // Admin ke case me currently selected employee rahega
    if (this.role === 'ADMIN' && !this.selectedEmployeeId && this.employees.length > 0) {
      this.selectedEmployeeId = this.employees[0].id;
    }

    this.showApplyModal = true;

    this.cdr.detectChanges();
  }

  // =========================================================
  // CLOSE APPLY MODAL
  // =========================================================

  closeApplyModal(): void {
    if (this.submitting) {
      return;
    }

    this.showApplyModal = false;

    this.cdr.detectChanges();
  }

  // =========================================================
  // APPLY LEAVE
  // =========================================================

  applyLeave(): void {
    // -------------------------------------------------------
    // EMPLOYEE SECURITY
    // -------------------------------------------------------

    // Frontend se employeeId manipulate hone se bachane ke liye
    // employee login me always logged-in employee ID use karo.

    if (this.role === 'EMPLOYEE') {
      this.selectedEmployeeId = this.loggedInEmployeeId;
    }

    // -------------------------------------------------------
    // EMPLOYEE VALIDATION
    // -------------------------------------------------------

    if (!this.selectedEmployeeId) {
      Swal.fire('Employee Required', 'Employee information is not available.', 'warning');

      return;
    }

    // -------------------------------------------------------
    // LEAVE TYPE
    // -------------------------------------------------------

    if (!this.selectedLeaveTypeId) {
      Swal.fire('Select Leave Type', 'Please select a leave type.', 'warning');

      return;
    }

    // -------------------------------------------------------
    // FROM DATE
    // -------------------------------------------------------

    if (!this.fromDate) {
      Swal.fire('From Date Required', 'Please select leave start date.', 'warning');

      return;
    }

    // -------------------------------------------------------
    // TO DATE
    // -------------------------------------------------------

    if (!this.toDate) {
      Swal.fire('To Date Required', 'Please select leave end date.', 'warning');

      return;
    }

    // -------------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------------

    if (this.toDate < this.fromDate) {
      Swal.fire('Invalid Date', 'To Date cannot be before From Date.', 'warning');

      return;
    }

    // -------------------------------------------------------
    // REASON
    // -------------------------------------------------------

    if (!this.reason.trim()) {
      Swal.fire('Reason Required', 'Please enter reason for leave.', 'warning');

      return;
    }

    // =======================================================
    // REQUEST
    // =======================================================

    const request = {
      employeeId: this.selectedEmployeeId,

      leaveTypeId: this.selectedLeaveTypeId,

      fromDate: this.fromDate,

      toDate: this.toDate,

      reason: this.reason.trim(),
    };

    this.submitting = true;

    this.leavesService.applyLeave(request).subscribe({
      // ===================================================
      // SUCCESS
      // ===================================================

      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Leave Applied',
          text: 'Leave request submitted successfully.',
        });

        this.resetForm();

        // -----------------------------------------------
        // REFRESH ACCORDING TO ROLE
        // -----------------------------------------------

        if (this.role === 'ADMIN') {
          this.loadAllLeaves();
        } else {
          this.loadEmployeeLeaves();
        }
        this.submitting = false;

        this.showApplyModal = false;
        this.cdr.detectChanges();
      },

      // ===================================================
      // ERROR
      // ===================================================

      error: (err) => {
        this.submitting = false;

        console.error('Apply leave error:', err);

        let message = 'Unable to apply leave.';

        // -----------------------------------------------
        // VALIDATION OBJECT
        // -----------------------------------------------

        if (err.error && typeof err.error === 'object' && !Array.isArray(err.error)) {
          // ResponseStatusException can also have detail
          if (err.error.detail) {
            message = err.error.detail;
          } else if (err.error.message) {
            message = err.error.message;
          } else {
            message = Object.entries(err.error)
              .map(([field, value]) => `${this.formatFieldName(field)}: ${value}`)
              .join('\n');
          }
        }

        // -----------------------------------------------
        // PLAIN STRING
        // -----------------------------------------------
        else if (typeof err.error === 'string') {
          message = err.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Unable to Apply Leave',
          text: message,
        });

        this.cdr.detectChanges();
      },
    });
  }

  // =========================================================
  // FILTER LEAVES
  // =========================================================

  filterLeaves(): void {
    if (this.selectedStatus === 'ALL') {
      this.filteredLeaves = [...this.leaveList];
    } else {
      this.filteredLeaves = this.leaveList.filter((leave) => leave.status === this.selectedStatus);
    }

    this.cdr.detectChanges();
  }

  // =========================================================
  // APPROVE LEAVE
  // ADMIN ONLY
  // =========================================================

  approveLeave(id: number): void {
    // Extra frontend protection
    if (this.role !== 'ADMIN') {
      Swal.fire('Access Denied', 'Only admin can approve leave requests.', 'error');

      return;
    }

    Swal.fire({
      title: 'Approve Leave?',

      text: 'Do you want to approve this leave request?',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Approve',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#16a34a',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.leavesService.approveLeave(id).subscribe({
        next: () => {
          Swal.fire('Approved!', 'Leave approved successfully.', 'success');

          this.loadAllLeaves();
        },

        error: (err) => {
          console.error('Approve leave error:', err);

          Swal.fire('Error', this.getErrorMessage(err), 'error');
        },
      });
    });
  }

  // =========================================================
  // REJECT LEAVE
  // ADMIN ONLY
  // =========================================================

  rejectLeave(id: number): void {
    // Extra frontend protection
    if (this.role !== 'ADMIN') {
      Swal.fire('Access Denied', 'Only admin can reject leave requests.', 'error');

      return;
    }

    Swal.fire({
      title: 'Reject Leave?',

      text: 'Do you want to reject this leave request?',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Reject',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.leavesService.rejectLeave(id).subscribe({
        next: () => {
          Swal.fire('Rejected!', 'Leave rejected successfully.', 'success');

          this.loadAllLeaves();
        },

        error: (err) => {
          console.error('Reject leave error:', err);

          Swal.fire('Error', this.getErrorMessage(err), 'error');
        },
      });
    });
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  resetForm(): void {
    this.fromDate = '';

    this.toDate = '';

    this.reason = '';
  }

  // =========================================================
  // SUMMARY
  // =========================================================

  get pendingLeaves(): number {
    return this.leaveList.filter((leave) => leave.status === 'PENDING').length;
  }

  get approvedLeaves(): number {
    return this.leaveList.filter((leave) => leave.status === 'APPROVED').length;
  }

  get rejectedLeaves(): number {
    return this.leaveList.filter((leave) => leave.status === 'REJECTED').length;
  }

  get totalLeaves(): number {
    return this.leaveList.length;
  }

  // =========================================================
  // HELPERS
  // =========================================================

  formatFieldName(field: string): string {
    switch (field) {
      case 'fromDate':
        return 'From Date';

      case 'toDate':
        return 'To Date';

      case 'employeeId':
        return 'Employee';

      case 'leaveTypeId':
        return 'Leave Type';

      case 'reason':
        return 'Reason';

      default:
        return field;
    }
  }

  getErrorMessage(err: any): string {
    if (typeof err.error === 'string') {
      return err.error;
    }

    if (err.error?.detail) {
      return err.error.detail;
    }

    if (err.error?.message) {
      return err.error.message;
    }

    return 'Something went wrong.';
  }
}
