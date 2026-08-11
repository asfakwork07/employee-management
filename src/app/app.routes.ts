import { Routes } from '@angular/router';

import { GetEmployeeDetails } from './modules/employees/get-employee-details';

import { authGuard } from './auth/guard/auth-guard';
import { loginRedirectGuard } from './auth/guard/login-redirect.guard';
import { roleGuard } from './auth/guard/role.guard';

import { LoginComponent } from './auth/login/login';

import { Layout } from './layout/layout';

import { Dashboard } from './modules/dashboard/dashboard/dashboard';
import { Attendance } from './modules/attendance/attendance';
import { Leaves } from './modules/leaves/leaves';
import { Salary } from './modules/salary/salary';
import { Roles } from './modules/roles/roles';
import { Settings } from './modules/settings/settings';
import { Profile } from './modules/profile/profile';
import { Holidays } from './modules/holidays/holidays';
import { ForgotPassword } from './auth/forgot-password/forgot-password';

export const routes: Routes = [
  // =========================================================
  // DEFAULT
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // =========================================================
  // PUBLIC AUTH ROUTES
  // =========================================================

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginRedirectGuard],
  },

  {
    path: 'forgot-password',
    component: ForgotPassword,
    canActivate: [loginRedirectGuard],
  },

  // =========================================================
  // AUTHENTICATED APPLICATION
  // =========================================================

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],

    children: [
      // =====================================================
      // DEFAULT AFTER LOGIN
      // =====================================================

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // =====================================================
      // DASHBOARD
      // ADMIN + EMPLOYEE
      // =====================================================

      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================================
      // EMPLOYEES
      // ADMIN ONLY
      // =====================================================

      {
        path: 'employees',
        component: GetEmployeeDetails,
        canActivate: [roleGuard(['ADMIN'])],
      },

      // =====================================================
      // ATTENDANCE
      // ADMIN + EMPLOYEE
      // =====================================================

      {
        path: 'attendance',
        component: Attendance,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================================
      // LEAVES
      // ADMIN + EMPLOYEE
      // =====================================================

      {
        path: 'leaves',
        component: Leaves,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================================
      // SALARY
      // ADMIN + EMPLOYEE
      // =====================================================

      {
        path: 'salary',
        component: Salary,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================================
      // ROLES
      // ADMIN ONLY
      // =====================================================

      {
        path: 'roles',
        component: Roles,
        canActivate: [roleGuard(['ADMIN'])],
      },

      // =====================================================
      // SETTINGS
      // ADMIN ONLY
      // =====================================================

      {
        path: 'settings',
        component: Settings,
        canActivate: [roleGuard(['ADMIN'])],
      },

      // =====================================================
      // PROFILE
      // EMPLOYEE ONLY
      // =====================================================

      {
        path: 'profile',
        component: Profile,
        canActivate: [roleGuard(['EMPLOYEE'])],
      },

      // =====================================================
      // HOLIDAYS
      // ADMIN + EMPLOYEE
      // =====================================================

      {
        path: 'holidays',
        component: Holidays,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },
    ],
  },

  // =========================================================
  // UNKNOWN ROUTE
  // =========================================================

  {
    path: '**',
    redirectTo: 'login',
  },
];
