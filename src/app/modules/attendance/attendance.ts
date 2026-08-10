// import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import Swal from 'sweetalert2';

// import { AttendanceService } from './attendance.service';
// import { EmployeeService } from '../services/employee';

// @Component({
//   selector: 'app-attendance',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './attendance.html',
//   styleUrl: './attendance.css',
// })
// export class Attendance implements OnInit {
//   employees: any[] = [];

//   selectedEmployeeId!: number;

//   attendanceList: any[] = [];

//   todayAttendance: any = null;

//   loading = false;
//   selectedMonth = new Date().getMonth() + 1;
//   selectedYear = new Date().getFullYear();

//   months = [
//     { value: 1, name: 'January' },
//     { value: 2, name: 'February' },
//     { value: 3, name: 'March' },
//     { value: 4, name: 'April' },
//     { value: 5, name: 'May' },
//     { value: 6, name: 'June' },
//     { value: 7, name: 'July' },
//     { value: 8, name: 'August' },
//     { value: 9, name: 'September' },
//     { value: 10, name: 'October' },
//     { value: 11, name: 'November' },
//     { value: 12, name: 'December' },
//   ];

//   years = [2025, 2026, 2027];

//   monthlyAttendance: any[] = [];

//   presentDays = 0;
//   totalWorkingHours = 0;
//   attendancePercentage = 0;
//   constructor(
//     private attendanceService: AttendanceService,
//     private employeeService: EmployeeService,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   ngOnInit(): void {
//     this.loadEmployees();
//   }

//   // ==============================
//   // LOAD EMPLOYEES
//   // ==============================

//   loadEmployees(): void {
//     this.employeeService.getAllEmployees().subscribe({
//       next: (res: any[]) => {
//         this.employees = res;

//         if (this.employees.length > 0) {
//           this.selectedEmployeeId = this.employees[0].id;

//           this.loadAttendance();
//           this.loadMonthlyAttendance();
//           this.cdr.detectChanges();
//         }
//       },

//       error: (err) => {
//         console.error(err);

//         Swal.fire('Error', 'Unable to load employees.', 'error');
//       },
//     });
//   }

//   // ==============================
//   // EMPLOYEE CHANGE
//   // ==============================

//   onEmployeeChange(): void {
//     this.todayAttendance = null;

//     this.attendanceList = [];

//     this.loadAttendance();
//     this.loadMonthlyAttendance();
//     this.cdr.detectChanges();
//   }

//   // ==============================
//   // LOAD ATTENDANCE
//   // ==============================

//   loadAttendance(): void {
//     if (!this.selectedEmployeeId) {
//       return;
//     }

//     this.loading = true;

//     this.attendanceService.getEmployeeAttendance(this.selectedEmployeeId).subscribe({
//       next: (res: any) => {
//         this.attendanceList = res;

//         const now = new Date();

//         const today =
//           `${now.getFullYear()}-` +
//           `${String(now.getMonth() + 1).padStart(2, '0')}-` +
//           `${String(now.getDate()).padStart(2, '0')}`;

//         this.todayAttendance =
//           this.attendanceList.find((item) => item.attendanceDate === today) || null;

//         this.loading = false;
//         this.cdr.detectChanges();
//       },

//       error: (err) => {
//         console.error(err);

//         this.loading = false;

//         Swal.fire('Error', 'Unable to load attendance.', 'error');
//       },
//     });
//   }
//   // ==============================
//   // CHECK IN
//   // ==============================

//   checkIn(): void {
//     if (!this.selectedEmployeeId) {
//       Swal.fire('Select Employee', 'Please select an employee first.', 'warning');
//       return;
//     }

//     this.attendanceService.checkIn(this.selectedEmployeeId).subscribe({
//       next: (res: any) => {
//         // UI ko immediately update karo
//         this.todayAttendance = res;

//         Swal.fire({
//           icon: 'success',
//           title: 'Checked In!',
//           text: `Check-in successful at ${res.checkIn}`,
//         });

//         // History refresh
//         this.loadAttendance();
//         this.loadMonthlyAttendance();
//         this.cdr.detectChanges();
//       },

//       error: (err) => {
//         console.error(err);

//         Swal.fire({
//           icon: 'error',
//           title: 'Check-In Failed',
//           text: err.error?.message || err.error || 'Unable to check in.',
//         });

//         // Agar backend bole already checked-in,
//         // UI ko latest state se sync kara do
//         this.loadAttendance();
//       },
//     });
//   }

//   // ==============================
//   // CHECK OUT
//   // ==============================

