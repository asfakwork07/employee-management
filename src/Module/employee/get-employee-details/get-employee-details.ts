import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { EmployeeService } from '../../services/employee';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-get-employee-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './get-employee-details.html',
  styleUrl: './get-employee-details.css'
})
export class GetEmployeeDetails implements OnInit {

  employees: any[] = [];
  filteredEmployees: any[] = [];
  showModal = false;
  searchText: string = '';
  isEditMode = false;
  selectedEmployeeId!: number;
  sortColumn: string = '';
  sortDirection: boolean = true;
  employeeForm!: FormGroup;

  constructor(private employeeService: EmployeeService, private cdr: ChangeDetectorRef,
    private fb: FormBuilder, private router: Router
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

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data: any[]) => {
        console.log(data)
        this.employees = data;
        this.cdr.markForCheck();   // or this.cdr.detectChanges();
        this.filteredEmployees = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Search
  searchEmployee(): void {

    const value = this.searchText.trim().toLowerCase();

    if (!value) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter(emp =>
      emp.firstName.toLowerCase().includes(value) ||
      emp.lastName.toLowerCase().includes(value) ||
      emp.email.toLowerCase().includes(value)
    );
  }

  // Sorting
  sort(column: string) {

    this.sortDirection = this.sortColumn === column ? !this.sortDirection : true;

    this.sortColumn = column;

    this.filteredEmployees.sort((a, b) => {

      const x = a[column];
      const y = b[column];

      if (x < y) return this.sortDirection ? -1 : 1;
      if (x > y) return this.sortDirection ? 1 : -1;

      return 0;

    });

  }

  // View
  viewEmployee(employee: any) {
    console.log(employee);
  }

  // Edit
  editEmployee(employee: any) {

    this.isEditMode = true;
    this.selectedEmployeeId = employee.id;

    this.employeeForm.patchValue(employee);

    this.openModal();

  }

  openModal() {
    this.showModal = true;
  }
  saveEmployee() {

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {

      this.employeeService
        .updateEmployee(this.selectedEmployeeId, this.employeeForm.value)
        .subscribe(() => {

          Swal.fire('Updated!', 'Employee updated successfully.', 'success');

          this.getEmployees();
          this.closeModal();

          this.employeeForm.reset({ status: 'Active' });
          this.isEditMode = false;

        });

    } else {

      this.employeeService
        .addEmployee(this.employeeForm.value)
        .subscribe(() => {

          Swal.fire('Added!', 'Employee added successfully.', 'success');

          this.getEmployees();
          this.closeModal();

          this.employeeForm.reset({ status: 'Active' });

        });

    }

  }
  // saveEmployee(): void {

  //   if (this.employeeForm.invalid) {
  //     this.employeeForm.markAllAsTouched();
  //     return;
  //   }

  //   this.employeeService.addEmployee(this.employeeForm.value).subscribe({

  //     next: () => {

  //       Swal.fire(
  //         'Success',
  //         'Employee Added Successfully',
  //         'success'
  //       );

  //       this.getEmployees();
  //       this.employeeForm.reset({
  //         status: 'Active'
  //       });

  //       this.closeModal();

  //     },

  //     error: () => {

  //       Swal.fire(
  //         'Error',
  //         'Unable to Save Employee',
  //         'error'
  //       );

  //     }

  //   });

  // }

  closeModal() {
    this.showModal = false;
  }
  // Delete
  deleteEmployee(id: number) {

    Swal.fire({
      title: 'Delete Employee?',
      text: 'This record will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {

      if (result.isConfirmed) {

        this.employeeService.deleteEmployee(id).subscribe({

          next: () => {

            Swal.fire(
              'Deleted!',
              'Employee deleted successfully.',
              'success'
            );

            this.getEmployees();

          },

          error: () => {

            Swal.fire(
              'Error',
              'Unable to delete employee.',
              'error'
            );

          }

        });

      }

    });

  }
logout(){

  localStorage.removeItem('token');

  this.router.navigate(['/login']);

}
}