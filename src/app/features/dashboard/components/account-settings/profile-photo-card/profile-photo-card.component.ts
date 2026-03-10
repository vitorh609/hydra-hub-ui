import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CardComponent } from '../../../../../core/ui/card/card.component';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';

interface ProfilePhotoForm {
  avatarBase64: FormControl<string | null>;
}

@Component({
  selector: 'app-profile-photo-card',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, IconComponent, ImageUploadComponent],
  templateUrl: './profile-photo-card.component.html',
  styleUrl: './profile-photo-card.component.scss',
})
export class ProfilePhotoCardComponent {
  @Input({ required: true }) form!: FormGroup<ProfilePhotoForm>;

  @ViewChild(ImageUploadComponent) private imageUpload?: ImageUploadComponent;

  get avatarPreview(): string | null {
    return this.form.controls.avatarBase64.value;
  }

  onUpload(): void {
    this.imageUpload?.triggerFileSelect();
  }

  onReset(): void {
    this.form.controls.avatarBase64.setValue(null);
    this.form.controls.avatarBase64.markAsDirty();
  }
}
