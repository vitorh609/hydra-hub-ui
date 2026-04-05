import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import type { Ticket, TicketStatus } from '../../../../../shared/models/ticket.model';

interface StatusOption {
  value: TicketStatus;
  label: string;
}

const statusOptions: StatusOption[] = [
  { value: 'todo', label: 'ToDo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './ticket-card.component.html',
  styleUrl: './ticket-card.component.scss',
})
export class TicketCardComponent {
  @Input({ required: true }) ticket!: Ticket;
  @Output() openTicket = new EventEmitter<string>();
  @Output() statusChanged = new EventEmitter<{ ticketId: string; status: TicketStatus }>();

  readonly isStatusMenuOpen = signal(false);
  readonly statusOptions = statusOptions;

  onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }

    event.dataTransfer.setData('text/plain', this.ticket.id);
    event.dataTransfer.effectAllowed = 'move';
  }

  open(): void {
    this.openTicket.emit(this.ticket.id);
  }

  get statusLabel(): string {
    return this.statusOptions.find((option) => option.value === this.ticket.status)?.label ?? 'Status';
  }

  toggleStatusMenu(event: Event): void {
    event.stopPropagation();
    this.isStatusMenuOpen.update((value) => !value);
  }

  updateStatus(status: TicketStatus, event: Event): void {
    event.stopPropagation();
    if (status === this.ticket.status) {
      this.isStatusMenuOpen.set(false);
      return;
    }

    this.statusChanged.emit({ ticketId: this.ticket.id, status });
    this.isStatusMenuOpen.set(false);
  }
}
