import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BackendStatus, HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HealthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Sends the request, answers it, and returns what the service emitted.
  function check(respond: (req: ReturnType<HttpTestingController['expectOne']>) => void): BackendStatus | undefined {
    let result: BackendStatus | undefined;
    service.check().subscribe((s) => (result = s));
    respond(http.expectOne('/actuator/health'));
    return result;
  }

  it('reports up when the backend says UP', () => {
    expect(check((req) => req.flush({ status: 'UP' }))).toBe('up');
  });

  it('reports down when a 200 response says something other than UP', () => {
    expect(check((req) => req.flush({ status: 'OUT_OF_SERVICE' }))).toBe('down');
  });

  it('reports down when the backend answers 503 with status DOWN', () => {
    const result = check((req) => req.flush({ status: 'DOWN' }, { status: 503, statusText: 'Service Unavailable' }));
    expect(result).toBe('down');
  });

  it('reports unreachable for other server errors (for example a proxy error)', () => {
    const result = check((req) => req.flush('proxy error', { status: 500, statusText: 'Server Error' }));
    expect(result).toBe('unreachable');
  });

  it('reports unreachable for a 503 that is not a health response', () => {
    const result = check((req) => req.flush('maintenance', { status: 503, statusText: 'Service Unavailable' }));
    expect(result).toBe('unreachable');
  });

  it('reports unreachable on a network failure', () => {
    expect(check((req) => req.error(new ProgressEvent('error')))).toBe('unreachable');
  });
});
