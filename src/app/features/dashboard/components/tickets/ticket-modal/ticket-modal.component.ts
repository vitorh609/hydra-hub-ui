import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';

import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';
import { TicketService } from '../../../../../services/ticket/ticket.service';
import type { CreateTicketDto } from '../../../../../shared/models/create-ticket.dto';
import type { RelatedTicket, TicketStatus } from '../../../../../shared/models/ticket.model';
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
  imports: [CommonModule, ReactiveFormsModule, AppInputComponent, IconComponent, DatePipe],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.scss',
})
export class TicketModalComponent implements OnInit {
  readonly bsModalRef = inject(BsModalRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ticketService = inject(TicketService);
  private switchingTicketId: string | null = null;

  @ViewChild('modalBody') private modalBody?: ElementRef<HTMLElement>;

  ticketSelectedId?: string | null;
  onSaved: () => void = () => {};
  readonly submitted = signal(false);
  readonly statusOptions = statusOptions;
  readonly relatedTickets = signal<RelatedTicket[]>([]);
  readonly ticketSearchResults = signal<RelatedTicket[]>([]);
  readonly relationsLoading = signal(false);
  readonly relationsError = signal('');
  readonly searchLoading = signal(false);
  readonly searchCompleted = signal(false);
  readonly relationSaving = signal(false);
  readonly switchingTicket = signal(false);
  readonly switchingTicketTitle = signal('');
  readonly relatedSearchControl = new FormControl<string>('', { nonNullable: true });

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
    this.relatedSearchControl.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.searchRelationCandidates(query));

    if (!this.ticketSelectedId) {
      return;
    }

    this.loadTicket(this.ticketSelectedId);
  }

  loadTicket(ticketId: string, showSwitchFeedback = false): void {
    this.ticketSelectedId = ticketId;
    this.submitted.set(false);
    this.relatedSearchControl.setValue('', { emitEvent: false });
    this.ticketSearchResults.set([]);
    this.searchCompleted.set(false);

    const startedAt = Date.now();
    this.ticketService.getById(ticketId).subscribe({
      next: (ticket) => {
        if (this.ticketSelectedId !== ticketId) {
          return;
        }

        this.form.patchValue({
          title: ticket.title,
          description: ticket.description,
          dueDate: toDateInputValue(ticket.dueDate),
          status: ticket.status,
          createdAt: ticket.createdAt,
        });
        this.loadRelations(ticketId);
        this.finishSwitchFeedback(ticketId, startedAt, showSwitchFeedback);
      },
      error: () => {
        if (this.ticketSelectedId !== ticketId) {
          return;
        }

        this.ticketSelectedId = null;
        this.relatedTickets.set([]);
        this.finishSwitchFeedback(ticketId, startedAt, showSwitchFeedback);
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

  openRelatedTicket(ticket: RelatedTicket): void {
    this.switchingTicketId = ticket.id;
    this.switchingTicketTitle.set(ticket.title);
    this.switchingTicket.set(true);
    this.scrollModalToTop();
    this.loadTicket(ticket.id, true);
  }

  addRelation(ticket: RelatedTicket): void {
    if (!this.ticketSelectedId || this.relationSaving()) {
      return;
    }

    this.relationSaving.set(true);
    this.ticketService
      .createRelation(this.ticketSelectedId, ticket.id)
      .pipe(finalize(() => this.relationSaving.set(false)))
      .subscribe({
        next: () => {
          this.relatedSearchControl.setValue('', { emitEvent: false });
          this.ticketSearchResults.set([]);
          this.searchCompleted.set(false);
          this.loadRelations(this.ticketSelectedId!);
        },
      });
  }

  removeRelation(ticket: RelatedTicket, event: Event): void {
    event.stopPropagation();

    if (!this.ticketSelectedId || this.relationSaving()) {
      return;
    }

    this.relationSaving.set(true);
    this.ticketService
      .deleteRelation(this.ticketSelectedId, ticket.id)
      .pipe(finalize(() => this.relationSaving.set(false)))
      .subscribe({
        next: () => this.loadRelations(this.ticketSelectedId!),
      });
  }

  statusLabel(status: TicketStatus): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? 'Status';
  }

  statusClass(status: TicketStatus): string {
    return `is-${status.replace('_', '-')}`;
  }

  hasError(controlName: keyof TicketForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  private loadRelations(ticketId: string): void {
    this.relationsLoading.set(true);
    this.relationsError.set('');

    this.ticketService
      .getRelations(ticketId)
      .pipe(finalize(() => this.relationsLoading.set(false)))
      .subscribe({
        next: (tickets) => {
          if (this.ticketSelectedId !== ticketId) {
            return;
          }

          this.relatedTickets.set(tickets);
        },
        error: () => {
          if (this.ticketSelectedId !== ticketId) {
            return;
          }

          this.relatedTickets.set([]);
          this.relationsError.set('Could not load related tasks.');
        },
      });
  }

  private searchRelationCandidates(query: string): void {
    const ticketId = this.ticketSelectedId;
    const trimmedQuery = query.trim();

    if (!ticketId || trimmedQuery.length < 2) {
      this.ticketSearchResults.set([]);
      this.searchLoading.set(false);
      this.searchCompleted.set(false);
      return;
    }

    this.searchLoading.set(true);
    this.searchCompleted.set(false);
    this.ticketService
      .search(trimmedQuery, ticketId)
      .pipe(finalize(() => this.searchLoading.set(false)))
      .subscribe({
        next: (tickets) => {
          if (this.ticketSelectedId !== ticketId) {
            return;
          }

          const relatedIds = new Set(this.relatedTickets().map((ticket) => ticket.id));
          this.ticketSearchResults.set(
            tickets.filter((ticket) => ticket.id !== ticketId && !relatedIds.has(ticket.id)),
          );
          this.searchCompleted.set(true);
        },
        error: () => {
          this.ticketSearchResults.set([]);
          this.searchCompleted.set(true);
        },
      });
  }

  private finishSwitchFeedback(ticketId: string, startedAt: number, showSwitchFeedback: boolean): void {
    if (!showSwitchFeedback || this.switchingTicketId !== ticketId) {
      return;
    }

    const minimumLoadingMs = 450;
    const remainingMs = Math.max(minimumLoadingMs - (Date.now() - startedAt), 0);

    window.setTimeout(() => {
      if (this.switchingTicketId !== ticketId) {
        return;
      }

      this.switchingTicket.set(false);
      this.switchingTicketTitle.set('');
      this.switchingTicketId = null;
    }, remainingMs);
  }

  private scrollModalToTop(): void {
    window.setTimeout(() => {
      this.modalBody?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
