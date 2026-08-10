import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class LeavesService {
  private leaveApi = `${API_URL}/leaves`;
  private leaveTypeApi = `${API_URL}/leave-types`;

  constructor(private http: HttpClient) {}

  getLeaveTypes() {
    return this.http.get(this.leaveTypeApi);
  }

  applyLeave(data: any) {
    return this.http.post(this.leaveApi, data);
  }

  getAllLeaves() {
    return this.http.get(this.leaveApi);
  }

  // getEmployeeLeaves(employeeId: number) {
  //   return this.http.get(`${this.leaveApi}/employee/${employeeId}`);
  // }
  getEmployeeLeaves(employeeId: number) {
    return this.http.get<any[]>(`${this.leaveApi}/employee/${employeeId}`);
  }

  approveLeave(id: number) {
    return this.http.put(`${this.leaveApi}/${id}/approve`, {});
  }

  rejectLeave(id: number) {
    return this.http.put(`${this.leaveApi}/${id}/reject`, {});
  }
}
