import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import type { ProductFormValue, ProductStatus } from '../../../../shared/models/product.models';
import { CardComponent } from '../../../../core/ui/card/card.component';
import { AppInputComponent } from '../../../../core/ui/input/app-input.component';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { RichTextareaComponent } from '../../components/rich-textarea/rich-textarea.component';

interface StatusOption {
  label: string;
  value: ProductStatus;
}

@Component({
  selector: 'app-add-product-page',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, AppInputComponent, ImageUploadComponent, RichTextareaComponent],
  templateUrl: './add-product-page.component.html',
  styleUrl: './add-product-page.component.scss',
})
export class AddProductPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly submitted = signal(false);

  readonly statusOptions: StatusOption[] = [
    { label: 'In Stock', value: 'IN_STOCK' },
    { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
  ];

  readonly form = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    price: this.fb.control(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    size: this.fb.control('', { nonNullable: true }),
    description: this.fb.control('', { nonNullable: true }),
    status: this.fb.control<ProductStatus>('IN_STOCK', { nonNullable: true }),
    thumbnailBase64: this.fb.control<string | null>(null),
    mediaBase64: this.fb.control<string | null>(null),
  });

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: ProductFormValue = {
      ...value,
      size: value.size || undefined,
      thumbnailBase64: value.thumbnailBase64 ?? undefined,
      mediaBase64: value.mediaBase64 ?? undefined,
    };

    // eslint-disable-next-line no-console
    console.log('Add product payload', payload);
  }

  onCancel(): void {
    this.router.navigateByUrl('/ecommerce/product-list');
  }
}
