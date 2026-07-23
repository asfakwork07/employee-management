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

//     private baseUrl = 'http://localhost:8080/api/employees';

//     constructor(private http: HttpClient) { }

//     // Get All Employees
//     getAllEmployees(): Observable<Employee[]> {
//         return this.http.get<Employee[]>(this.baseUrl);
//     }

//     // Get Employee By Id
//     getEmployeeById(id: number): Observable<Employee> {
//         return this.http.get<Employee>(`${this.baseUrl}/${id}`);
//     }

//     // Save Employee
//     addEmployee(employee: any) {
//         return this.http.post(this.baseUrl, employee);
//     }

//     // Update Employee
//     updateEmployee(id: number, employee: Employee): Observable<Employee> {
//         return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
//     }

//     // Delete Employee
//     deleteEmployee(id: number): Observable<any> {
//         return this.http.delete(`${this.baseUrl}/${id}`, {
//             responseType: 'text'
//         });
//     }

// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

    private baseUrl = 'http://localhost:8080/api/employees';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    // Get All Employees
    getAllEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(this.baseUrl, {
            headers: this.getHeaders()
        },);
    }

    // Get Employee By Id
    getEmployeeById(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    // Save Employee
    addEmployee(employee: Employee): Observable<Employee> {
        return this.http.post<Employee>(this.baseUrl, employee, {
            headers: this.getHeaders(), responseType: 'text'
        });
    }

    // Update Employee
    updateEmployee(id: number, employee: Employee): Observable<Employee> {
        return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee, {
            headers: this.getHeaders()
        });
    }

    // Delete Employee
    deleteEmployee(id: number): Observable<string> {
        return this.http.delete(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders(),
            responseType: 'text'
        });
    }
}