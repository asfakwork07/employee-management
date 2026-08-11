import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private apiUrl = "https://employee-management-backend-spring-boot-1.onrender.com/api/auth";
  private apiUrl = `${API_URL}/auth`;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.post(`${API_URL}/auth/change-password`, data, {
      responseType: 'text',
    });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${this.apiUrl}/verify-otp`, {
      email,
      otp,
    });
  }

  resetPassword(email: string, otp: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email,
      otp,
      newPassword,
    });
  }
}
