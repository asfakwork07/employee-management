import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../authService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html'
})
export class LoginComponent {


  email = '';
  password = '';


  constructor(
    private authService: AuthService,
    private router: Router
  ) { }



  login() {


    const request = {
      email: this.email,
      password: this.password
    };


    this.authService.login(request)
      .subscribe({

        next: (response) => {

          console.log("Login Success", response);


          localStorage.setItem(
            'token',
            response.token
          );


          // Swal.fire({
          //   icon: 'success',
          //   title: 'Login Successful',
          //   text: 'Welcome back!',
          //   timer: 1500,
          //   showConfirmButton: false
          // });


          this.router.navigate(['/home']);

        },


        error: (err) => {


          console.error(
            "Login Failed",
            err
          );


          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: err.error?.detail ||
              err.error?.message ||
              'Invalid email or password'
          });


        }

      });


  }


}