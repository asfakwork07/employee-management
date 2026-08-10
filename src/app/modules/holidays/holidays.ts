import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { HolidayService } from './holiday.service';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './holidays.html',
  styleUrl: './holidays.css',
})
export class Holidays implements OnInit {
  role = localStorage.getItem('role') || '';

  holidays: any[] = [];

  filteredHolidays: any[] = [];

  loading = false;

  showModal = false;

  isEditMode = false;

  selectedHolidayId: number | null = null;

  searchText = '';

  selectedType = 'ALL';

  holidayForm = {
    holidayDate: '',
    name: '',
    type: 'NATIONAL',
    description: '',
  };

  holidayTypes = ['NATIONAL', 'FESTIVAL', 'OPTIONAL', 'COMPANY'];

  constructor(
    private holidayService: HolidayService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.loading = true;

    this.holidayService.getAllHolidays().subscribe({
      next: (res: any[]) => {
        this.holidays = res || [];

        this.filteredHolidays = [...this.holidays];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Holiday loading error:', err);

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredHolidays = this.holidays.filter((holiday) => {
      const matchesSearch =
        !search ||
        holiday.name?.toLowerCase().includes(search) ||
        holiday.description?.toLowerCase().includes(search);

      const matchesType = this.selectedType === 'ALL' || holiday.type === this.selectedType;

      return matchesSearch && matchesType;
    });
  }

  resetFilters(): void {
    this.searchText = '';

    this.selectedType = 'ALL';

    this.filteredHolidays = [...this.holidays];
  }

  openAddModal(): void {
    this.isEditMode = false;

    this.selectedHolidayId = null;

    this.holidayForm = {
      holidayDate: '',
      name: '',
      type: 'NATIONAL',
      description: '',
    };

    this.showModal = true;
  }

  editHoliday(holiday: any): void {
    this.isEditMode = true;

    this.selectedHolidayId = holiday.id;

    this.holidayForm = {
      holidayDate: holiday.holidayDate || '',

      name: holiday.name || '',

      type: holiday.type || 'NATIONAL',

      description: holiday.description || '',
    };

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;

    this.isEditMode = false;

    this.selectedHolidayId = null;
  }

  saveHoliday(): void {
    if (!this.holidayForm.holidayDate || !this.holidayForm.name || !this.holidayForm.type) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Holiday date, name and type are required.',
      });

      return;
    }

    const request = {
      holidayDate: this.holidayForm.holidayDate,

      name: this.holidayForm.name.trim(),

      type: this.holidayForm.type,

      description: this.holidayForm.description?.trim() || '',
    };

    if (this.isEditMode && this.selectedHolidayId) {
      this.holidayService.updateHoliday(this.selectedHolidayId, request).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Holiday Updated',
            text: 'Holiday updated successfully.',
          });

          this.closeModal();

          this.loadHolidays();
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Unable to Update Holiday',
            text: err.error?.detail || err.error?.message || err.error || 'Something went wrong.',
          });
        },
      });

      return;
    }

    this.holidayService.createHoliday(request).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Holiday Added',
          text: 'Holiday created successfully.',
        });

        this.closeModal();

        this.loadHolidays();
      },

      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Unable to Add Holiday',
          text: err.error?.detail || err.error?.message || err.error || 'Something went wrong.',
        });
      },
    });
  }

  deleteHoliday(holiday: any): void {
    Swal.fire({
      title: 'Delete Holiday?',
      text: `${holiday.name} will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.holidayService.deleteHoliday(holiday.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: 'Holiday deleted successfully.',
          });

          this.loadHolidays();
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Unable to Delete Holiday',
            text: err.error?.detail || err.error?.message || err.error || 'Something went wrong.',
          });
        },
      });
    });
  }

  get totalHolidays(): number {
    return this.holidays.length;
  }

  get upcomingHolidays(): number {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return this.holidays.filter((holiday) => {
      const date = new Date(holiday.holidayDate);

      return date >= today;
    }).length;
  }

  get nationalHolidays(): number {
    return this.holidays.filter((holiday) => holiday.type === 'NATIONAL').length;
  }

  get festivalHolidays(): number {
    return this.holidays.filter((holiday) => holiday.type === 'FESTIVAL').length;
  }

  isUpcoming(holidayDate: string): boolean {
    const holiday = new Date(holidayDate);

    holiday.setHours(0, 0, 0, 0);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return holiday >= today;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'NATIONAL':
        return 'bg-blue-100 text-blue-700';

      case 'FESTIVAL':
        return 'bg-purple-100 text-purple-700';

      case 'OPTIONAL':
        return 'bg-yellow-100 text-yellow-700';

      case 'COMPANY':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
