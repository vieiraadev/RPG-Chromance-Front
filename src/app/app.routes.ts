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
      import('@app/features/home/pages/home.page').then(m => m.HomePageComponent),
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

  // Campaigns
  {
    path: 'campaigns',
    loadComponent: () =>
      import('@app/features/campaign/pages/campaign.page').then(
        m => m.CampaignsComponent
      ),
    canActivate: [AuthGuard],
  },

  // Game
  {
    path: 'game',
    loadComponent: () =>
      import('@app/features/game/pages/game.page').then(
        m => m.GamePageComponent
      ),
    canActivate: [AuthGuard],
  },

  // Profile
  {
    path: 'profile',
    loadComponent: () =>
      import('@app/features/profile/pages/profile.page').then(
        m => m.ProfilePageComponent
      ),
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'auth/login' },
];