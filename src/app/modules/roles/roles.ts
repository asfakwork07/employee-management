import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles {
  roles = [
    {
      name: 'ADMIN',
      title: 'Administrator',
      description: 'Full system access and employee management permissions.',
      icon: 'bi-shield-lock-fill',
      permissions: [
        'Manage Employees',
        'Manage Attendance',
        'Approve / Reject Leaves',
        'Generate Salary',
        'Manage Login Accounts',
        'View All Reports',
      ],
    },
    {
      name: 'EMPLOYEE',
      title: 'Employee',
      description: 'Limited access to personal employee data and self-service features.',
      icon: 'bi-person-badge-fill',
      permissions: [
        'View Own Dashboard',
        'Check In / Check Out',
        'Apply Leave',
        'View Own Leave History',
        'View Own Salary',
        'Change Password',
      ],
    },
  ];

  permissionMatrix = [
    {
      module: 'Dashboard',
      admin: 'Full Access',
      employee: 'Own Data',
    },
    {
      module: 'Employees',
      admin: 'Full Access',
      employee: 'No Access',
    },
    {
      module: 'Attendance',
      admin: 'All Employees',
      employee: 'Own Only',
    },
    {
      module: 'Leaves',
      admin: 'Manage All',
      employee: 'Own Only',
    },
    {
      module: 'Salary',
      admin: 'Manage All',
      employee: 'Own Only',
    },
    {
      module: 'Login Accounts',
      admin: 'Manage',
      employee: 'No Access',
    },
    {
      module: 'Change Password',
      admin: 'Allowed',
      employee: 'Allowed',
    },
  ];
}
