import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../app/modules/services/loader-service';


@Component({
  selector: 'app-loader',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./loader.html'
})
export class LoaderComponent {


loading$;


constructor(
 private loaderService:LoaderService
){

 this.loading$ = this.loaderService.loader$;

}

}