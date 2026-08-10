import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { RouterModule } from '@angular/router';
import { AiChat } from '../modules/ai-chat/ai-chat';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, Sidebar, Navbar, RouterModule,AiChat],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
   sidebarCollapsed = false;

  onSidebarToggle(
    collapsed: boolean
  ): void {

    this.sidebarCollapsed = collapsed;
  }
}
