import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import type { Note, NoteColor } from '../../../../shared/models/notes.models';
import { NotesService } from '../../../../services/notes/notes.service';
import type { CreateNoteDto, UpdateNoteDto } from '../../../../services/notes/notes.service';

const NOTES_KEY = 'app.notes';
const SELECTED_KEY = 'app.notes.selectedId';
const LOCAL_NOTE_ID_PREFIX = 'local-';

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;

const createLocalNoteId = (): string => `${LOCAL_NOTE_ID_PREFIX}${createId()}`;

const createSeedNote = (note: CreateNoteDto): Note => {
  const now = new Date().toISOString();
  return {
    ...note,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
};

const seedNotes: Note[] = [
  createSeedNote({
    title: 'Meet the design team at 4pm',
    content: 'Discuss Q1 roadmap, onboarding flow, and the new pricing page.',
    color: 'blue',
  }),
  createSeedNote({
    title: 'Ideas for marketing deck',
    content: 'Collect examples, update the story arc, and include customer wins.',
    color: 'pink',
  }),
  createSeedNote({
    title: 'Sprint retro notes',
    content: 'Focus on blockers, celebrate small wins, and gather action items.',
    color: 'orange',
  }),
  createSeedNote({
    title: 'Product feedback list',
    content: 'Prioritize support tickets, top feature requests, and UX friction.',
    color: 'green',
  }),
  createSeedNote({
    title: 'Notes for weekly sync',
    content: 'Align on scope, timelines, and dependencies across squads.',
    color: 'teal',
  }),
];

@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly notesService = inject(NotesService);

  readonly notes = signal<Note[]>([]);
  readonly selectedId = signal<string | null>(seedNotes[0]?.id ?? null);
  readonly query = signal<string>('');

  readonly selectedNote = computed(() =>
    this.notes().find((note) => note.id === this.selectedId()) ?? null,
  );

  readonly filteredNotes = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return this.notes();
    }

    return this.notes().filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(term);
      const contentMatch = note.content.toLowerCase().includes(term);
      return titleMatch || contentMatch;
    });
  });

  constructor() {
    this.loadFromStorage();

    effect(() => {
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(this.notes()));
        const selected = this.selectedId();
        if (selected) {
          localStorage.setItem(SELECTED_KEY, selected);
        } else {
          localStorage.removeItem(SELECTED_KEY);
        }
      } catch {
        // Ignora falhas de persistencia (modo privado, quota, etc).
      }
    });
  }

  // Carrega notas e selecao a partir do localStorage.
  loadFromStorage(): void {
    try {
      const storedNotes = localStorage.getItem(NOTES_KEY);
      if (storedNotes) {
        const parsed = JSON.parse(storedNotes) as Note[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notes.set(parsed);
          const storedSelected = localStorage.getItem(SELECTED_KEY);
          const selected =
            storedSelected && parsed.some((note) => note.id === storedSelected)
              ? storedSelected
              : parsed[0].id;
          this.selectedId.set(selected);
          return;
        }
      }
    } catch {
      // Se falhar, mantem o estado atual em memoria.
    }
  }

  // Carrega lista de notas do backend.
  loadNotes(): void {
    this.notesService.list().subscribe({
      next: (notes: Note[]) => {
        if (!Array.isArray(notes) || notes.length === 0) {
          this.notes.set([]);
          this.selectedId.set(null);
          return;
        }

        this.notes.set(notes);

        const currentSelected = this.selectedId();
        const stillExists = currentSelected && notes.some((note) => note.id === currentSelected);
        if (!stillExists) {
          this.selectedId.set(notes[0].id);
        }
      },
    });
  }

  // Cria uma nova nota e seleciona imediatamente.
  createNote(): void {
    const newNote: Note = {
      // Nota inicia com ID local temporario e recebe ID definitivo ao criar no backend.
      id: createLocalNoteId(),
      title: 'New note',
      content: '',
      color: 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.update((notes) => [newNote, ...notes]);
    this.selectedId.set(newNote.id);
  }

  // Seleciona uma nota existente.
  selectNote(id: string): void {
    this.selectedId.set(id);
  }

  // Atualiza titulo/conteudo da nota selecionada no estado local.
  updateDraft(partial: UpdateNoteDto): void {
    const selectedId = this.selectedId();
    if (!selectedId) {
      return;
    }

    this.notes.update((notes) =>
      notes.map((note) => (note.id === selectedId ? { ...note, ...partial } : note)),
    );
  }

  // Salva os dados do formulario e atualiza o updatedAt.
  saveSelected(formValue: UpdateNoteDto): void {
    const selectedId = this.selectedId();
    if (!selectedId) {
      return;
    }

    this.notes.update((notes) =>
      notes.map((note) =>
        note.id === selectedId
          ? {
              ...note,
              title: formValue.title ?? note.title,
              content: formValue.content ?? note.content,
              color: formValue.color ?? note.color,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );
  }

  // Persiste no backend somente os campos editaveis da nota selecionada.
  persistNoteDraft(noteId: string, draft: UpdateNoteDto): Observable<Note> {
    const isLocalDraft = this.isLocalNoteId(noteId);
    const request$ = isLocalDraft
      ? this.notesService.create(draft as CreateNoteDto)
      : this.notesService.update(noteId, draft);

    return request$.pipe(
      tap((savedNote) => {
        this.notes.update((notes) =>
          notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  id: savedNote.id ?? note.id,
                  title: savedNote.title ?? draft.title,
                  content: savedNote.content ?? draft.content,
                  color: savedNote.color ?? note.color,
                  createdAt: savedNote.createdAt ?? note.createdAt,
                  updatedAt: savedNote.updatedAt ?? new Date().toISOString(),
                }
              : note,
          ),
        );

        // Se era um draft local, atualiza a selecao para o ID persistido retornado pelo backend.
        if (isLocalDraft && this.selectedId() === noteId) {
          this.selectedId.set(savedNote.id);
        }
      }),
    );
  }

  private isLocalNoteId(noteId: string): boolean {
    return noteId.startsWith(LOCAL_NOTE_ID_PREFIX);
  }

  // Remove uma nota e ajusta a selecao.
  deleteNote(id: string): void {
    // Draft local ainda nao persistido no backend pode ser removido apenas localmente.
    if (this.isLocalNoteId(id)) {
      this.removeNoteLocally(id);
      return;
    }

    this.notesService.delete(id).subscribe({
      next: () => this.removeNoteLocally(id),
    });
  }

  // Atualiza a cor da nota selecionada.
  setColor(color: NoteColor): void {
    const selectedId = this.selectedId();
    if (!selectedId) {
      return;
    }

    this.notes.update((notes) =>
      notes.map((note) => (note.id === selectedId ? { ...note, color } : note)),
    );
  }

  // Atualiza o termo de busca.
  setQuery(value: string): void {
    this.query.set(value);
  }

  private removeNoteLocally(id: string): void {
    this.notes.update((notes) => notes.filter((note) => note.id !== id));
    if (this.selectedId() === id) {
      const remaining = this.notes();
      this.selectedId.set(remaining[0]?.id ?? null);
    }
  }
}
