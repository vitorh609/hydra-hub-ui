import type { TicketStatus } from './ticket.model';

export interface CreateTicketDto {
  title: string;
  description: string;
  dueDate: string;
  status: TicketStatus;
}
