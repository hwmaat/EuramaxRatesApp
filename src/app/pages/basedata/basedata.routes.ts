import { Routes } from '@angular/router';
import { Ovensettings } from './ovensettings/ovensettings';
import { Metalspecifications } from './metalspecifications/metalspecifications';



export const routes: Routes = [
  { path: 'ovensettings', component: Ovensettings, data: { caption: 'Ovensettings' }},
  { path: 'metalspecs', component: Metalspecifications, data: { caption: 'Metal Specifications' }},
  { path: 'finishes', loadComponent: () => import('./finishes/finishes').then(m => m.Finishes), data: { caption: 'Finishes' }},
  { path: 'paints', loadComponent: () => import('./paints/paints').then(m => m.Paints), data: { caption: 'Paints' }},
  { path: 'linespeeds', loadComponent: () => import('./linespeeds/linespeeds').then(m => m.Linespeeds), data: { caption: 'Linespeeds' }},
  { path: 'specmetrics', loadComponent: () => import('./specmetrics/specmetrics').then(m => m.Specmetrics), data: { caption: 'Specmetrics' }},
  { path: 'ovensettings', loadComponent: () => import('./ovensettings/ovensettings').then(m => m.Ovensettings), data: { caption: 'Oven Settings' }},
  { path: 'peakmetaltemp', loadComponent: () => import('./peakmetaltemp/peakmetaltemp').then(m => m.Peakmetaltemp), data: { caption: 'Peak Metal Temp' }},
  { path: 'productionlines', loadComponent: () => import('./productionlines/productionlines').then(m => m.Productionlines), data: { caption: 'Production Lines' }},
];