import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth/login', loadComponent: () => import('@features/auth/pages/login.page').then(m => m.LoginPageComponent) },
  { path: '**', redirectTo: 'auth/login' }
];
