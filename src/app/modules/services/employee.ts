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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {

    // private apiUrl = 'http://localhost:8080/api/employees';
    private apiUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    // Get All Employees
    getAllEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.apiUrl, {
            headers: this.getHeaders()
        },);
    }

    // Get Employee By Id
    getEmployeeById(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    // Save Employee
    addEmployee(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.apiUrl, employee, {
            headers: this.getHeaders(), responseType: 'text'
        });
    }

    // Update Employee
    updateEmployee(id: number, employee: Employee): Observable<Employee> {
        return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, {
            headers: this.getHeaders()
        });
    }

    // Delete Employee
    deleteEmployee(id: number): Observable<string> {
        return this.http.delete(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }

    importExcel1(file: File) {

        const formData = new FormData();

        formData.append('file', file);

        return this.http.post(
            this.apiUrl + '/import',
            formData,
            { responseType: 'text' }
        );

    }
    importExcel(file: File) {

  const formData = new FormData();

  formData.append('file', file);

  return this.http.post(
    `${this.apiUrl}/import`,
    formData,
    {
      responseType: 'text'
    }
  );

}
}