import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: any = null;

  loading = false;

  errorMessage = '';

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.errorMessage = '';

    this.profileService.getMyProfile().subscribe({
      next: (res: any) => {
        this.profile = res;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Profile loading error:', err);

        this.errorMessage =
          err.error?.detail || err.error?.message || err.error || 'Unable to load profile.';

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getInitials(): string {
    if (!this.profile) {
      return 'E';
    }

    const first = this.profile.firstName?.charAt(0) || '';

    const last = this.profile.lastName?.charAt(0) || '';

    return (first + last).toUpperCase();
  }
}
