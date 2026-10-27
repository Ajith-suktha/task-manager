import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

/** Shape of Spring Boot Actuator's /actuator/health response (only what we use). */
interface HealthResponse {
  status: string;
}

/**
 * up: backend and database are healthy.
 * down: backend answered but reports a problem (for example the database is unavailable).
 * unreachable: no usable answer (backend not running, network or proxy error).
 */
export type BackendStatus = 'up' | 'down' | 'unreachable';

// A service is a plain class registered with dependency injection; like a repository wrapping Dio.
// providedIn: 'root' makes it a single shared instance.
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  /** Relative URL: in dev the proxy forwards it to the backend (see proxy.conf.json). */
  check(): Observable<BackendStatus> {
    return this.http.get<HealthResponse>('/actuator/health').pipe(
      map((body) => (body.status === 'UP' ? 'up' : 'down')),
      // Actuator answers 503 with {"status":"DOWN"} when unhealthy; HttpClient treats that as an error.
      catchError((error: unknown) => of<BackendStatus>(isReportedDown(error) ? 'down' : 'unreachable')),
    );
  }
}

function isReportedDown(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 503) {
    return false;
  }
  const body: unknown = error.error;
  return typeof body === 'object' && body !== null && (body as HealthResponse).status === 'DOWN';
}
