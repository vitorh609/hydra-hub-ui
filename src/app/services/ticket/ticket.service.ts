import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import type { CreateTicketDto } from '../../shared/models/create-ticket.dto';
import type { Ticket, TicketStatus } from '../../shared/models/ticket.model';
import type { UpdateTicketDto } from '../../shared/models/update-ticket.dto';

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
}
