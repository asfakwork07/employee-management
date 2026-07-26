import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';


export const loginRedirectGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');


  if(token){

    router.navigate(['/home']);
    return false;

  }


  return true;

};