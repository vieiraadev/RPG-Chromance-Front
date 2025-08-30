import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth
  {
    path: 'auth/login',
    loadComponent: () =>
      import('@features/auth/pages/login.page').then(m => m.LoginPageComponent),
  },
  {
    path: 'auth/signup',
    loadComponent: () =>
      import('@features/auth/pages/signup.page').then(m => m.SignupPage),
  },

  // Home 
  {
    path: 'home',
    loadComponent: () =>
      import('@app/features/game/pages/home.page').then(m => m.HomePageComponent),
    canActivate: [AuthGuard],
  },

  // Characters
  {
    path: 'characters',
    loadComponent: () =>
      import('@app/features/characters/pages/characters.page').then(
        m => m.CharactersPageComponent
      ),
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'auth/login' },
];
