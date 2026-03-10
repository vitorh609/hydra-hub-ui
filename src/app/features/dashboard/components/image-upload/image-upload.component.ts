import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true,
    },
  ],
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() accept = 'image/png,image/jpeg';
  @Input() hint?: string;

  @Output() fileSelected = new EventEmitter<File>();

  @HostBinding('class.has-preview') get hasPreview(): boolean {
    return Boolean(this.preview);
  }

  @HostBinding('class.is-disabled') isDisabled = false;

  @ViewChild('fileInput', { static: true }) fileInput?: ElementRef<HTMLInputElement>;

  preview?: string | null;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.preview = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  triggerFileSelect(): void {
    if (this.isDisabled) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.fileSelected.emit(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = typeof reader.result === 'string' ? reader.result : null;
      this.onChange(this.preview ?? null);
    };
    reader.readAsDataURL(file);
    this.onTouched();
  }
}
