import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  activeTab: 'company' | 'attendance' | 'leave' | 'salary' | 'security' = 'company';

  loading = false;

  saving = false;

  settingsId: number | null = null;

  company = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  attendance = {
    officeStartTime: '',
    officeEndTime: '',
    workingHours: 0,
    gracePeriod: 0,
  };

  leave = {
    casualLeave: 0,
    sickLeave: 0,
    earnedLeave: 0,
  };

  salary = {
    pfPercentage: 0,
    hraPercentage: 0,
    professionalTax: 0,
    allowance: 0,
  };

  security = {
    minimumPasswordLength: 8,
    sessionTimeout: 60,
    forcePasswordChange: false,
  };

  constructor(
    private settingsService: SettingsService,

    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  changeTab(tab: 'company' | 'attendance' | 'leave' | 'salary' | 'security'): void {
    this.activeTab = tab;
  }

  loadSettings(): void {
    this.loading = true;

    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        console.log('Settings:', res);

        this.settingsId = res.id;

        this.company = {
          name: res.companyName || '',

          email: res.companyEmail || '',

          phone: res.companyPhone || '',

          address: res.companyAddress || '',
        };

        this.attendance = {
          officeStartTime: res.officeStartTime || '',

          officeEndTime: res.officeEndTime || '',

          workingHours: Number(res.workingHours || 0),

          gracePeriod: Number(res.gracePeriod || 0),
        };

        this.leave = {
          casualLeave: Number(res.casualLeave || 0),

          sickLeave: Number(res.sickLeave || 0),

          earnedLeave: Number(res.earnedLeave || 0),
        };

        this.salary = {
          pfPercentage: Number(res.pfPercentage || 0),

          hraPercentage: Number(res.hraPercentage || 0),

          professionalTax: Number(res.professionalTax || 0),

          allowance: Number(res.defaultAllowance || 0),
        };

        this.security = {
          minimumPasswordLength: Number(res.minimumPasswordLength || 8),

          sessionTimeout: Number(res.sessionTimeout || 60),

          forcePasswordChange: res.forcePasswordChange === true,
        };

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Settings loading error:', err);

        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Load Settings',
          text: err.error?.detail || err.error?.message || 'Unable to load system settings.',
        });

        this.cdr.detectChanges();
      },
    });
  }

  saveSettings(): void {
    if (!this.company.name.trim()) {
      Swal.fire('Company Name Required', 'Please enter company name.', 'warning');

      return;
    }

    if (!this.company.email.trim()) {
      Swal.fire('Company Email Required', 'Please enter company email.', 'warning');

      return;
    }

    if (this.attendance.workingHours <= 0) {
      Swal.fire('Invalid Working Hours', 'Working hours must be greater than 0.', 'warning');

      return;
    }

    if (this.security.minimumPasswordLength < 6) {
      Swal.fire(
        'Invalid Password Length',
        'Minimum password length should be at least 6 characters.',
        'warning',
      );

      return;
    }

    const request = {
      companyName: this.company.name.trim(),

      companyEmail: this.company.email.trim(),

      companyPhone: this.company.phone.trim(),

      companyAddress: this.company.address.trim(),

      officeStartTime: this.attendance.officeStartTime,

      officeEndTime: this.attendance.officeEndTime,

      workingHours: Number(this.attendance.workingHours),

      gracePeriod: Number(this.attendance.gracePeriod),

      casualLeave: Number(this.leave.casualLeave),

      sickLeave: Number(this.leave.sickLeave),

      earnedLeave: Number(this.leave.earnedLeave),

      pfPercentage: Number(this.salary.pfPercentage),

      hraPercentage: Number(this.salary.hraPercentage),

      professionalTax: Number(this.salary.professionalTax),

      defaultAllowance: Number(this.salary.allowance),

      minimumPasswordLength: Number(this.security.minimumPasswordLength),

      sessionTimeout: Number(this.security.sessionTimeout),

      forcePasswordChange: this.security.forcePasswordChange,
    };

    this.saving = true;

    this.settingsService.updateSettings(request).subscribe({
      next: (res: any) => {
        this.saving = false;

        Swal.fire({
          icon: 'success',
          title: 'Settings Saved',
          text: 'System settings updated successfully.',
          confirmButtonText: 'Done',
        });

        this.loadSettings();
      },

      error: (err: any) => {
        console.error('Settings save error:', err);

        this.saving = false;

        Swal.fire({
          icon: 'error',
          title: 'Unable to Save Settings',
          text:
            err.error?.detail ||
            err.error?.message ||
            'Something went wrong while saving settings.',
        });

        this.cdr.detectChanges();
      },
    });
  }
}
