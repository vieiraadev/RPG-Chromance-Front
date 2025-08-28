import { Component, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
  error = '';

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const v = this.form.value;
    const payload = { nome: v.fullName, email: v.email, senha: v.password };

    try {
      await this.auth.signup(payload).toPromise();
      
      this.router.navigate(['/auth/login']);
      
    } catch (e: any) {
      this.error = e?.error?.detail ?? 'Erro ao criar conta';
      console.error('Signup error:', e);
    } finally {
      this.loading = false;
    }
  }
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirmPassword')?.value;
  return pass && conf && pass !== conf ? { passwordsDontMatch: true } : null;
}