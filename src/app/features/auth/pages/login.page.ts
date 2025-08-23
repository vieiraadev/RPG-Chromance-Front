import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  error = '';

  submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true; this.error = '';
    const { email, password } = this.form.value;

    setTimeout(() => {
      this.loading = false;
      console.log('login', { email, password });
    }, 700);
  }
}
