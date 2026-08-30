// import { HttpInterceptorFn } from "@angular/common/http";
// import { LoaderService } from "../modules/services/loader-service";
// import { inject } from "@angular/core";
// import { finalize } from "rxjs";


// export const authInterceptor: HttpInterceptorFn = (req, next) => {

//   const loaderService = inject(LoaderService);

//   loaderService.show();


//   const token = localStorage.getItem('token');


//   let clonedRequest = req;


//   if (token) {

//     clonedRequest = req.clone({

//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }

//     });

//   }


//   return next(clonedRequest).pipe(

//     finalize(() => {

//       loaderService.hide();

//     })

//   );

// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoaderService } from '../modules/services/loader-service';
import { SKIP_GLOBAL_LOADER } from './http-context.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const token = localStorage.getItem('token');

  const skipGlobalLoader = req.context.get(SKIP_GLOBAL_LOADER);

  let clonedRequest = req;

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Is API ke liye global loader nahi chalega
  if (skipGlobalLoader) {
    return next(clonedRequest);
  }

  loaderService.show();

  return next(clonedRequest).pipe(
    finalize(() => {
      loaderService.hide();
    }),
  );
};