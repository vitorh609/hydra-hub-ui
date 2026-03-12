import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import type { Ticket } from '../../../../../shared/models/ticket.model';

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
}
