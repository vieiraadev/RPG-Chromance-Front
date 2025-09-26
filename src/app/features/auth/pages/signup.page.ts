import { Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private notification = inject(NotificationService);

  form: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator] }
  );

  loading = false;

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      
      if (this.form.get('fullName')?.hasError('required')) {
        this.notification.warning('Por favor, informe seu nome completo');
        return;
      }
      if (this.form.get('fullName')?.hasError('minlength')) {
        this.notification.warning('O nome deve ter pelo menos 2 caracteres');
        return;
      }
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
      if (this.form.get('password')?.hasError('minlength')) {
        this.notification.warning('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (this.form.get('confirmPassword')?.hasError('required')) {
        this.notification.warning('Por favor, confirme sua senha');
        return;
      }
      if (this.form.hasError('passwordsDontMatch')) {
        this.notification.warning('As senhas não coincidem');
        return;
      }
      
      return;
    }

    this.loading = true;

    const v = this.form.value;
    const payload = { 
      nome: v.fullName, 
      email: v.email, 
      senha: v.password 
    };

    this.auth.signup(payload).subscribe({
      next: () => {
        this.notification.success('Conta criada com sucesso!');
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        let errorMessage = 'Erro ao criar conta';
        
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.status === 0) {
          errorMessage = 'Não foi possível conectar ao servidor';
        } else if (error.status === 400) {
          errorMessage = error.error?.detail || 'Dados inválidos';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor';
        }

        this.notification.error(errorMessage);
        this.loading = false;
      }
    });
  }
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirmPassword')?.value;
  return pass && conf && pass !== conf ? { passwordsDontMatch: true } : null;
}