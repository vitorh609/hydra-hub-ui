import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  ClickupConnectionStatus,
  ClickupSpace,
  ClickupSpaceHierarchy,
  ClickupTaskPage,
  ConnectClickupDto,
} from '../../shared/models/clickup.models';

@Injectable({ providedIn: 'root' })
export class ClickupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly integrationUrl = `${this.baseUrl}/integrations/clickup`;

  connect(payload: ConnectClickupDto): Observable<void> {
    return this.http.post<void>(`${this.integrationUrl}/connect`, payload);
  }

  getStatus(): Observable<ClickupConnectionStatus> {
    return this.http.get<ClickupConnectionStatus>(`${this.integrationUrl}/status`);
  }

  listSpaces(): Observable<ClickupSpace[]> {
    return this.http.get<ClickupSpace[]>(`${this.integrationUrl}/spaces`);
  }

  getSpaceHierarchy(spaceId: string): Observable<ClickupSpaceHierarchy> {
    return this.http.get<ClickupSpaceHierarchy>(`${this.integrationUrl}/spaces/${spaceId}/folders`);
  }

  listTasks(listId: string, page: number): Observable<ClickupTaskPage> {
    const params = new HttpParams().set('page', String(page));
    return this.http.get<ClickupTaskPage>(`${this.integrationUrl}/lists/${listId}/tasks`, { params });
  }
}
