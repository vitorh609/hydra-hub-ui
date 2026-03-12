import type { TicketStatus } from './ticket.model';

export interface UpdateTicketDto {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TicketStatus;
}
