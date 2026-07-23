import { Routes } from '@angular/router';
import { GetEmployeeDetails } from '../Module/employee/get-employee-details/get-employee-details';
import { AddEmployee } from '../Module/employee/add-employee/add-employee';
import { authGuard } from './auth/guard/auth-guard';
import { LoginComponent } from './auth/login/login';


export const routes: Routes = [
     {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: 'home',
        component: GetEmployeeDetails,
        canActivate: [
            authGuard
        ]
    },
];