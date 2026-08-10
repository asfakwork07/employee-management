import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private readonly apiUrl = `${API_URL}/employees`;

  constructor(
    private http: HttpClient
  ) {}

  getMyProfile(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/me`
    );
  }
}