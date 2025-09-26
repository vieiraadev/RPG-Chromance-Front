import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  private notification = inject(NotificationService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      
      if (this.form.get('email')?.hasError('required')) {
        this.notification.warning('Por favor, informe seu email');
        return;
      }
      if (this.form.get('email')?.hasError('email')) {
        this.notification.warning('Por favor, informe um email válido');
        return;
      }
      if (this.form.get('password')?.hasError('required')) {
        this.notification.warning('Por favor, informe sua senha');
        return;
      }
      
      return;
    }

    this.loading = true;

    const { email, password } = this.form.value;
    const loginRequest = {
      email: email!,
      senha: password!
    };

    this.auth.login(loginRequest).subscribe({
      next: (response) => {
        this.notification.success('Login realizado com sucesso!');
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Email ou senha incorretos';
        
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor';
        }

        this.notification.error(errorMessage);
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/signup']);
  }
}