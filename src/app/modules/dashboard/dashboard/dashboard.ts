import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule, DecimalPipe } from '@angular/common';

import { Chart, registerables, ChartData, ChartOptions } from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import { DashboardService } from '../dashboard-service';
import { NotificationService } from '../../../layout/navbar/notification.service';
import { Router } from '@angular/router';
import { HolidayService } from '../../holidays/holiday.service';
import { EmployeeService } from '../../services/employee';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminDailyBrief } from '../../admin-daily-brief.model';
import { AiChatService } from '../../ai-chat/ai-chat.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  dashboard: any = null;

  role = localStorage.getItem('role') || '';

  employeeName = localStorage.getItem('employeeName') || '';

  department = localStorage.getItem('department') || '';

  designation = localStorage.getItem('designation') || '';

  loading = false;

  notificationLoading = false;

  recentNotifications: any[] = [];

  departmentChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Employees',
        data: [],
      },
    ],
  };

  departmentChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: true,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
        },
      },
    },
  };

  leaveChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  leaveChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },

      tooltip: {
        enabled: true,
      },
    },

    cutout: '65%',
  };

  payrollChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Monthly Payroll',
        data: [],
        tension: 0.3,
        fill: false,
      },
    ],
  };

  payrollChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: 'index',
    },

    plugins: {
      legend: {
        display: true,
        position: 'top',
      },

      tooltip: {
        enabled: true,

        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0);

            return 'Payroll: ₹' + value.toLocaleString('en-IN');
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          callback: (value) => {
            const amount = Number(value);

            if (amount >= 100000) {
              return '₹' + (amount / 100000).toFixed(1) + 'L';
            }

            if (amount >= 1000) {
              return '₹' + (amount / 1000).toFixed(0) + 'K';
            }

            return '₹' + amount;
          },
        },
      },
    },
  };

  upcomingHoliday: any = null;

  holidayLoading = false;

  aiSummary: any = null;

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

  aiYears = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private aiPerformanceService: EmployeeService,
    private holidayService: HolidayService,
    private aiService: AiChatService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();

    this.loadRecentNotifications();
    this.loadUpcomingHoliday();

    if (localStorage.getItem('role') === 'ADMIN') {
      this.loadAdminDailyBrief();
    }
  }

  loadDashboard(): void {
    this.loading = true;

    this.dashboardService.getDashboard().subscribe({
      next: (res: any) => {
        this.dashboard = res;

        this.role = res?.role || this.role;

        console.log('Dashboard data:', this.dashboard);

        if (this.role === 'ADMIN') {
          this.prepareAdminCharts();
        }

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Dashboard loading error:', err);

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadRecentNotifications(): void {
    this.notificationLoading = true;

    this.notificationService.getNotifications().subscribe({
      next: (res: any[]) => {
        this.recentNotifications = (res || []).slice(0, 5);

        this.notificationLoading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Recent notification error:', err);

        this.notificationLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  prepareAdminCharts(): void {
    this.prepareDepartmentChart();

    this.prepareLeaveChart();

    this.preparePayrollChart();
  }

  prepareDepartmentChart(): void {
    const departments = this.dashboard?.employeesByDepartment || {};

    const labels = Object.keys(departments);

    const data = Object.values(departments) as number[];

    this.departmentChartData = {
      labels: labels,

      datasets: [
        {
          label: 'Employees',
          data: data,
        },
      ],
    };
  }

  prepareLeaveChart(): void {
    const leaveStats = this.dashboard?.leaveStatusStats || {};

    this.leaveChartData = {
      labels: ['Pending', 'Approved', 'Rejected'],

      datasets: [
        {
          data: [leaveStats.PENDING || 0, leaveStats.APPROVED || 0, leaveStats.REJECTED || 0],
        },
      ],
    };
  }

  preparePayrollChart(): void {
    const payroll = this.dashboard?.monthlyPayrollStats || [];

    this.payrollChartData = {
      labels: payroll.map((item: any) => this.formatMonth(item.monthName)),

      datasets: [
        {
          label: 'Monthly Payroll',

          data: payroll.map((item: any) => Number(item.amount || 0)),

          tension: 0.3,

          fill: false,
        },
      ],
    };
  }

  formatMonth(month: string): string {
    if (!month) {
      return '';
    }

    const formatted = month.substring(0, 3).toLowerCase();

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'LEAVE_APPLIED':
        return 'bi-calendar-plus';

      case 'LEAVE_APPROVED':
        return 'bi-check-circle-fill';

      case 'LEAVE_REJECTED':
        return 'bi-x-circle-fill';

      case 'SALARY_GENERATED':
        return 'bi-wallet2';

      case 'ACCOUNT_CREATED':
        return 'bi-person-plus-fill';

      case 'PASSWORD_RESET':
        return 'bi-key-fill';

      case 'ACCOUNT_ENABLED':
        return 'bi-person-check-fill';

      case 'ACCOUNT_DISABLED':
        return 'bi-person-slash';

      default:
        return 'bi-bell-fill';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'LEAVE_APPROVED':

      case 'ACCOUNT_ENABLED':
        return 'bg-green-100 text-green-600';

      case 'LEAVE_REJECTED':

      case 'ACCOUNT_DISABLED':
        return 'bg-red-100 text-red-600';

      case 'SALARY_GENERATED':
        return 'bg-purple-100 text-purple-600';

      case 'PASSWORD_RESET':
        return 'bg-yellow-100 text-yellow-700';

      case 'LEAVE_APPLIED':
        return 'bg-blue-100 text-blue-600';

      case 'ACCOUNT_CREATED':
        return 'bg-indigo-100 text-indigo-600';

      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  loadUpcomingHoliday(): void {
    this.holidayLoading = true;

    this.holidayService.getUpcomingHolidays().subscribe({
      next: (res: any[]) => {
        this.upcomingHoliday = res && res.length > 0 ? res[0] : null;

        this.holidayLoading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Upcoming holiday loading error:', err);

        this.upcomingHoliday = null;

        this.holidayLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  generateMyAiSummary(): void {
    if (!this.selectedAiMonth || !this.selectedAiYear) {
      return;
    }

    this.aiSummaryLoading = true;

    this.aiSummary = null;

    this.aiPerformanceService
      .getMyPerformanceSummary(this.selectedAiMonth, this.selectedAiYear, false)
      .subscribe({
        next: (res: any) => {
          this.aiSummary = res;
          this.aiSummaryLoading = false;
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          this.aiSummaryLoading = false;
          this.aiSummary = null;

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

        // error: (err) => {
        //   console.error('AI summary error:', err);

        //   this.aiSummary = null;

        //   this.aiSummaryLoading = false;

        //   this.cdr.detectChanges();
        // },
      });
  }

  regenerateMyAiSummary(): void {
    if (this.aiSummaryLoading) {
      return;
    }

    if (!this.selectedAiMonth || !this.selectedAiYear) {
      return;
    }

    this.aiSummaryLoading = true;

    this.aiPerformanceService
      .getMyPerformanceSummary(this.selectedAiMonth, this.selectedAiYear, true)
      .subscribe({
        next: (res: any) => {
          this.aiSummary = res;

          this.aiSummaryLoading = false;

          Swal.fire({
            icon: 'success',
            title: 'Summary Updated',
            text: 'Your AI summary has been regenerated successfully.',
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
            title: 'Unable to Regenerate Summary',
            text: message,
          });

          this.cdr.detectChanges();
        },
      });
  }

  adminDailyBrief: AdminDailyBrief | null = null;

  aiBriefLoading = false;

  aiBriefError = '';

  loadAdminDailyBrief(): void {
    if (localStorage.getItem('role') !== 'ADMIN') {
      return;
    }

    this.aiBriefLoading = true;
    this.aiBriefError = '';

    this.aiService.getAdminDailyBrief().subscribe({
      next: (response) => {
        this.adminDailyBrief = response;

        this.aiBriefLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Unable to load AI daily brief', error);

        this.aiBriefLoading = false;

        this.aiBriefError = 'Unable to generate AI daily brief.';
          this.cdr.detectChanges();
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
