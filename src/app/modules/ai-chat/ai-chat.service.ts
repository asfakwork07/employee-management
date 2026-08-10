import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';

export const SKIP_CHAT_LOADER = new HttpContextToken<boolean>(() => false);

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly apiUrl = API_URL + '/ai/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      {
        message,
      },
      {
        context: new HttpContext().set(SKIP_CHAT_LOADER, true),
      },
    );
  }
}
