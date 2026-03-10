import {
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type RichCommand = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList';

@Component({
  selector: 'app-rich-textarea',
  standalone: true,
  imports: [],
  templateUrl: './rich-textarea.component.html',
  styleUrl: './rich-textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextareaComponent),
      multi: true,
    },
  ],
})
export class RichTextareaComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() minHeight = 160;

  @HostBinding('class.is-disabled') isDisabled = false;

  @ViewChild('editable', { static: true }) editable?: ElementRef<HTMLDivElement>;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const content = value ?? '';
    if (this.editable?.nativeElement) {
      this.editable.nativeElement.innerHTML = content;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  applyCommand(command: RichCommand): void {
    this.focusEditable();
    document.execCommand(command);
    this.emitValue();
  }

  applyHeading(): void {
    this.focusEditable();
    document.execCommand('formatBlock', false, 'h4');
    this.emitValue();
  }

  applyLink(): void {
    const url = window.prompt('Enter a link');
    if (!url) {
      return;
    }
    this.focusEditable();
    document.execCommand('createLink', false, url);
    this.emitValue();
  }

  onInput(): void {
    this.emitValue();
  }

  onBlur(): void {
    this.onTouched();
  }

  private emitValue(): void {
    const value = this.editable?.nativeElement.innerHTML ?? '';
    this.onChange(value);
  }

  private focusEditable(): void {
    this.editable?.nativeElement.focus();
  }
}
