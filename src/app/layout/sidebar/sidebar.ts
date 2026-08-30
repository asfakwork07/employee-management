import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output()
  sidebarToggle = new EventEmitter<boolean>();

  role = localStorage.getItem('role') || '';

  isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  constructor(private router: Router) {}

  allMenus = [
    {
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      route: '/dashboard',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'My Profile',
      icon: 'bi bi-person-circle',
      route: '/profile',
      roles: ['EMPLOYEE'],
    },
    {
      title: 'Employees',
      icon: 'bi bi-people-fill',
      route: '/employees',
      roles: ['ADMIN'],
    },
    {
      title: 'Attendance',
      icon: 'bi bi-calendar-check',
      route: '/attendance',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Leaves',
      icon: 'bi bi-journal-text',
      route: '/leaves',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Salary',
      icon: 'bi bi-cash-stack',
      route: '/salary',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Roles',
      icon: 'bi bi-shield-lock',
      route: '/roles',
      roles: ['ADMIN'],
    },
    {
      title: 'Settings',
      icon: 'bi bi-gear',
      route: '/settings',
      roles: ['ADMIN'],
    },
    {
      title: 'Holidays',
      icon: 'bi bi-calendar-event',
      route: '/holidays',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
  ];

  get menus() {
    return this.allMenus.filter((menu) => menu.roles.includes(this.role));
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;

    localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('employeeName');
    localStorage.removeItem('department');
    localStorage.removeItem('designation');
    localStorage.removeItem('ems_ai_chat_history');

    this.router.navigate(['/login']);
  }
  logou1(): void {
    localStorage.clear();

    this.router.navigateByUrl('/login');
  }
}
