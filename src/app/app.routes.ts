import { Routes } from '@angular/router';
import { GetEmployeeDetails } from './modules/get-employee-details/get-employee-details';
import { authGuard } from './auth/guard/auth-guard';
import { LoginComponent } from './auth/login/login';
import { loginRedirectGuard } from './auth/guard/login-redirect.guard';


export const routes: Routes = [

{
    path:'',
    redirectTo:'login',
    pathMatch:'full'
},

{
    path:'login',
    component:LoginComponent,
    canActivate:[
        loginRedirectGuard
    ]
},

{
    path:'home',
    component:GetEmployeeDetails,
    canActivate:[
        authGuard
    ]
}

];