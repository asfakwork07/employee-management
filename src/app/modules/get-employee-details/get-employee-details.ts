// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import Swal from 'sweetalert2';
// import {
//   ChangeDetectorRef,
//   ChangeDetectionStrategy
// } from '@angular/core';
// import { EmployeeService } from '../services/employee';
// import { Router, RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-get-employee-details',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './get-employee-details.html',
//   styleUrl: './get-employee-details.css'
// })
// export class GetEmployeeDetails implements OnInit {

//   employees: any[] = [];
//   filteredEmployees: any[] = [];
//   showModal = false;
//   searchText: string = '';
//   isEditMode = false;
//   selectedEmployeeId!: number;
//   sortColumn: string = '';
//   sortDirection: boolean = true;
//   employeeForm!: FormGroup;

//   constructor(private employeeService: EmployeeService, private cdr: ChangeDetectorRef,
//     private fb: FormBuilder, private router: Router
//   ) {
//     this.employeeForm = this.fb.group({

//       firstName: ['', Validators.required],

//       lastName: ['', Validators.required],

//       email: ['', [Validators.required, Validators.email]],

//       phone: ['', Validators.required],

//       department: ['', Validators.required],

//       designation: ['', Validators.required],

//       salary: ['', Validators.required],

//       joiningDate: ['', Validators.required],

//       status: ['Active', Validators.required]

//     });
//   }

//   ngOnInit(): void {
//     this.getEmployees();
//   }

//   getEmployees(): void {
//     this.employeeService.getAllEmployees().subscribe({
//       next: (data: any[]) => {
//         console.log(data)
//         this.employees = data;
//         this.cdr.markForCheck();   // or this.cdr.detectChanges();
//         this.filteredEmployees = data;
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   // Search
//   searchEmployee(): void {

//     const value = this.searchText.trim().toLowerCase();

//     if (!value) {
//       this.filteredEmployees = [...this.employees];
//       return;
//     }

//     this.filteredEmployees = this.employees.filter(emp =>
//       emp.firstName.toLowerCase().includes(value) ||
//       emp.lastName.toLowerCase().includes(value) ||
//       emp.email.toLowerCase().includes(value)
//     );
//   }

//   // Sorting
//   sort(column: string) {

//     this.sortDirection = this.sortColumn === column ? !this.sortDirection : true;

//     this.sortColumn = column;

//     this.filteredEmployees.sort((a, b) => {

//       const x = a[column];
//       const y = b[column];

//       if (x < y) return this.sortDirection ? -1 : 1;
//       if (x > y) return this.sortDirection ? 1 : -1;

//       return 0;

//     });

//   }

//   // View
//   viewEmployee(employee: any) {
//     console.log(employee);
//   }

//   // Edit
//   editEmployee(employee: any) {

//     this.isEditMode = true;
//     this.selectedEmployeeId = employee.id;

//     this.employeeForm.patchValue(employee);

//     this.openModal();

//   }

//   openModal() {
//     this.showModal = true;
//   }
//   saveEmployee() {

//     if (this.employeeForm.invalid) {
//       this.employeeForm.markAllAsTouched();
//       return;
//     }

//     if (this.isEditMode) {

//       this.employeeService
//         .updateEmployee(this.selectedEmployeeId, this.employeeForm.value)
//         .subscribe(() => {

//           Swal.fire('Updated!', 'Employee updated successfully.', 'success');

//           this.getEmployees();
//           this.closeModal();

//           this.employeeForm.reset({ status: 'Active' });
//           this.isEditMode = false;

//         });

//     } else {

//       this.employeeService
//         .addEmployee(this.employeeForm.value)
//         .subscribe(() => {

//           Swal.fire('Added!', 'Employee added successfully.', 'success');

//           this.getEmployees();
//           this.closeModal();

//           this.employeeForm.reset({ status: 'Active' });

//         });

//     }

//   }


//   closeModal() {
//     this.showModal = false;
//   }
//   // Delete
//   deleteEmployee(id: number) {

//     Swal.fire({
//       title: 'Delete Employee?',
//       text: 'This record will be deleted permanently.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Delete',
//       cancelButtonText: 'Cancel'
//     }).then(result => {

//       if (result.isConfirmed) {

//         this.employeeService.deleteEmployee(id).subscribe({

//           next: () => {

//             Swal.fire(
//               'Deleted!',
//               'Employee deleted successfully.',
//               'success'
//             );

//             this.getEmployees();

//           },

//           error: () => {

//             Swal.fire(
//               'Error',
//               'Unable to delete employee.',
//               'error'
//             );

//           }

//         });

//       }

//     });

//   }
// logout(){

//   localStorage.removeItem('token');

//   this.router.navigate(['/login']);

