import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import type { CreateTicketDto } from '../../shared/models/create-ticket.dto';
import type { RelatedTicket, Ticket, TicketStatus } from '../../shared/models/ticket.model';
import type { UpdateTicketDto } from '../../shared/models/update-ticket.dto';

interface TicketResponseItem {
  id: string;
  title: string;
  status: TicketStatus;
  dueDate?: string | null;
  due_date?: string | null;
}

type TicketCollectionResponse =
  | TicketResponseItem[]
  | {
      data?: TicketResponseItem[];
      tickets?: TicketResponseItem[];
      items?: TicketResponseItem[];
      results?: TicketResponseItem[];
    };

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly ticketsUrl = `${this.baseUrl}/tickets`;

  list(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.ticketsUrl);
  }

  getById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketsUrl}/${id}`);
  }

  search(query: string, excludeTicketId?: string): Observable<RelatedTicket[]> {
    const params: Record<string, string> = { query };

    if (excludeTicketId) {
      params['excludeTicketId'] = excludeTicketId;
    }

    return this.http
      .get<TicketCollectionResponse>(`${this.ticketsUrl}/search`, { params })
      .pipe(map((response) => this.toRelatedTickets(response)));
  }

  getRelations(id: string): Observable<RelatedTicket[]> {
    return this.http
      .get<TicketCollectionResponse>(`${this.ticketsUrl}/${id}/relations`)
      .pipe(map((response) => this.toRelatedTickets(response)));
  }

  createRelation(id: string, targetTicketId: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.ticketsUrl}/${id}/relations`, { targetTicketId });
  }

  deleteRelation(id: string, targetTicketId: string): Observable<void> {
    return this.http.delete<void>(`${this.ticketsUrl}/${id}/relations/${targetTicketId}`);
  }

  create(payload: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.ticketsUrl, payload);
  }

  update(id: string, payload: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketsUrl}/${id}`, payload);
  }

  updateStatus(id: string, status: TicketStatus): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketsUrl}/${id}`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ticketsUrl}/${id}`);
  }

  private toRelatedTickets(response: TicketCollectionResponse): RelatedTicket[] {
    const rows = Array.isArray(response)
      ? response
      : (response.data ?? response.tickets ?? response.items ?? response.results ?? []);

    return rows.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      dueDate: ticket.dueDate ?? ticket.due_date ?? null,
    }));
  }
}
