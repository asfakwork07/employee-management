// import { Routes } from '@angular/router';
// import { GetEmployeeDetails } from './modules/employees/get-employee-details';
// import { authGuard } from './auth/guard/auth-guard';
// import { LoginComponent } from './auth/login/login';
// import { loginRedirectGuard } from './auth/guard/login-redirect.guard';
// import { Layout } from './layout/layout';
// import { Dashboard } from './modules/dashboard/dashboard/dashboard';
// import { Attendance } from './modules/attendance/attendance';
// import { Leaves } from './modules/leaves/leaves';
// import { Salary } from './modules/salary/salary';
// import { Roles } from './modules/roles/roles';
// import { Settings } from './modules/settings/settings';

// export const routes: Routes = [

// {
//     path:'',
//     redirectTo:'login',
//     pathMatch:'full'
// },

// {
//     path:'login',
//     component:LoginComponent,
//     canActivate:[
//         loginRedirectGuard
//     ]
// },

// {
//   path: '',
//   component: Layout,
//   canActivate: [authGuard],
//   children: [

//     {
//       path: '',
//       redirectTo: 'dashboard',
//       pathMatch: 'full'
//     },

//     {
//       path: 'dashboard',
//       component: Dashboard
//     },

//     {
//       path: 'employees',
//       component: GetEmployeeDetails
//     },

//     {
//       path: 'attendance',
//       component: Attendance
//     },

//     {
//       path: 'leaves',
//       component: Leaves
//     },

//     {
//       path: 'salary',
//       component: Salary
//     },

//     {
//       path: 'roles',
//       component: Roles
//     },

//     {
//       path: 'settings',
//       component: Settings
//     }

//   ]
// }

// ];
import { Routes } from '@angular/router';

import { GetEmployeeDetails } from './modules/employees/get-employee-details';

import { authGuard } from './auth/guard/auth-guard';
import { loginRedirectGuard } from './auth/guard/login-redirect.guard';

import { LoginComponent } from './auth/login/login';

import { Layout } from './layout/layout';

import { Dashboard } from './modules/dashboard/dashboard/dashboard';
import { Attendance } from './modules/attendance/attendance';
import { Leaves } from './modules/leaves/leaves';
import { Salary } from './modules/salary/salary';
import { Roles } from './modules/roles/roles';
import { Settings } from './modules/settings/settings';
import { roleGuard } from './auth/guard/role.guard';
import { Profile } from './modules/profile/profile';
import { Holidays } from './modules/holidays/holidays';

export const routes: Routes = [
  // =========================================
  // DEFAULT
  // =========================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // =========================================
  // LOGIN
  // =========================================

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginRedirectGuard],
  },

  // =========================================
  // AUTHENTICATED LAYOUT
  // =========================================

  {
    path: '',
    component: Layout,

    canActivate: [authGuard],

    children: [
      // =====================================
      // DEFAULT AFTER LOGIN
      // =====================================

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // =====================================
      // DASHBOARD
      // ADMIN + EMPLOYEE
      // =====================================

      {
        path: 'dashboard',
        component: Dashboard,

        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================
      // EMPLOYEES
      // ADMIN ONLY
      // =====================================

      {
        path: 'employees',
        component: GetEmployeeDetails,

        canActivate: [roleGuard(['ADMIN'])],
      },

      // =====================================
      // ATTENDANCE
      // ADMIN + EMPLOYEE
      // =====================================

      {
        path: 'attendance',
        component: Attendance,

        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================
      // LEAVES
      // ADMIN + EMPLOYEE
      // =====================================

      {
        path: 'leaves',
        component: Leaves,

        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================
      // SALARY
      // ADMIN + EMPLOYEE
      // =====================================

      {
        path: 'salary',
        component: Salary,

        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },

      // =====================================
      // ROLES
      // ADMIN ONLY
      // =====================================

      {
        path: 'roles',
        component: Roles,

        canActivate: [roleGuard(['ADMIN'])],
      },

      // =====================================
      // SETTINGS
      // ADMIN ONLY
      // =====================================

      {
        path: 'settings',
        component: Settings,

        canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'profile',
        component: Profile,

        canActivate: [roleGuard(['EMPLOYEE'])],
      },
      {
        path: 'holidays',
        component: Holidays,
        canActivate: [roleGuard(['ADMIN', 'EMPLOYEE'])],
      },
    ],
  },

  // =========================================
  // UNKNOWN ROUTE
  // =========================================

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
