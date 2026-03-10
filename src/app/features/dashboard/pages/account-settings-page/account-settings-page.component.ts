import { Component, signal, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from '@angular/forms';

import type {
  AccountPasswordFormValue,
  AccountPersonalDetailsFormValue,
  AccountProfileFormValue,
  AccountSettingsCreate,
} from '../../../../shared/models/account-settings.models';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { AccountSettingsTabsComponent } from '../../components/account-settings/account-settings-tabs/account-settings-tabs.component';
import { ProfilePhotoCardComponent } from '../../components/account-settings/profile-photo-card/profile-photo-card.component';
import { ChangePasswordCardComponent } from '../../components/account-settings/change-password-card/change-password-card.component';
import {
  PersonalDetailsCardComponent,
  SelectOption,
} from '../../components/account-settings/personal-details-card/personal-details-card.component';
import { SettingsActionsBarComponent } from '../../components/account-settings/settings-actions-bar/settings-actions-bar.component';
import {AccountService} from '../../../../services/account/account-service';

interface AccountSettingsFormValue {
  profile: AccountProfileFormValue;
  password: AccountPasswordFormValue;
  details: AccountPersonalDetailsFormValue;
}

const passwordMatchValidator: ValidatorFn = (group) => {
  const newPassword = group.get('newPassword')?.value as string | null;
  const confirmPassword = group.get('confirmPassword')?.value as string | null;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-account-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    AccountSettingsTabsComponent,
    ProfilePhotoCardComponent,
    ChangePasswordCardComponent,
    PersonalDetailsCardComponent,
    SettingsActionsBarComponent,
  ],
  providers: [AccountService],
  templateUrl: './account-settings-page.component.html',
  styleUrl: './account-settings-page.component.scss',
})
export class AccountSettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);

  readonly submitted = signal(false);
  readonly activeTab = signal('Account');

  readonly tabs = ['Account', 'Notifications', 'Bills', 'Security'];

  readonly locationOptions: SelectOption[] = [
    { label: 'India', value: 'India' },
    { label: 'Brazil', value: 'Brazil' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
  ];

  readonly currencyOptions: SelectOption[] = [
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'BRL - Brazilian Real', value: 'BRL' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'GBP - British Pound', value: 'GBP' },
  ];

  private readonly initialValue: AccountSettingsFormValue = {
    profile: {
      avatarBase64: null,
    },
    password: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    details: {
      name: 'Jenny Wilson',
      storeName: 'Modernize Store',
      location: 'United States',
      currency: 'USD',
      email: 'jenny@example.com',
      phone: '',
      address: '',
    },
  };

  readonly form = this.fb.group({
    profile: this.fb.group({
      avatarBase64: this.fb.control<string | null>(this.initialValue.profile.avatarBase64),
    }),
    password: this.fb.group(
      {
        currentPassword: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        newPassword: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        confirmPassword: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      },
      { validators: [passwordMatchValidator] },
    ),
    details: this.fb.group({
      name: this.fb.control(this.initialValue.details.name, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      storeName: this.fb.control(this.initialValue.details.storeName, { nonNullable: true }),
      location: this.fb.control(this.initialValue.details.location, { nonNullable: true }),
      currency: this.fb.control(this.initialValue.details.currency, { nonNullable: true }),
      email: this.fb.control(this.initialValue.details.email, {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: this.fb.control(this.initialValue.details.phone, {
        nonNullable: true,
        validators: [Validators.pattern(/^[0-9+()\-\s]*$/)],
      }),
      address: this.fb.control(this.initialValue.details.address, { nonNullable: true }),
    }),
  });

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    this.accountService.create(payload).subscribe({
      next: (accountCreated) => {
        // eslint-disable-next-line no-console
        console.log('Account settings payload', payload);

        this.form.controls.password.reset(this.initialValue.password);
        this.submitted.set(false);
      },
      error: (err) => {
        console.error('Error creating account', err);
      }
    })
  }

  onCancel(): void {
    this.form.reset(this.initialValue);
    this.submitted.set(false);
  }

  buildPayload(): AccountSettingsCreate {
    return {
      avatarBase64: this.profileForm.controls.avatarBase64.value,
      name: this.detailsForm.controls.name.value,
      // storeName: this.detailsForm.controls.storeName.value ?? null,
      location: this.detailsForm.controls.location.value ?? null,
      // currency: this.detailsForm.controls.currency.value ?? null,
      email: this.detailsForm.controls.email.value ?? null,
      phone: this.detailsForm.controls.phone.value ?? null,
      address: this.detailsForm.controls.address.value ?? null,
    };
  }

  get profileForm(): FormGroup<{ avatarBase64: FormControl<string | null> }> {
    return this.form.controls.profile;
  }

  get passwordForm(): FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> {
    return this.form.controls.password;
  }

  get detailsForm(): FormGroup<{
    name: FormControl<string>;
    storeName: FormControl<string>;
    location: FormControl<string>;
    currency: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
    address: FormControl<string>;
  }> {
    return this.form.controls.details;
  }
}
