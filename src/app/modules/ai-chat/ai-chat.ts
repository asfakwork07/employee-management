// import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import { marked } from 'marked';

// import { AiChatService } from './ai-chat.service';

// @Component({
//   selector: 'app-ai-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './ai-chat.html',
//   styleUrl: './ai-chat.css',
// })
// export class AiChat {
//   @ViewChild('chatBody')
//   chatBody!: ElementRef;

//   isOpen = false;

//   loading = false;

//   message = '';

//   role = localStorage.getItem('role') || '';

//   messages: any[] = [
//     {
//       sender: 'AI',
//       text: 'Hi! I can help you with attendance, leave, salary, holidays and other EMS information.',
//       timestamp: new Date(),
//     },
//   ];

//   constructor(
//     private aiChatService: AiChatService,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   // =========================================================
//   // QUICK QUESTIONS
//   // =========================================================

//   get quickQuestions(): string[] {
//     if (this.role === 'ADMIN') {
//       return [
//         'How many employees are present today?',
//         'How many pending leave requests are there?',
//         "What is this month's payroll?",
//         'When is the next holiday?',
//       ];
//     }

//     return [
//       'What is my attendance this month?',
//       'How many pending leaves do I have?',
//       'What is my latest salary?',
//       'When is the next holiday?',
//     ];
//   }

//   // =========================================================
//   // OPEN / CLOSE
//   // =========================================================

//   toggleChat(): void {
//     this.isOpen = !this.isOpen;

//     if (this.isOpen) {
//       setTimeout(() => this.scrollToBottom(), 50);
//     }
//   }

//   closeChat(): void {
//     this.isOpen = false;
//   }

//   // =========================================================
//   // QUICK QUESTION
//   // =========================================================

//   sendQuickQuestion(question: string): void {
//     if (this.loading) {
//       return;
//     }

//     this.message = question;

//     this.sendMessage();
//   }

//   // =========================================================
//   // SEND MESSAGE
//   // =========================================================

//   sendMessage(): void {
//     const text = this.message.trim();

//     if (!text || this.loading) {
//       return;
//     }

//     this.messages.push({
//       sender: 'USER',
//       text: text,
//       timestamp: new Date(),
//     });

//     this.message = '';

//     this.loading = true;

//     this.cdr.detectChanges();

//     setTimeout(() => this.scrollToBottom(), 20);

//     this.aiChatService.sendMessage(text).subscribe({
//       next: (res: any) => {
//         this.messages.push({
//           sender: 'AI',
//           text: res?.answer || 'No response received.',
//           timestamp: res?.timestamp ? new Date(res.timestamp) : new Date(),
//         });

//         this.loading = false;

//         this.cdr.detectChanges();

//         setTimeout(() => this.scrollToBottom(), 50);
//       },

//       error: (err: any) => {
//         this.loading = false;

//         let errorMessage = 'Unable to get a response right now.';

//         if (err.status === 429) {
//           errorMessage = 'AI free quota reached. Please try again later.';
//         } else if (err.status === 401) {
//           errorMessage = 'Your session has expired. Please login again.';
//         } else if (err.status === 403) {
//           errorMessage = 'You are not allowed to access this information.';
//         } else if (err.error?.detail) {
//           errorMessage = err.error.detail;
//         } else if (err.error?.message) {
//           errorMessage = err.error.message;
//         }

//         this.messages.push({
//           sender: 'AI',
//           text: errorMessage,
//           error: true,
//           timestamp: new Date(),
//         });

//         this.cdr.detectChanges();

//         setTimeout(() => this.scrollToBottom(), 50);
//       },
//     });
//   }

//   // =========================================================
//   // ENTER KEY
//   // =========================================================

//   onEnter(event: Event): void {
//     const keyboardEvent = event as KeyboardEvent;

//     if (keyboardEvent.shiftKey) {
//       return;
//     }

//     keyboardEvent.preventDefault();

//     this.sendMessage();
//   }

//   // =========================================================
//   // CLEAR CHAT
//   // =========================================================

//   clearChat(): void {
//     if (this.loading) {
//       return;
//     }

//     this.messages = [
//       {
//         sender: 'AI',
//         text: 'Chat cleared. How can I help you?',
//         timestamp: new Date(),
//       },
//     ];

//     this.cdr.detectChanges();

//     setTimeout(() => this.scrollToBottom(), 50);
//   }

//   // =========================================================
//   // MARKDOWN FORMAT
//   // =========================================================

//   formatMessage(text: string): string {
//     if (!text) {
//       return '';
//     }

//     return marked.parse(text) as string;
//   }

//   // =========================================================
//   // SCROLL
//   // =========================================================

//   private scrollToBottom(): void {
//     try {
//       const element = this.chatBody?.nativeElement;

//       if (!element) {
//         return;
//       }

//       element.scrollTop = element.scrollHeight;
//     } catch {}
//   }
// }

