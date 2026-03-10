import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewEncapsulation,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type ToolbarVariant = 'full' | 'basic';

type RichCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'insertOrderedList'
  | 'insertUnorderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight';

type HeadingOption = '' | 'p' | 'h1' | 'h2' | 'h3';

interface HeadingSelectOption {
  value: HeadingOption;
  label: string;
}

@Component({
  selector: 'app-rich-html-editor',
  standalone: true,
  imports: [],
  templateUrl: './rich-html-editor.component.html',
  styleUrl: './rich-html-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichHtmlEditorComponent),
      multi: true,
    },
  ],
})
export class RichHtmlEditorComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = 'Start writing your document...';
  @Input() minHeight = 320;
  @Input() toolbarVariant: ToolbarVariant = 'full';

  @HostBinding('class.is-disabled') isDisabled = false;

  @ViewChild('editable', { static: true }) editable?: ElementRef<HTMLDivElement>;

  readonly headingOptions: HeadingSelectOption[] = [
    { value: '', label: 'Heading' },
    { value: 'p', label: 'Paragraph' },
    { value: 'h1', label: 'H1' },
    { value: 'h2', label: 'H2' },
    { value: 'h3', label: 'H3' },
  ];

  selectedHeading: HeadingOption = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private pendingValue = '';

  writeValue(value: string | null): void {
    this.pendingValue = value ?? '';
    if (this.editable?.nativeElement) {
      this.editable.nativeElement.innerHTML = this.pendingValue;
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
    if (this.isDisabled) {
      return;
    }

    this.focusEditable();
    document.execCommand(command);
    this.emitValue();
  }

  applyHeadingFromSelect(value: string): void {
    if (this.isDisabled) {
      return;
    }

    const heading = value as HeadingOption;
    this.selectedHeading = heading;

    if (!heading) {
      return;
    }

    this.focusEditable();

    const tag = heading === 'p' ? 'p' : heading;
    document.execCommand('formatBlock', false, tag);

    this.emitValue();
  }

  onHeadingChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.applyHeadingFromSelect(target.value);
    this.selectedHeading = '';
    target.value = '';
  }

  applyLink(): void {
    if (this.isDisabled) {
      return;
    }

    const url = window.prompt('Enter a URL', 'https://');

    if (!url) {
      return;
    }

    this.focusEditable();
    document.execCommand('createLink', false, url);
    this.emitValue();
  }

  clearFormatting(): void {
    if (this.isDisabled) {
      return;
    }

    this.focusEditable();
    document.execCommand('removeFormat');
    this.emitValue();
  }

  preventToolbarMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  onInput(): void {
    this.emitValue();
  }

  onBlur(): void {
    this.onTouched();
  }

  get isEmpty(): boolean {
    const html = this.editable?.nativeElement.innerHTML ?? this.pendingValue;
    const normalized = html.replace(/<br\s*\/?>(\s*)/gi, '').replace(/&nbsp;/g, ' ').trim();
    return normalized.length === 0;
  }

  private emitValue(): void {
    const value = this.editable?.nativeElement.innerHTML ?? '';
    this.pendingValue = value;
    this.onChange(value);
  }

  private focusEditable(): void {
    this.editable?.nativeElement.focus();
  }
}
