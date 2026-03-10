import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CardComponent } from '../../../../../core/ui/card/card.component';
import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';

interface DetailsForm {
  name: FormControl<string>;
  storeName: FormControl<string>;
  location: FormControl<string>;
  currency: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: FormControl<string>;
}

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-personal-details-card',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, AppInputComponent],
  templateUrl: './personal-details-card.component.html',
  styleUrl: './personal-details-card.component.scss',
})
export class PersonalDetailsCardComponent {
  @Input({ required: true }) form!: FormGroup<DetailsForm>;
  @Input({ required: true }) locations: SelectOption[] = [];
  @Input({ required: true }) currencies: SelectOption[] = [];
  @Input() submitted = false;

  showError(control: FormControl<string>): boolean {
    return (control.touched || this.submitted) && control.invalid;
  }
}
