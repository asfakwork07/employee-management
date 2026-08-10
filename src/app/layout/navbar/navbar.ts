import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../auth/authService';

import { interval, Subscription } from 'rxjs';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  today = new Date();

  role = localStorage.getItem('role') || '';

  userName = localStorage.getItem('userName') || '';

  email = localStorage.getItem('email') || '';

  employeeName = localStorage.getItem('employeeName') || '';

  showPasswordModal = false;

  currentPassword = '';

  newPassword = '';

  confirmPassword = '';

  changingPassword = false;

  showNotifications = false;

  notifications: any[] = [];

  unreadCount = 0;

  notificationLoading = false;

  private notificationPolling?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUnreadCount();

    this.notificationPolling = interval(100000).subscribe(() => {
      this.loadUnreadCount();

      if (this.showNotifications) {
        this.loadNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationPolling?.unsubscribe();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  loadNotifications(): void {
    // this.notificationLoading = true;

    this.notificationService.getNotifications().subscribe({
      next: (res: any[]) => {
        this.notifications = res || [];

        this.notificationLoading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Notification loading error:', err);

        this.notificationLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res: any) => {
        this.unreadCount = res?.unreadCount || 0;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Unread notification count error:', err);
      },
    });
  }

  openNotification1(notification: any): void {
    if (notification.read) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;

        if (this.unreadCount > 0) {
          this.unreadCount--;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Unable to mark notification as read:', err);
      },
    });
  }
  openNotification(notification: any): void {
    const navigateToNotificationPage = () => {
      this.showNotifications = false;

      switch (notification.type) {
        case 'LEAVE_APPLIED':
        case 'LEAVE_APPROVED':
        case 'LEAVE_REJECTED':
          this.router.navigate(['/leaves']);
          break;

        case 'SALARY_GENERATED':
          this.router.navigate(['/salary']);
          break;

        case 'ACCOUNT_CREATED':
        case 'PASSWORD_RESET':
        case 'ACCOUNT_ENABLED':
        case 'ACCOUNT_DISABLED':
          if (this.role === 'ADMIN') {
            this.router.navigate(['/employees']);
          } else {
            this.router.navigate(['/dashboard']);
          }

          break;

        default:
          this.router.navigate(['/dashboard']);
      }
    };

    if (notification.read) {
      navigateToNotificationPage();

      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;

        if (this.unreadCount > 0) {
          this.unreadCount--;
        }

        this.cdr.detectChanges();

        navigateToNotificationPage();
      },

      error: (err) => {
        console.error('Unable to mark notification as read:', err);

        navigateToNotificationPage();
      },
    });
  }

  markAllNotificationsRead(): void {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          read: true,
        }));

        this.unreadCount = 0;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Unable to mark all notifications as read:', err);
      },
    });
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

      case 'ACCOUNT_DISABLED':
        return 'bi-person-slash';

      case 'ACCOUNT_ENABLED':
        return 'bi-person-check-fill';

      case 'PASSWORD_RESET':
        return 'bi-key-fill';

      default:
        return 'bi-bell-fill';
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'LEAVE_APPLIED':
        return 'bg-blue-100 text-blue-600';

      case 'LEAVE_APPROVED':
        return 'bg-green-100 text-green-600';

      case 'LEAVE_REJECTED':
        return 'bg-red-100 text-red-600';

      case 'SALARY_GENERATED':
        return 'bg-purple-100 text-purple-600';

      case 'ACCOUNT_CREATED':
        return 'bg-indigo-100 text-indigo-600';

      case 'ACCOUNT_DISABLED':
        return 'bg-red-100 text-red-600';

      case 'ACCOUNT_ENABLED':
        return 'bg-green-100 text-green-600';

      case 'PASSWORD_RESET':
        return 'bg-yellow-100 text-yellow-700';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  deleteNotification(notification: any, event: Event): void {
    event.stopPropagation();

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((item) => item.id !== notification.id);

        if (!notification.read && this.unreadCount > 0) {
          this.unreadCount--;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Delete notification error:', err);
      },
    });
  }
  clearAllNotifications(): void {
    if (this.notifications.length === 0) {
      return;
    }

    Swal.fire({
      title: 'Clear Notifications?',
      text: 'All notifications will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear All',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.notificationService.clearAllNotifications().subscribe({
        next: () => {
          this.notifications = [];

          this.unreadCount = 0;

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Clear notifications error:', err);

          Swal.fire('Error', 'Unable to clear notifications.', 'error');
        },
      });
    });
  }

  openPasswordModal(): void {
    this.currentPassword = '';

    this.newPassword = '';

    this.confirmPassword = '';

    this.showNotifications = false;

    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    if (this.changingPassword) {
      return;
    }

    this.showPasswordModal = false;
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      Swal.fire('Missing Fields', 'Please fill all password fields.', 'warning');

      return;
    }

    if (this.newPassword.length < 8) {
      Swal.fire('Invalid Password', 'New password must be at least 8 characters.', 'warning');

      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Password Mismatch', 'New password and confirm password do not match.', 'warning');

      return;
    }

    this.changingPassword = true;

    this.authService
      .changePassword({
        currentPassword: this.currentPassword,

        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.changingPassword = false;

          this.showPasswordModal = false;

          Swal.fire({
            icon: 'success',
            title: 'Password Changed',
            text: 'Your password has been changed successfully. Please login again.',
            confirmButtonText: 'Login Again',
          }).then(() => {
            this.logout();
          });
        },

        error: (err) => {
          this.changingPassword = false;

          Swal.fire({
            icon: 'error',

            title: 'Unable to Change Password',

            text: err.error?.detail || err.error?.message || err.error || 'Something went wrong.',
          });

          this.cdr.detectChanges();
        },
      });
  }

  logout(): void {
    this.notificationPolling?.unsubscribe();

    localStorage.removeItem('token');

    localStorage.removeItem('role');

    localStorage.removeItem('userName');

    localStorage.removeItem('email');

    localStorage.removeItem('employeeId');

    localStorage.removeItem('employeeName');

    localStorage.removeItem('department');

    localStorage.removeItem('designation');

    this.router.navigate(['/login']);
  }
}
