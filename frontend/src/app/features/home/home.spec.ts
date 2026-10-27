import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BackendStatus, HealthService } from '../../core/api/health.service';
import { Home } from './home';

describe('Home', () => {
  let pending: Subject<BackendStatus>;
  let checks: number;

  async function render() {
    pending = new Subject<BackendStatus>();
    checks = 0;
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: () => {
              checks++;
              return pending;
            },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      status: () => el.querySelector('[data-testid="backend-status"]')?.textContent?.trim(),
      button: () => el.querySelector('button'),
    };
  }

  it('shows the welcome card and a checking state while waiting', async () => {
    const page = await render();
    expect(page.el.textContent).toContain('Welcome');
    expect(page.status()).toContain('checking');
    expect(page.button()).toBeNull();
  });

  it.each([
    ['up', 'connected'],
    ['down', 'reports a problem'],
    ['unreachable', 'unreachable'],
  ] as [BackendStatus, string][])('shows the %s state', async (state, text) => {
    const page = await render();
    pending.next(state);
    await page.fixture.whenStable();
    expect(page.status()).toContain(text);
    expect(page.button()).not.toBeNull();
  });

  it('checks again when the button is clicked', async () => {
    const page = await render();
    pending.next('unreachable');
    await page.fixture.whenStable();
    expect(checks).toBe(1);

    page.button()?.click();
    await page.fixture.whenStable();
    expect(checks).toBe(2);
    expect(page.status()).toContain('checking');
  });
});
