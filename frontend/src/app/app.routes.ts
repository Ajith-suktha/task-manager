import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Lazy route: this page's code is downloaded only when the route is first opened.
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  { path: '**', redirectTo: '' },
];
