import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${API_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get(this.apiUrl);
  }

}
