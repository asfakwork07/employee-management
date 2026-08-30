import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../auth/config/api.config';
import { SKIP_GLOBAL_LOADER } from '../../auth/http-context.tokens';

@Injectable({
  providedIn: 'root',
})
export class SalaryService {
  private apiUrl = `${API_URL}/salary`;
  private apiUrlSalaryAi = `${API_URL}/ai`;

  constructor(private http: HttpClient) {}

  generateSalary(data: any) {
    return this.http.post(`${this.apiUrl}/generate`, data);
  }

  getAllSalary() {
    return this.http.get(this.apiUrl);
  }

  getEmployeeSalary(employeeId: number) {
    return this.http.get(`${this.apiUrl}/employee/${employeeId}`);
  }

  getPayslip(salaryId: number) {
    return this.http.get(`${this.apiUrl}/payslip/${salaryId}`);
  }
  downloadPayslip(salaryId: number) {
    return this.http.get(`${this.apiUrl}/payslip/${salaryId}/pdf`, {
      responseType: 'blob',
    });
  }

  explainSalaryWithAi(salaryId: number) {
    return this.http.get<any>(`${this.apiUrlSalaryAi}/payroll/explain/${salaryId}`, {
      context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
    });
  }
}
