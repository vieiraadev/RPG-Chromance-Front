import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
  encapsulation: ViewEncapsulation.None
})
export class SignupPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  form!: FormGroup;
  loading = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      return;
    }

    this.loading = true;
    
    try {
      const formData = this.form.value;
      console.log('Dados do formulário:', formData);
      
      await this.delay(2000);
      
      console.log('Cadastro realizado com sucesso');
      
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Erro ao realizar cadastro:', error);
    } finally {
      this.loading = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}