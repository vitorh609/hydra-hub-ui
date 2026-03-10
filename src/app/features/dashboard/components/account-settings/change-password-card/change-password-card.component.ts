import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CardComponent } from '../../../../../core/ui/card/card.component';
import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';

interface PasswordForm {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-change-password-card',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, AppInputComponent],
  templateUrl: './change-password-card.component.html',
  styleUrl: './change-password-card.component.scss',
})
export class ChangePasswordCardComponent {
  @Input({ required: true }) form!: FormGroup<PasswordForm>;
  @Input() submitted = false;

  showError(control: FormControl<string>): boolean {
    return (control.touched || this.submitted) && control.invalid;
  }

  get showMismatch(): boolean {
    return (
      Boolean(this.form.errors?.['passwordMismatch']) &&
      (this.form.controls.confirmPassword.touched || this.submitted)
    );
  }
}
