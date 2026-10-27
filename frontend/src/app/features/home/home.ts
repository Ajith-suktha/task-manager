import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { BackendStatus, HealthService } from '../../core/api/health.service';

// Placeholder landing page showing backend connectivity. Replaced by the dashboard in Phase 5.
@Component({
  selector: 'app-home',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatButton],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly health = inject(HealthService);
  private readonly destroyRef = inject(DestroyRef);

  // A signal is a value Angular watches (like a ValueNotifier whose readers rebuild automatically).
  protected readonly status = signal<BackendStatus | 'checking'>('checking');

  constructor() {
    this.check();
  }

  protected check(): void {
    this.status.set('checking');
    this.health
      .check()
      .pipe(takeUntilDestroyed(this.destroyRef)) // stop listening if the page is closed
      .subscribe((result) => this.status.set(result));
  }
}
