import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';
import { TicketService } from '../../../../../services/ticket/ticket.service';
import type { CreateTicketDto } from '../../../../../shared/models/create-ticket.dto';
import type { TicketStatus } from '../../../../../shared/models/ticket.model';
import type { UpdateTicketDto } from '../../../../../shared/models/update-ticket.dto';

interface TicketForm {
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
  status: FormControl<TicketStatus>;
  createdAt: FormControl<string>;
}

interface StatusOption {
  label: string;
  value: TicketStatus;
}

const statusOptions: StatusOption[] = [
  { label: 'ToDo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const toDateInputValue = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
};

const toIsoDate = (value: string): string => new Date(`${value}T12:00:00`).toISOString();

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppInputComponent, DatePipe],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.scss',
})
export class TicketModalComponent implements OnInit {
  readonly bsModalRef = inject(BsModalRef);
  private readonly ticketService = inject(TicketService);

  ticketSelectedId?: string | null;
  onSaved: () => void = () => {};
  readonly submitted = signal(false);
  readonly statusOptions = statusOptions;

  readonly form = new FormGroup<TicketForm>({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl<TicketStatus>('todo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    createdAt: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
  });

  get isCreateMode(): boolean {
    return !this.ticketSelectedId;
  }

  ngOnInit(): void {
    if (!this.ticketSelectedId) {
      return;
    }

    this.ticketService.getById(this.ticketSelectedId).subscribe({
      next: (ticket) => {
        this.form.patchValue({
          title: ticket.title,
          description: ticket.description,
          dueDate: toDateInputValue(ticket.dueDate),
          status: ticket.status,
          createdAt: ticket.createdAt,
        });
      },
      error: () => {
        this.ticketSelectedId = null;
      },
    });
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.isCreateMode) {
      const createPayload: CreateTicketDto = {
        title: value.title,
        description: value.description,
        dueDate: toIsoDate(value.dueDate),
        status: value.status,
      };

      this.ticketService.create(createPayload).subscribe({
        next: () => {
          this.onSaved();
          this.bsModalRef.hide();
        },
      });
      return;
    }

    const updatePayload: UpdateTicketDto = {
      id: this.ticketSelectedId!,
      title: value.title,
      description: value.description,
      dueDate: toIsoDate(value.dueDate),
      status: value.status,
    };

    this.ticketService.update(updatePayload.id, updatePayload).subscribe({
      next: () => {
        this.onSaved();
        this.bsModalRef.hide();
      },
    });
  }

  cancel(): void {
    this.bsModalRef.hide();
  }

  hasError(controlName: keyof TicketForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }
}
