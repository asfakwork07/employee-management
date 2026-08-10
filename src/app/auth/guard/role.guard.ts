// import { jwtDecode } from 'jwt-decode';


// export const roleGuard=(role:string)=>()=>{


// const token =
// localStorage.getItem('token');


// if(!token)
// return false;


// const decoded:any =
// jwtDecode(token);



// return decoded.role === role;


// }
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export const roleGuard = (allowedRoles: string[]) => () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  // Token nahi hai
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  try {

    const decoded: any = jwtDecode(token);

    const userRole = decoded.role;

    // Role allowed hai
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Role allowed nahi hai
    return router.createUrlTree(['/dashboard']);

  } catch (error) {

    console.error('Invalid token:', error);

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');

    return router.createUrlTree(['/login']);
  }
};