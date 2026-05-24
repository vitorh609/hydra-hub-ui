export type TicketStatus = 'todo' | 'in_progress' | 'done';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  codTicket: string;
  status: TicketStatus;
}

export interface RelatedTicket {
  id: string;
  title: string;
  status: TicketStatus;
  dueDate: string | null;
}
