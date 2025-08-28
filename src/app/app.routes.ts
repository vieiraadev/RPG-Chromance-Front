import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard'; // ajuste o caminho conforme sua estrutura

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('@features/auth/pages/login.page').then(m => m.LoginPageComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('@features/auth/pages/signup.page').then(m => m.SignupPage)
  },
  {
    path: 'home',
    loadComponent: () => import('@features/game/pages/home.page').then(m => m.HomePageComponent),
    canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: 'auth/login' }
];