// }
// }

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import Swal from 'sweetalert2';
import { EmployeeService } from '../services/employee';
import { Router } from '@angular/router';

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
  paginatedEmployees: any[] = [];

  showModal = false;
  searchText = '';

  isEditMode = false;
  selectedEmployeeId!: number;

  sortColumn = '';
  sortDirection = true;

  employeeForm!: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
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

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {

    this.employeeService.getAllEmployees().subscribe({

      next: (data: any[]) => {

        this.employees = data;
        this.filteredEmployees = [...data];

        this.currentPage = 1;

        this.updatePagination();

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

  // ---------------- SEARCH ----------------

  searchEmployee() {

    const value = this.searchText.trim().toLowerCase();

    if (!value) {

      this.filteredEmployees = [...this.employees];

    } else {

      this.filteredEmployees = this.employees.filter(emp =>

        emp.firstName.toLowerCase().includes(value) ||
        emp.lastName.toLowerCase().includes(value) ||
        emp.email.toLowerCase().includes(value)

      );

    }

    this.currentPage = 1;

    this.updatePagination();

  }

  // ---------------- SORT ----------------

  sort(column: string) {

    this.sortDirection =
      this.sortColumn === column
        ? !this.sortDirection
        : true;

    this.sortColumn = column;

    this.filteredEmployees.sort((a, b) => {

      const x = a[column];
      const y = b[column];

      if (x < y) return this.sortDirection ? -1 : 1;
      if (x > y) return this.sortDirection ? 1 : -1;

      return 0;

    });

    this.updatePagination();

  }

  // ---------------- PAGINATION ----------------

  updatePagination() {

    this.totalPages = Math.ceil(
      this.filteredEmployees.length / this.itemsPerPage
    );

    const start =
      (this.currentPage - 1) * this.itemsPerPage;

    const end = start + this.itemsPerPage;

    this.paginatedEmployees =
      this.filteredEmployees.slice(start, end);

  }

  previousPage() {

    if (this.currentPage > 1) {

      this.currentPage--;

      this.updatePagination();

    }

  }

  nextPage() {

    if (this.currentPage < this.totalPages) {

      this.currentPage++;

      this.updatePagination();

    }

  }

  goToPage(page: number) {

    this.currentPage = page;

    this.updatePagination();

  }

  get pages() {

    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

  }

  get endRecord() {

    return Math.min(

      this.currentPage * this.itemsPerPage,

      this.filteredEmployees.length

    );

  }



  // ---------------- EDIT ----------------

  editEmployee(employee: any) {

    this.isEditMode = true;

    this.selectedEmployeeId = employee.id;

    this.employeeForm.patchValue(employee);

    this.openModal();

  }

  openModal() {

    this.showModal = true;

  }

  closeModal() {

    this.showModal = false;

  }

  // ---------------- SAVE ----------------

  saveEmployee() {

    if (this.employeeForm.invalid) {

      this.employeeForm.markAllAsTouched();

      return;

    }

    if (this.isEditMode) {

      this.employeeService.updateEmployee(

        this.selectedEmployeeId,

        this.employeeForm.value

      ).subscribe(() => {

        Swal.fire(

          'Updated!',

          'Employee updated successfully.',

          'success'

        );

        this.getEmployees();

        this.closeModal();

        this.employeeForm.reset({

          status: 'Active'

        });

        this.isEditMode = false;

      });

    }

    else {

      this.employeeService.addEmployee(

        this.employeeForm.value

      ).subscribe(() => {

        Swal.fire(

          'Added!',

          'Employee added successfully.',

          'success'

        );

        this.getEmployees();

        this.closeModal();

        this.employeeForm.reset({

          status: 'Active'

        });

      });

    }

  }

  // ---------------- DELETE ----------------

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

        this.employeeService.deleteEmployee(id)

          .subscribe({

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

  selectedFile!: File;
  showImportModal = false;

  showImportModals() {

    this.showImportModal = true;

  }
  onFileSelected(event: any) {

    if (event.target.files.length > 0) {

      this.selectedFile = event.target.files[0];

    }

  }
  importExcel() {

    if (!this.selectedFile) {

      Swal.fire('Select Excel file first');

      return;

    }

    this.employeeService.importExcel(this.selectedFile)
      .subscribe({

        next: (res: any) => {

          Swal.fire({
            icon: 'success',
            title: 'Import Completed',
            text: res
          });

          this.showImportModal = false;
          // this.selectedFile=null;
          this.getEmployees();

        },

        error: () => {

          Swal.fire(
            'Error',
            'Import Failed',
            'error'
          );

        }

      });

  }

  // ---------------- LOGOUT ----------------

  logout() {

    localStorage.removeItem('token');

    this.router.navigate(['/login']);

  }

  selectedEmployee: any = null;
  showViewModal = false;

  viewEmployee(employee: any) {

    this.selectedEmployee = employee;

    this.showViewModal = true;

  }

  closeViewModal() {

    this.showViewModal = false;

  }

}