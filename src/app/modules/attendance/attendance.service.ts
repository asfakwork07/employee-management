import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private apiUrl = `${API_URL}/attendance`;

  constructor(private http: HttpClient) {}

  checkIn(employeeId: number) {
    return this.http.post(`${this.apiUrl}/check-in`, {
      employeeId: employeeId
    });
  }

  checkOut(employeeId: number) {
    return this.http.put(`${this.apiUrl}/check-out`, {
      employeeId: employeeId
    });
  }

  getAllAttendance() {
    return this.http.get(this.apiUrl);
  }

  getEmployeeAttendance(employeeId: number) {
    return this.http.get(
      `${this.apiUrl}/employee/${employeeId}`
    );
  }

  getTodayAttendance() {
    return this.http.get(
      `${this.apiUrl}/today`
    );
  }

  getMonthlyAttendance(
    employeeId: number,
    year: number,
    month: number
  ) {
    return this.http.get(
      `${this.apiUrl}/monthly/${employeeId}?year=${year}&month=${month}`
    );
  }
}