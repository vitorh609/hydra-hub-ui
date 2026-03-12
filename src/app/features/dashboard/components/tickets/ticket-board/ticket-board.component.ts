import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { TicketService } from '../../../../../services/ticket/ticket.service';
import type { Ticket, TicketStatus } from '../../../../../shared/models/ticket.model';
import { TicketColumnComponent } from '../ticket-column/ticket-column.component';
import { TicketModalComponent } from '../ticket-modal/ticket-modal.component';

interface BoardColumn {
  title: string;
  status: TicketStatus;
}

const columns: BoardColumn[] = [
  { title: 'ToDo', status: 'todo' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Done', status: 'done' },
];

const emptyGroups = (): Record<TicketStatus, Ticket[]> => ({
  todo: [],
  in_progress: [],
  done: [],
});

@Component({
  selector: 'app-ticket-board',
  standalone: true,
  imports: [TicketColumnComponent],
  templateUrl: './ticket-board.component.html',
  styleUrl: './ticket-board.component.scss',
})
export class TicketBoardComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly modalService = inject(BsModalService);

  readonly columns = columns;
  readonly tickets = signal<Ticket[]>([]);
  readonly totalTickets = computed(() => this.tickets().length);
  readonly ticketsByStatus = computed(() =>
    this.tickets().reduce<Record<TicketStatus, Ticket[]>>((groups, ticket) => {
      groups[ticket.status] = [...groups[ticket.status], ticket];
      return groups;
    }, emptyGroups()),
  );

  ngOnInit(): void {
    this.loadTickets();
  }

  handleDrop(event: { ticketId: string; targetStatus: TicketStatus }): void {
    const sourceStatus = this.findStatusById(event.ticketId, this.ticketsByStatus());
    if (!sourceStatus) {
      return;
    }

    if (sourceStatus === event.targetStatus) {
      return;
    }

    this.ticketService.updateStatus(event.ticketId, event.targetStatus).subscribe({
      next: () => this.loadTickets(),
    });
  }

  openTicket(ticketId: string): void {
    this.modalService.show(TicketModalComponent, {
      class: 'modal-lg modal-dialog-centered app-themed-modal',
      initialState: { ticketSelectedId: ticketId, onSaved: () => this.loadTickets() },
    });
  }

  openCreateModal(): void {
    this.modalService.show(TicketModalComponent, {
      class: 'modal-lg modal-dialog-centered app-themed-modal',
      initialState: { ticketSelectedId: null, onSaved: () => this.loadTickets() },
    });
  }

  private loadTickets(): void {
    this.ticketService.list().subscribe({
      next: (tickets) => this.tickets.set(tickets),
    });
  }

  private findStatusById(
    ticketId: string,
    groups: Record<TicketStatus, Ticket[]>,
  ): TicketStatus | null {
    return (
      columns.find((column) => groups[column.status].some((ticket) => ticket.id === ticketId))?.status ??
      null
    );
  }
}
