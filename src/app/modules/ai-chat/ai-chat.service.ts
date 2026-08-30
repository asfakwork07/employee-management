import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../auth/config/api.config';
import { AdminDailyBrief } from '../dashboard/admin-daily-brief.model';
import { SKIP_GLOBAL_LOADER } from '../../auth/http-context.tokens';

export const SKIP_CHAT_LOADER = new HttpContextToken<boolean>(() => false);

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly apiUrl = API_URL + '/ai/chat';
  private readonly apiUrlAiAdmin = API_URL + '/ai/admin/daily-brief';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      {
        message,
      },
      {
        context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
      },
    );
  }

  getAdminDailyBrief() {
    return this.http.get<AdminDailyBrief>(this.apiUrlAiAdmin, {
      context: new HttpContext().set(SKIP_GLOBAL_LOADER, true),
    });
  }
}
