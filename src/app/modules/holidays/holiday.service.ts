import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private readonly apiUrl = API_URL + '/holidays';

  constructor(private http: HttpClient) {}

  getAllHolidays(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUpcomingHolidays(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/upcoming`);
  }

  createHoliday(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateHoliday(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteHoliday(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