//   checkOut(): void {
//     if (!this.selectedEmployeeId) {
//       Swal.fire('Select Employee', 'Please select an employee first.', 'warning');
//       return;
//     }

//     this.attendanceService.checkOut(this.selectedEmployeeId).subscribe({
//       next: (res: any) => {
//         // Immediate UI update
//         this.todayAttendance = res;

//         Swal.fire({
//           icon: 'success',
//           title: 'Checked Out!',
//           text: `Total working hours: ${res.totalHours?.toFixed(2)} hrs`,
//         });

//         this.loadAttendance();
//         this.loadMonthlyAttendance();
//         this.cdr.detectChanges();
//       },

//       error: (err) => {
//         console.error(err);

//         Swal.fire({
//           icon: 'error',
//           title: 'Check-Out Failed',
//           text: err.error?.message || err.error || 'Unable to check out.',
//         });

//         this.loadAttendance();
//       },
//     });
//   }

//   loadMonthlyAttendance1(): void {
//     if (!this.selectedEmployeeId) {
//       return;
//     }

//     this.attendanceService
//       .getMonthlyAttendance(this.selectedEmployeeId, this.selectedYear, this.selectedMonth)
//       .subscribe({
//         next: (res: any) => {
//           this.monthlyAttendance = res;

//           this.presentDays = this.monthlyAttendance.filter(
//             (item) => item.status === 'PRESENT',
//           ).length;

//           this.totalWorkingHours = this.monthlyAttendance.reduce(
//             (total, item) => total + (item.totalHours || 0),
//             0,
//           );

//           const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

//           this.attendancePercentage = daysInMonth > 0 ? (this.presentDays / daysInMonth) * 100 : 0;
//           this.cdr.detectChanges();
//         },

//         error: (err) => {
//           console.error(err);
//         },
//       });
//   }
//   loadMonthlyAttendance(): void {

//   if (!this.selectedEmployeeId) {
//     return;
//   }

//   this.loading = true;

//   this.attendanceService
//     .getMonthlyAttendance(
//       this.selectedEmployeeId,
//       this.selectedYear,
//       this.selectedMonth
//     )
//     .subscribe({

//       next: (res: any) => {

//         this.monthlyAttendance = res;

//         this.presentDays =
//           this.monthlyAttendance.filter(
//             item => item.status === 'PRESENT'
//           ).length;

//         this.totalWorkingHours =
//           this.monthlyAttendance.reduce(
//             (total, item) =>
//               total + (item.totalHours || 0),
//             0
//           );

//         const daysInMonth = new Date(
//           this.selectedYear,
//           this.selectedMonth,
//           0
//         ).getDate();

//         this.attendancePercentage =
//           daysInMonth > 0
//             ? (this.presentDays / daysInMonth) * 100
//             : 0;

//         this.loading = false;
//         this.cdr.detectChanges();
//       },

//       error: (err) => {
//         console.error(err);
//         this.loading = false;

//         Swal.fire(
//           'Error',
//           'Unable to load monthly attendance.',
//           'error'
//         );
//       }

