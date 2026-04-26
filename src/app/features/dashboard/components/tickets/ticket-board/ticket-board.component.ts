import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { TicketService } from '../../../../../services/ticket/ticket.service';
import type { CreateTicketDto } from '../../../../../shared/models/create-ticket.dto';
import type { Ticket, TicketStatus } from '../../../../../shared/models/ticket.model';
import { TableComponent } from '../../table/table.component';
import type { RowAction, TableColumn } from '../../table/table.types';
import { TicketColumnComponent } from '../ticket-column/ticket-column.component';
import { TicketModalComponent } from '../ticket-modal/ticket-modal.component';

type ViewMode = 'board' | 'list';

interface BoardColumn {
  title: string;
  status: TicketStatus;
}

interface StatusMeta {
  label: string;
  className: string;
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
  imports: [TableComponent, TicketColumnComponent],
  templateUrl: './ticket-board.component.html',
  styleUrl: './ticket-board.component.scss',
})
export class TicketBoardComponent implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly modalService = inject(BsModalService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly columns = columns;
  readonly tickets = signal<Ticket[]>([]);
  readonly viewMode = signal<ViewMode>('board');
  readonly totalTickets = computed(() => this.tickets().length);
  readonly ticketsByStatus = computed(() =>
    this.tickets().reduce<Record<TicketStatus, Ticket[]>>((groups, ticket) => {
      groups[ticket.status] = [...groups[ticket.status], ticket];
      return groups;
    }, emptyGroups()),
  );
  readonly ticketTableColumns: TableColumn<Ticket>[] = [
    {
      key: 'title',
      header: 'Titulo',
      cell: (ticket) => this.renderTitleCell(ticket),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      cell: (ticket) => this.renderStatusCell(ticket.status),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      cell: (ticket) => this.formatDate(ticket.dueDate),
    },
  ];
  readonly ticketTableActions: RowAction<Ticket>[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'edit',
      action: (ticket) => this.openTicket(ticket.id),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      variant: 'danger',
      action: (ticket) => {
        void this.deleteTicket(ticket);
      },
    },
  ];
  readonly rowId = (ticket: Ticket): string => ticket.id;

  ngOnInit(): void {
    this.loadTickets();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
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

  createInlineTicket(payload: CreateTicketDto): void {
    this.ticketService.create(payload).subscribe({
      next: () => this.loadTickets(),
    });
  }

  private async deleteTicket(ticket: Ticket): Promise<void> {
    const confirmed = await this.confirmDialog.open({
      title: 'Delete ticket',
      message: `This will permanently delete "${ticket.title}". Do you want to continue?`,
      confirmText: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    this.ticketService.delete(ticket.id).subscribe({
      next: () => this.loadTickets(),
    });
  }

  private loadTickets(): void {
    this.ticketService.list().subscribe({
      next: (tickets) => this.tickets.set(tickets),
      error: (error: unknown) => {
        console.error('Failed to load tickets', error);
      },
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

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  }

  private renderTitleCell(ticket: Ticket): string {
    return `<span class="ticket-table-title">${this.escapeHtml(ticket.title)}</span>`;
  }

  private renderStatusCell(status: TicketStatus): string {
    const meta = this.statusMeta(status);
    return `<span class="ticket-table-status ${meta.className}">${meta.label}</span>`;
  }

  private statusMeta(status: TicketStatus): StatusMeta {
    switch (status) {
      case 'in_progress':
        return { label: 'In Progress', className: 'is-in-progress' };
      case 'done':
        return { label: 'Done', className: 'is-done' };
      default:
        return { label: 'ToDo', className: 'is-todo' };
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
