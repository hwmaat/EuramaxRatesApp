import { Routes } from '@angular/router';
import { bootstrapGuard } from '@app/guards/bootstrap.guard';
import { authGuard } from '@app/guards/auth.guard';

import { Home } from './layout/home/home';
import { AuthenticationFailed } from './authentication-failed/authentication-failed';
import { Bootstrap } from './bootstrap/bootstrap';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', component: Bootstrap, canActivate: [bootstrapGuard], pathMatch: 'full', data: { caption: '' } },
  { path: 'login', component: Login, data: { caption: 'Login' } },
  { path: 'home', component: Home, canActivate: [authGuard], data: { caption: 'Home' } },
  {
    path: 'pages',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/pages.routes').then((m) => m.PAGES_ROUTES)
  },
  { path: 'authentication-failed', component: AuthenticationFailed, data: { caption: 'Authentication Failed' } },
  { path: '**', redirectTo: '' }
];