import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { marked } from 'marked';

import { AiChatService } from './ai-chat.service';

interface ChatMessage {
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
  chatBody!: ElementRef;

  private readonly CHAT_STORAGE_KEY = 'ems_ai_chat_history';

  isOpen = false;

  loading = false;

  message = '';

  role = localStorage.getItem('role') || '';

  messages: ChatMessage[] = [];

  constructor(
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadChatHistory();
  }

  // =========================================================
  // QUICK QUESTIONS
  // =========================================================

  get quickQuestions(): string[] {
    if (this.role === 'ADMIN') {
      return [
        'How many employees are present today?',
        'How many pending leave requests are there?',
        "What is this month's payroll?",
        'When is the next holiday?',
      ];
    }

    return [
      'What is my attendance this month?',
      'How many pending leaves do I have?',
      'What is my latest salary?',
      'When is the next holiday?',
    ];
  }

  // =========================================================
  // OPEN / CLOSE
  // =========================================================

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 50);
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

    // USER MESSAGE

    this.messages.push({
      sender: 'USER',
      text,
      timestamp: new Date(),
    });

    this.saveChatHistory();

    this.message = '';

    this.loading = true;

    this.cdr.detectChanges();

    setTimeout(() => this.scrollToBottom(), 20);

    // API CALL

    this.aiChatService.sendMessage(text).subscribe({
      next: (res: any) => {
        this.messages.push({
          sender: 'AI',

          text: res?.answer || 'No response received.',

          timestamp: res?.timestamp ? new Date(res.timestamp) : new Date(),
        });

        // SAVE AI RESPONSE

        this.saveChatHistory();

        this.loading = false;

        this.cdr.detectChanges();

        setTimeout(() => this.scrollToBottom(), 50);
      },

      error: (err: any) => {
        this.loading = false;

        let errorMessage = 'Unable to get a response right now.';

        if (err.status === 429) {
          errorMessage = 'AI free quota reached. Please try again later.';
        } else if (err.status === 401) {
          errorMessage = 'Your session has expired. Please login again.';
        } else if (err.status === 403) {
          errorMessage = 'You are not allowed to access this information.';
        } else if (err.error?.detail) {
          errorMessage = err.error.detail;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.messages.push({
          sender: 'AI',
          text: errorMessage,
          error: true,
          timestamp: new Date(),
        });

        this.saveChatHistory();

        this.cdr.detectChanges();

        setTimeout(() => this.scrollToBottom(), 50);
      },
    });
  }

  // =========================================================
  // ENTER KEY
  // =========================================================

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    // SHIFT + ENTER = NEW LINE

    if (keyboardEvent.shiftKey) {
      return;
    }

    // ENTER = SEND

    keyboardEvent.preventDefault();

    this.sendMessage();
  }

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  clearChat(): void {
    if (this.loading) {
      return;
    }

    localStorage.removeItem(this.CHAT_STORAGE_KEY);

    this.messages = [this.getWelcomeMessage()];

    this.saveChatHistory();

    this.cdr.detectChanges();

    setTimeout(() => this.scrollToBottom(), 50);
  }

  // =========================================================
  // SAVE CHAT HISTORY
  // =========================================================

  private saveChatHistory(): void {
    try {
      localStorage.setItem(this.CHAT_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Unable to save AI chat history:', error);
    }
  }

  // =========================================================
  // LOAD CHAT HISTORY
  // =========================================================

  private loadChatHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.CHAT_STORAGE_KEY);

      if (!savedHistory) {
        this.messages = [this.getWelcomeMessage()];

        return;
      }

      const parsedMessages = JSON.parse(savedHistory);

      if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
        this.messages = [this.getWelcomeMessage()];

        return;
      }

      this.messages = parsedMessages.map((item: any) => ({
        ...item,

        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      }));
    } catch (error) {
      console.error('Unable to load AI chat history:', error);

      this.messages = [this.getWelcomeMessage()];
    }
  }

  // =========================================================
  // WELCOME MESSAGE
  // =========================================================

  private getWelcomeMessage(): ChatMessage {
    let text =
      'Hi! I can help you with attendance, leave, salary, holidays and other EMS information.';

    if (this.role === 'ADMIN') {
      text =
        'Hi! I can help you with employee attendance, pending leaves, payroll, holidays and other EMS information.';
    }

    return {
      sender: 'AI',
      text,
      timestamp: new Date(),
    };
  }

  // =========================================================
  // MARKDOWN
  // =========================================================

  formatMessage(text: string): string {
    if (!text) {
      return '';
    }

    return marked.parse(text) as string;
  }

  // =========================================================
  // SCROLL
  // =========================================================

  private scrollToBottom(): void {
    try {
      const element = this.chatBody?.nativeElement;

      if (!element) {
        return;
      }

      element.scrollTop = element.scrollHeight;
    } catch {}
  }
}
