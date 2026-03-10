import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { Note } from '../../shared/models/notes.models';

export type CreateNoteDto = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNoteDto = Partial<Pick<Note, 'title' | 'content' | 'color'>>;

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';
  private readonly notesUrl = `${this.baseUrl}/notes`;

  list(): Observable<Note[]> {
    return this.http.get<Note[]>(this.notesUrl);
  }

  getById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.notesUrl}/${id}`);
  }

  create(payload: CreateNoteDto): Observable<Note> {
    return this.http.post<Note>(this.notesUrl, payload);
  }

  update(id: string, payload: UpdateNoteDto): Observable<Note> {
    return this.http.put<Note>(`${this.notesUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.notesUrl}/${id}`);
  }
}
