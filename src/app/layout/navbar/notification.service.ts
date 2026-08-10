import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${API_URL}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }

  clearAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }
}
