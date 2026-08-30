import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AiChatService } from './ai-chat.service';

interface QuickQuestion {
  icon: string;
  text: string;
}

interface ChatMessage {
  id: string;
  sender: 'AI' | 'USER';
  text: string;
  timestamp: Date;
  error?: boolean;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChat {
  @ViewChild('chatBody')
  chatBody?: ElementRef<HTMLDivElement>;

  isOpen = false;
  loading = false;
  message = '';

  readonly role = (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();

  readonly userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('employeeName') ||
    (this.role.includes('ADMIN') ? 'Admin' : 'User');

  private readonly currentUserKey =
    localStorage.getItem('userId') ||
    localStorage.getItem('employeeId') ||
    this.userName;

  // Admin and employee histories will not mix on the same browser.
  private readonly CHAT_STORAGE_KEY = `ems_ai_chat_history_${this.role}_${this.currentUserKey}`;

  messages: ChatMessage[] = [];

  constructor(
    private readonly aiChatService: AiChatService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.loadChatHistory();
  }

  // =========================================================
  // ROLE-BASED UI
  // =========================================================

  get isAdmin(): boolean {
    return this.role.includes('ADMIN');
  }

  get assistantTitle(): string {
    return this.isAdmin ? 'EMS Admin AI' : 'EMS AI Assistant';
  }

  get assistantSubtitle(): string {
    return this.isAdmin ? 'Admin Workspace' : 'Employee Assistant';
  }

  get chatPlaceholder(): string {
    return this.isAdmin
      ? 'Ask about employees, attendance, leaves, payroll...'
      : 'Ask about your attendance, leave, salary...';
  }

  get quickQuestions(): QuickQuestion[] {
    if (this.isAdmin) {
      return [
        { icon: 'bi-speedometer2', text: "Today's EMS summary" },
        { icon: 'bi-people', text: 'Employee overview' },
        { icon: 'bi-calendar2-check', text: 'Pending leaves' },
        { icon: 'bi-clock-history', text: 'Attendance summary' },
        { icon: 'bi-cash-stack', text: 'Payroll summary' },
        { icon: 'bi-calendar-event', text: 'Upcoming holidays' },
      ];
    }

    return [
      { icon: 'bi-person-check', text: 'My attendance' },
      { icon: 'bi-clock', text: 'My working hours' },
      { icon: 'bi-calendar2-week', text: 'My leaves' },
      { icon: 'bi-wallet2', text: 'My salary' },
      { icon: 'bi-stars', text: 'My performance' },
      { icon: 'bi-calendar-event', text: 'Upcoming holidays' },
    ];
  }

  // =========================================================
  // OPEN / CLOSE
  // =========================================================

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.scrollToBottom(50);
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  // =========================================================
  // QUICK QUESTION
  // =========================================================

  sendQuickQuestion(question: string): void {
    if (this.loading) {
      return;
    }

    this.message = question;
    this.sendMessage();
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  sendMessage(): void {
    const text = this.message.trim();

    if (!text || this.loading) {
      return;
    }

    this.messages.push(this.createMessage('USER', text));
    this.saveChatHistory();

    this.message = '';
    this.loading = true;

    this.cdr.detectChanges();
    this.scrollToBottom(20);

    this.aiChatService.sendMessage(text).subscribe({
      next: (response: unknown) => {
        this.messages.push(
          this.createMessage('AI', this.extractAnswer(response)),
        );

        this.loading = false;
        this.saveChatHistory();
        this.cdr.detectChanges();
        this.scrollToBottom(50);
      },

      error: (error: any) => {
        this.loading = false;

        this.messages.push(
          this.createMessage('AI', this.extractErrorMessage(error), true),
        );

        this.saveChatHistory();
        this.cdr.detectChanges();
        this.scrollToBottom(50);
      },
    });
  }

  // Supports string responses as well as { answer }, { response } or { message }.
  private extractAnswer(response: unknown): string {
    if (typeof response === 'string') {
      return response.trim() || 'No response received.';
    }

    if (!response || typeof response !== 'object') {
      return 'No response received.';
    }

    const data = response as Record<string, unknown>;
    const answer = data['answer'] ?? data['response'] ?? data['message'];

    if (typeof answer === 'string' && answer.trim()) {
      return answer.trim();
    }

    try {
      return JSON.stringify(response, null, 2);
    } catch {
      return 'AI response received.';
    }
  }

  private extractErrorMessage(error: any): string {
    if (error?.status === 429) {
      return 'AI free quota reached. Please try again later.';
    }

    if (error?.status === 401) {
      return 'Your session has expired. Please login again.';
    }

    if (error?.status === 403) {
      return 'You are not allowed to access this information.';
    }

    // Backend sometimes returns a plain string instead of a JSON object.
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error.trim();
    }

    if (typeof error?.error?.detail === 'string') {
      return error.error.detail;
    }

    if (typeof error?.error?.message === 'string') {
      return error.error.message;
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }

    return 'Unable to get a response right now.';
  }

  // =========================================================
  // ENTER KEY
  // =========================================================

 onEnter(event: Event): void {
  const keyboardEvent = event as KeyboardEvent;

  if (keyboardEvent.shiftKey) {
    return;
  }

  keyboardEvent.preventDefault();
  this.sendMessage();
}

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  clearChat(): void {
    if (this.loading || this.messages.length <= 1) {
      return;
    }

    localStorage.removeItem(this.CHAT_STORAGE_KEY);
    this.messages = [this.getWelcomeMessage()];
    this.saveChatHistory();

    this.cdr.detectChanges();
    this.scrollToBottom(50);
  }

  // =========================================================
  // CHAT HISTORY
  // =========================================================

  private saveChatHistory(): void {
    try {
      // Prevent unlimited localStorage growth.
      const recentMessages = this.messages.slice(-100);
      localStorage.setItem(
        this.CHAT_STORAGE_KEY,
        JSON.stringify(recentMessages),
      );
    } catch (error) {
      console.error('Unable to save AI chat history:', error);
    }
  }

  private loadChatHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.CHAT_STORAGE_KEY);

      if (!savedHistory) {
        this.messages = [this.getWelcomeMessage()];
        return;
      }

      const parsedMessages: unknown = JSON.parse(savedHistory);

      if (!Array.isArray(parsedMessages)) {
        this.messages = [this.getWelcomeMessage()];
        return;
      }

      const validMessages = parsedMessages
        .filter(
          (item: any) =>
            item &&
            (item.sender === 'AI' || item.sender === 'USER') &&
            typeof item.text === 'string',
        )
        .map(
          (item: any): ChatMessage => ({
            id: typeof item.id === 'string' ? item.id : this.createMessageId(),
            sender: item.sender,
            text: item.text,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
            error: item.error === true,
          }),
        );

      this.messages =
        validMessages.length > 0
          ? validMessages
          : [this.getWelcomeMessage()];
    } catch (error) {
      console.error('Unable to load AI chat history:', error);
      this.messages = [this.getWelcomeMessage()];
    }
  }

  private getWelcomeMessage(): ChatMessage {
    const text = this.isAdmin
      ? `Hi ${this.userName}! I'm your EMS Admin AI assistant. I can help with employee attendance, pending leaves, payroll, holidays and EMS insights.`
      : `Hi ${this.userName}! I'm your EMS AI assistant. I can help with your attendance, leave, salary, holidays and other EMS information.`;

    return this.createMessage('AI', text);
  }

  private createMessage(
    sender: 'AI' | 'USER',
    text: string,
    error = false,
  ): ChatMessage {
    return {
      id: this.createMessageId(),
      sender,
      text,
      error,
      timestamp: new Date(),
    };
  }

  private createMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  // =========================================================
  // SAFE AI MESSAGE FORMATTER
  // =========================================================

  formatMessage(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const lines = String(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines
      .map((line) => {
        const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

        if (headingMatch) {
          return `<p class="ai-heading">${this.renderInlineBold(headingMatch[1])}</p>`;
        }

        const bulletMatch = line.match(/^[-*•]\s+(.+)$/);

        if (bulletMatch) {
          const content = bulletMatch[1];
          const metricMatch = content.match(/^\*\*(.+?):\*\*\s*(.+)$/);

          if (metricMatch) {
            return this.renderMetric(metricMatch[1], metricMatch[2]);
          }

          return `
            <div class="ai-bullet">
              <span class="ai-dot"></span>
              <span>${this.renderInlineBold(content)}</span>
            </div>
          `;
        }

        const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/);

        if (numberedMatch) {
          return `
            <div class="ai-numbered">
              <span class="ai-number">${numberedMatch[1]}</span>
              <span>${this.renderInlineBold(numberedMatch[2])}</span>
            </div>
          `;
        }

        const metricMatch = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);

        if (metricMatch) {
          return this.renderMetric(metricMatch[1], metricMatch[2]);
        }

        return `<p class="ai-paragraph">${this.renderInlineBold(line)}</p>`;
      })
      .join('');
  }

  private renderMetric(label: string, value: string): string {
    return `
      <div class="ai-metric">
        <span class="ai-metric-label">${this.renderInlineBold(label)}</span>
        <span class="ai-metric-value">${this.renderInlineBold(value)}</span>
      </div>
    `;
  }

  private renderInlineBold(value: string): string {
    return this.escapeHtml(value).replace(
      /\*\*(.+?)\*\*/g,
      '<strong>$1</strong>',
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================
  // TRACK BY
  // =========================================================

  trackByMessage(_index: number, item: ChatMessage): string {
    return item.id;
  }

  trackByQuestion(_index: number, item: QuickQuestion): string {
    return item.text;
  }

  // =========================================================
  // SCROLL
  // =========================================================

  private scrollToBottom(delay = 0): void {
    setTimeout(() => {
      const element = this.chatBody?.nativeElement;

      if (!element) {
        return;
      }

      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });
    }, delay);
  }
}