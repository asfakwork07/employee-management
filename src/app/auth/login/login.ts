import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../authService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  // login() {
  //   const request = {
  //     email: this.email,
  //     password: this.password,
  //   };

  //   this.authService.login(request).subscribe({
  //     next: (response) => {
  //       localStorage.setItem('token', response.token);

  //       localStorage.setItem('role', response.role);

  //       localStorage.setItem('userName', response.name);

  //       localStorage.setItem('email', response.email);
  //       localStorage.setItem('employeeId', response.employeeId?.toString() || '');
  //       localStorage.setItem('employeeId', response.employeeId?.toString() || '');

  //       localStorage.setItem('employeeName', response.employeeName || '');

  //       localStorage.setItem('department', response.department || '');

  //       localStorage.setItem('designation', response.designation || '');

  //       this.router.navigate(['/dashboard']);
  //     },

  //     error: (err) => {
  //       console.error('Login Failed', err);

  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Login Failed',
  //         text: err.error?.detail || err.error?.message || 'Invalid email or password',
  //       });
  //     },
  //   });
  // }
  login(): void {
    const request = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(request).subscribe({
      next: (response: any) => {
        localStorage.setItem('token', response.token);

        localStorage.setItem('role', response.role);

        localStorage.setItem('userName', response.name);

        localStorage.setItem('email', response.email);

        localStorage.setItem('employeeId', response.employeeId?.toString() || '');

        localStorage.setItem('employeeName', response.employeeName || '');

        localStorage.setItem('department', response.department || '');

        localStorage.setItem('designation', response.designation || '');

        this.router.navigate(['/dashboard']);
      },

      error: (err: any) => {
        console.error('Login Failed', err);

        let message = 'Invalid email or password';

        if (typeof err.error === 'string') {
          message = err.error;
        } else if (err.error?.detail) {
          message = err.error.detail;
        } else if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: message,
        });
      },
    });
  }
}
