import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  {
    path: 'metalprice',
    loadComponent: () => import('./metalprice/metalprice').then((m) => m.Metalprice),
    data: { caption: 'Metalprice' }
  },
  {
    path: 'forexrate',
    loadComponent: () => import('./forexrate/forexrate').then((m) => m.Forexrate),
    data: { caption: 'Forexrate' }
  }
];

