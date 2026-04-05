import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { IconComponent } from '../../../../core/ui/icon/icon.component';
import { AuthService } from '../../services/auth.service';
import { AuthDividerComponent } from '../auth-divider/auth-divider.component';
import { AuthSocialButtonsComponent } from '../auth-social-buttons/auth-social-buttons.component';

interface LoginFormModel {
  login: FormControl<string>;
  password: FormControl<string>;
  rememberDevice: FormControl<boolean>;
}

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, AuthDividerComponent, AuthSocialButtonsComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly submitAttempted = signal(false);

  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly form = this.formBuilder.group<LoginFormModel>({
    login: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    password: this.formBuilder.control('', {
      validators: [Validators.required],
    }),
    rememberDevice: this.formBuilder.control(false),
  });

  readonly loginInvalid = computed(() => this.isInvalid(this.form.controls.login));
  readonly passwordInvalid = computed(() => this.isInvalid(this.form.controls.password));

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    this.submitAttempted.set(true);
    this.submitError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { login, password, rememberDevice } = this.form.getRawValue();

    this.isSubmitting.set(true);

    this.authService
      .login({ login, password })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (session) => {
          this.sessionService.setSession(session, rememberDevice ? 'local' : 'session');
          // console.log('[login] Session saved', session);
          void this.router.navigateByUrl('/dashboards/dashboard2');
        },
        error: (error: unknown) => {
          console.error('Login failed', error);
          this.submitError.set('Unable to sign in with the provided credentials.');
        },
      });
  }

  protected isInvalid(control: FormControl<string>): boolean {
    return (control.touched || this.submitAttempted()) && control.invalid;
  }
}
