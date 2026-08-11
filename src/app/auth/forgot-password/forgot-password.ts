import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../authService';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  step: 1 | 2 | 3 = 1;

  loading = false;

  email = '';

  otp = '';

  forgotForm: FormGroup;

  otpForm: FormGroup;

  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],

      confirmPassword: ['', Validators.required],
    });
  }

  sendOtp(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.email = this.forgotForm.value.email?.trim()?.toLowerCase();

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;

        this.step = 2;

        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: res?.message || 'Please check your registered email.',
        });

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Send OTP',
          text: this.getErrorMessage(err, 'Unable to send OTP.'),
        });

        this.cdr.detectChanges();
      },
    });
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.otp = this.otpForm.value.otp?.trim();

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (res: any) => {
        this.loading = false;

        this.step = 3;

        Swal.fire({
          icon: 'success',
          title: 'OTP Verified',
          text: res?.message || 'Please create your new password.',
        });

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'OTP Verification Failed',
          text: this.getErrorMessage(err, 'OTP verification failed.'),
        });

        this.cdr.detectChanges();
      },
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();

      return;
    }

    const newPassword = this.resetForm.value.newPassword;

    const confirmPassword = this.resetForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Mismatch',
        text: 'New password and confirm password must match.',
      });

      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.email, this.otp, newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Password Reset',
          text: res?.message || 'Your password has been reset successfully.',
          confirmButtonText: 'Go to Login',
        }).then(() => {
          this.router.navigate(['/login']);
        });

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Reset Password',
          text: this.getErrorMessage(err, 'Unable to reset password.'),
        });

        this.cdr.detectChanges();
      },
    });
  }

  getErrorMessage(err: any, fallback: string = 'Something went wrong.'): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (err?.error?.detail) {
      return err.error.detail;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.error?.error) {
      return err.error.error;
    }

    if (err?.message) {
      return err.message;
    }

    return fallback;
  }
}
