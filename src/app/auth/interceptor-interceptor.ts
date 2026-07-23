import { HttpInterceptorFn } from "@angular/common/http";
import { LoaderService } from "../../Module/services/loader-service";
import { inject } from "@angular/core";
import { finalize } from "rxjs";


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const loaderService = inject(LoaderService);

  loaderService.show();


  const token = localStorage.getItem('token');


  let clonedRequest = req;


  if (token) {

    clonedRequest = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }

    });

  }


  return next(clonedRequest).pipe(

    finalize(() => {

      loaderService.hide();

    })

  );

};