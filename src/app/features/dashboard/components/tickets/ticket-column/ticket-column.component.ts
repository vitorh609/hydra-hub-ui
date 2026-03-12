import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { Ticket, TicketStatus } from '../../../../../shared/models/ticket.model';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';

@Component({
  selector: 'app-ticket-column',
  standalone: true,
  imports: [TicketCardComponent],
  templateUrl: './ticket-column.component.html',
  styleUrl: './ticket-column.component.scss',
})
export class TicketColumnComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) status!: TicketStatus;
  @Input({ required: true }) tickets: Ticket[] = [];
  @Output() ticketDropped = new EventEmitter<{ ticketId: string; targetStatus: TicketStatus }>();
  @Output() ticketOpened = new EventEmitter<string>();

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
}
