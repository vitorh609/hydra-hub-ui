import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';
import type { CreateTicketDto } from '../../../../../shared/models/create-ticket.dto';
import type { Ticket, TicketStatus } from '../../../../../shared/models/ticket.model';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';

interface TicketInlineForm {
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
}

@Component({
  selector: 'app-ticket-column',
  standalone: true,
  imports: [ReactiveFormsModule, AppInputComponent, TicketCardComponent],
  templateUrl: './ticket-column.component.html',
  styleUrl: './ticket-column.component.scss',
})
export class TicketColumnComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) status!: TicketStatus;
  @Input({ required: true }) tickets: Ticket[] = [];
  @Output() ticketCreated = new EventEmitter<CreateTicketDto>();
  @Output() ticketDropped = new EventEmitter<{ ticketId: string; targetStatus: TicketStatus }>();
  @Output() ticketOpened = new EventEmitter<string>();

  readonly isCreating = signal(false);
  readonly submitted = signal(false);
  readonly form = new FormGroup<TicketInlineForm>({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  allowDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    const ticketId = event.dataTransfer?.getData('text/plain');
    if (!ticketId) {
      return;
    }

    this.ticketDropped.emit({ ticketId, targetStatus: this.status });
  }

  openTicket(ticketId: string): void {
    this.ticketOpened.emit(ticketId);
  }

  openInlineCreate(): void {
    this.isCreating.set(true);
    this.submitted.set(false);
  }

  cancelInlineCreate(): void {
    this.isCreating.set(false);
    this.submitted.set(false);
    this.form.reset({
      title: '',
      description: '',
      dueDate: '',
    });
  }

  submitInlineCreate(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.ticketCreated.emit({
      title: value.title,
      description: value.description,
      dueDate: new Date(`${value.dueDate}T12:00:00`).toISOString(),
      status: this.status,
    });
    this.cancelInlineCreate();
  }

  hasError(controlName: keyof TicketInlineForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }
}
