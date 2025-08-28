import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  error = '';

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;

    const loginRequest = {
      email: email!,
      senha: password!
    };

    try {
      await this.auth.login(loginRequest).toPromise();
      
      this.router.navigate(['/home']); 
      
    } catch (error: any) {
      this.error = error?.error?.detail ?? 'Email ou senha incorretos';
      console.error('Login error:', error);
      
    } finally {
      this.loading = false;
    }
  }

  goToRegister(): void {
    this.router.navigate(['/auth/signup']);
  }
}