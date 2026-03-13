import { Routes } from '@angular/router';
import { Production } from './production/production';

export const routes: Routes = [
  { path: 'production', component: Production, data: { caption: 'Production planning' }},
];