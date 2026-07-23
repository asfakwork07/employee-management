import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { EmployeeService } from '../../services/employee';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.css'
})
export class AddEmployee {

  employeeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {

    this.employeeForm = this.fb.group({

      firstName: ['', Validators.required],

      lastName: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', Validators.required],

      department: ['', Validators.required],

      designation: ['', Validators.required],

      salary: ['', Validators.required],

      joiningDate: ['', Validators.required],

      status: ['Active', Validators.required]

    });

  }

  saveEmployee() {

    if (this.employeeForm.invalid) {

      this.employeeForm.markAllAsTouched();

      return;

    }

    this.employeeService.addEmployee(this.employeeForm.value).subscribe({

      next: () => {

        Swal.fire(
          'Success',
          'Employee Added Successfully',
          'success'
        );

        this.router.navigate(['/']);

      },

      error: () => {

        Swal.fire(
          'Error',
          'Unable to Save Employee',
          'error'
        );

      }

    });

  }

}