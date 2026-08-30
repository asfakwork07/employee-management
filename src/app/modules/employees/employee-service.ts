// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// export interface Employee {
//     id?: number;
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     department: string;
//     designation: string;
//     salary: number;
//     joiningDate: string;
//     status: string;
// }

// @Injectable({
//     providedIn: 'root'
// })
// export class EmployeeService {

//     private apiUrl = 'http://localhost:8080/api/employees';

//     constructor(private http: HttpClient) { }

//     // Get All Employees
//     getAllEmployees(): Observable<Employee[]> {
//         return this.http.get<Employee[]>(this.apiUrl);
//     }

//     // Get Employee By Id
//     getEmployeeById(id: number): Observable<Employee> {
//         return this.http.get<Employee>(`${this.apiUrl}/${id}`);
//     }

//     // Save Employee
//     addEmployee(employee: any) {
//         return this.http.post(this.apiUrl, employee);
//     }

//     // Update Employee
//     updateEmployee(id: number, employee: Employee): Observable<Employee> {
//         return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
//     }

//     // Delete Employee
//     deleteEmployee(id: number): Observable<any> {
//         return this.http.delete(`${this.apiUrl}/${id}`, {
//             responseType: 'text'
//         });
//     }

// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';
import { SKIP_GLOBAL_LOADER } from '../../auth/http-context.tokens';

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: string;
}

// Global loader skip karne ke liye
export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  // private apiUrl = 'http://localhost:8080/api/employees';
  private apiUrl = `${API_URL}/employees`;

  private apiUrlAi = `${API_URL}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // getPerformanceSummary(employeeId: number, month: number, year: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrlAi}/ai/performance/${employeeId}`, {
  //     params: {
  //       month: month.toString(),
  //       year: year.toString(),
  //     },
  //   });
  // }

  // getMyPerformanceSummary(month: number, year: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrlAi}/ai/performance/me`, {
  //     params: {
  //       month: month.toString(),
  //       year: year.toString(),
  //     },
  //   });
  // }

  getPerformanceSummary(
    employeeId: number,
    month: number,
    year: number,
    regenerate: boolean = false,
  ): Observable<any> {
    return this.http.get<any>(`${this.apiUrlAi}/ai/performance/${employeeId}`, {
      params: {
        month: month.toString(),
        year: year.toString(),
        regenerate: regenerate.toString(),
      },
       context: new HttpContext().set(
        SKIP_GLOBAL_LOADER,
        true,
      ),
    });
  }

  getMyPerformanceSummary(
    month: number,
    year: number,
    regenerate: boolean = false,
  ): Observable<any> {
    return this.http.get<any>(`${this.apiUrlAi}/ai/performance/me`, {
      params: {
        month: month.toString(),
        year: year.toString(),
        regenerate: regenerate.toString(),
      },
       context: new HttpContext().set(
        SKIP_GLOBAL_LOADER,
        true,
      ),
    });
  }

  // Get All Employees
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  // Get Employee By Id
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Save Employee
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee, {
      headers: this.getHeaders(),
      responseType: 'text',
    });
  }

  // Update Employee
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, {
      headers: this.getHeaders(),
    });
  }

  // Delete Employee
  deleteEmployee(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text',
    });
  }

  importExcel1(file: File) {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(this.apiUrl + '/import', formData, { responseType: 'text' });
  }
  importExcel(file: File) {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/import`, formData, {
      responseType: 'text',
    });
  }

  createLoginAccount(employeeId: number) {
    return this.http.post(`${API_URL}/users/employee/${employeeId}/account`, {});
  }

  resetEmployeePassword(employeeId: number) {
    return this.http.put(`${API_URL}/users/employee/${employeeId}/reset-password`, {});
  }

  disableEmployeeLogin(employeeId: number) {
    return this.http.put(`${API_URL}/users/employee/${employeeId}/disable`, {});
  }

  enableEmployeeLogin(employeeId: number) {
    return this.http.put(`${API_URL}/users/employee/${employeeId}/enable`, {});
  }
}
