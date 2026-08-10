import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  private readonly apiUrl  = `${API_URL}/settings`;

  constructor(
    private http: HttpClient
  ) {}

  getSettings(): Observable<any> {
    return this.http.get(
      this.apiUrl
    );
  }

  updateSettings(
    request: any
  ): Observable<any> {

    return this.http.put(
      this.apiUrl,
      request
    );
  }
}