//     });
// }
// }

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { AttendanceService } from './attendance.service';
import { EmployeeService } from '../services/employee';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  // =========================================
  // AUTH / ROLE
  // =========================================

  role = localStorage.getItem('role') || '';

  loggedInEmployeeId = Number(localStorage.getItem('employeeId'));
  employeeName = localStorage.getItem('employeeName') || '';

  department = localStorage.getItem('department') || '';

  designation = localStorage.getItem('designation') || '';

  // =========================================
  // EMPLOYEES
  // =========================================

  employees: any[] = [];

  selectedEmployeeId!: number;

  // =========================================
  // ATTENDANCE
  // =========================================

  attendanceList: any[] = [];

  monthlyAttendance: any[] = [];

  todayAttendance: any = null;

  // =========================================
  // FILTER
  // =========================================

  selectedMonth = new Date().getMonth() + 1;

  selectedYear = new Date().getFullYear();

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

  // =========================================
  // SUMMARY
  // =========================================

  presentDays = 0;

  totalWorkingHours = 0;

  attendancePercentage = 0;

  // =========================================
  // LOADING
  // =========================================

  loading = false;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {
    if (this.role === 'ADMIN') {
      this.loadEmployees();
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

      this.loadAttendance();

      this.loadMonthlyAttendance();
    }
  }

  // =========================================
  // LOAD EMPLOYEES
  // ADMIN ONLY
  // =========================================

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (res: any[]) => {
        this.employees = res;

        if (this.employees.length > 0) {
          this.selectedEmployeeId = this.employees[0].id;

          this.loadAttendance();

          this.loadMonthlyAttendance();
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Employee loading error:', err);

        Swal.fire('Error', 'Unable to load employees.', 'error');
      },
    });
  }

  // =========================================
  // EMPLOYEE CHANGE
  // ADMIN ONLY
  // =========================================

  onEmployeeChange(): void {
    if (this.role !== 'ADMIN') {
      return;
    }

    this.todayAttendance = null;

    this.attendanceList = [];

    this.monthlyAttendance = [];

    this.resetSummary();

    this.loadAttendance();

    this.loadMonthlyAttendance();

    this.cdr.detectChanges();
  }

  // =========================================
  // LOAD ATTENDANCE HISTORY
  // =========================================

  loadAttendance(): void {
    if (!this.selectedEmployeeId) {
      return;
    }

    this.loading = true;

    this.attendanceService.getEmployeeAttendance(this.selectedEmployeeId).subscribe({
      next: (res: any) => {
        this.attendanceList = res || [];

        const now = new Date();

        const today =
          `${now.getFullYear()}-` +
          `${String(now.getMonth() + 1).padStart(2, '0')}-` +
          `${String(now.getDate()).padStart(2, '0')}`;

        this.todayAttendance =
          this.attendanceList.find((item) => item.attendanceDate === today) || null;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Attendance loading error:', err);

        this.loading = false;

        Swal.fire('Error', 'Unable to load attendance.', 'error');
      },
    });
  }

  // =========================================
  // CHECK IN
  // =========================================

  checkIn(): void {
    if (!this.selectedEmployeeId) {
      Swal.fire('Employee Required', 'Employee information is not available.', 'warning');

      return;
    }

    this.attendanceService.checkIn(this.selectedEmployeeId).subscribe({
      next: (res: any) => {
        // Immediately update UI
        this.todayAttendance = res;

        Swal.fire({
          icon: 'success',
          title: 'Checked In!',
          text: `Check-in successful at ${res.checkIn}`,
        });

        this.loadAttendance();

        this.loadMonthlyAttendance();

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Check-in error:', err);

        Swal.fire({
          icon: 'error',
          title: 'Check-In Failed',
          text: err.error?.message || err.error || 'Unable to check in.',
        });

        // Sync latest state
        this.loadAttendance();

        this.loadMonthlyAttendance();
      },
    });
  }

  // =========================================
  // CHECK OUT
  // =========================================

  checkOut(): void {
    if (!this.selectedEmployeeId) {
      Swal.fire('Employee Required', 'Employee information is not available.', 'warning');

      return;
    }

    this.attendanceService.checkOut(this.selectedEmployeeId).subscribe({
      next: (res: any) => {
        // Immediate UI update
        this.todayAttendance = res;

        Swal.fire({
          icon: 'success',
          title: 'Checked Out!',
          text: `Total working hours: ${res.totalHours?.toFixed(2) || '0.00'} hrs`,
        });

        this.loadAttendance();

        this.loadMonthlyAttendance();

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Check-out error:', err);

        Swal.fire({
          icon: 'error',
          title: 'Check-Out Failed',
          text: err.error?.message || err.error || 'Unable to check out.',
        });

        this.loadAttendance();

        this.loadMonthlyAttendance();
      },
    });
  }

  // =========================================
  // LOAD MONTHLY ATTENDANCE
  // =========================================

  loadMonthlyAttendance(): void {
    if (!this.selectedEmployeeId) {
      return;
    }

    this.loading = true;

    this.attendanceService
      .getMonthlyAttendance(this.selectedEmployeeId, this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (res: any) => {
          this.monthlyAttendance = res || [];

          // Present Days
          this.presentDays = this.monthlyAttendance.filter(
            (item) => item.status === 'PRESENT',
          ).length;

          // Total Working Hours
          this.totalWorkingHours = this.monthlyAttendance.reduce(
            (total, item) => total + Number(item.totalHours || 0),

            0,
          );

          // Days in selected month
          const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

          // Attendance Percentage
          this.attendancePercentage = daysInMonth > 0 ? (this.presentDays / daysInMonth) * 100 : 0;

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Monthly attendance error:', err);

          this.loading = false;

          this.resetSummary();

          Swal.fire('Error', 'Unable to load monthly attendance.', 'error');
        },
      });
  }

  // =========================================
  // RESET SUMMARY
  // =========================================

  private resetSummary(): void {
    this.presentDays = 0;

    this.totalWorkingHours = 0;

    this.attendancePercentage = 0;
  }
}
