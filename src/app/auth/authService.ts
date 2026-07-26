import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AuthService  {

  private apiUrl = "https://employee-management-backend-spring-boot-1.onrender.com/api/auth";


  constructor(
    private http: HttpClient
  ) { }


  login(data:any): Observable<any>{

    return this.http.post(
      `${this.apiUrl}/login`,
      data
    );

  }


  logout(){

    localStorage.removeItem('token');

  }


  getToken(){

    return localStorage.getItem('token');

  }


  isLoggedIn(){

    return !!this.getToken();

  }

}
