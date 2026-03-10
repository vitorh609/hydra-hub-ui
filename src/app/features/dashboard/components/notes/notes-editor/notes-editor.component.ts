import { Component, EventEmitter, OnDestroy, Output, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, map } from 'rxjs';

import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import { AppInputComponent } from '../../../../../core/ui/input/app-input.component';
import { NotesStore } from '../notes.store';
import type { NoteColor } from '../../../../../shared/models/notes.models';
import type { UpdateNoteDto } from '../../../../../services/notes/notes.service';

type NoteDraft = Required<UpdateNoteDto>;

@Component({
  selector: 'app-notes-editor',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, AppInputComponent],
  templateUrl: './notes-editor.component.html',
  styleUrl: './notes-editor.component.scss',
})
export class NotesEditorComponent implements OnDestroy {
  private readonly store = inject(NotesStore);
  private readonly router = inject(Router);
  private currentNoteId: string | null = null;
  private isPersisting = false;
  private shouldPersistAgain = false;
  private readonly lastPersistedDraftByNoteId = new Map<string, NoteDraft>();

  readonly selectedNote = this.store.selectedNote;
  readonly colors: NoteColor[] = ['blue', 'pink', 'orange', 'green', 'teal'];

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    content: new FormControl('', { nonNullable: true }),
  });
  @Output() toggleList = new EventEmitter<void>();

  constructor() {
    this.setupSelectedNoteSync();
    this.setupDraftStateSync();
    this.setupInactivityAutoSave();
    this.setupRouteChangeFlush();
  }

  addNote(): void {
    this.store.createNote();
  }

  onToggleList(): void {
    this.toggleList.emit();
  }

  setColor(color: NoteColor): void {
    this.store.setColor(color);
    // Mudanca de cor deve ser persistida sem esperar novo input no formulario.
    void this.flushCurrentDraft();
  }

  ngOnDestroy(): void {
    // Flush final ao sair do componente (troca de rota, destroy por layout, etc).
    void this.flushCurrentDraft();
  }

  private setupSelectedNoteSync(): void {
    effect(() => {
      const note = this.store.selectedNote();
      const nextNoteId = note?.id ?? null;
      const didSelectedNoteChange = this.currentNoteId !== nextNoteId;
      if (!didSelectedNoteChange) {
        return;
      }

      // Antes de trocar de nota no editor, tenta persistir o draft atual.
      void this.flushCurrentDraft(this.currentNoteId);
      this.currentNoteId = nextNoteId;

      if (!note) {
        this.form.reset({ title: '', content: '' }, { emitEvent: false });
        this.form.disable({ emitEvent: false });
        return;
      }

      this.rememberPersistedDraft(note.id, {
        title: note.title,
        content: note.content,
        color: note.color,
      });
      this.form.patchValue(
        {
          title: note.title,
          content: note.content,
        },
        { emitEvent: false },
      );
      this.form.enable({ emitEvent: false });
    });
  }

  private setupDraftStateSync(): void {
    // Mantem o estado local em tempo real para refletir na lista e no preview.
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.store.updateDraft(this.form.getRawValue());
    });
  }

  private setupInactivityAutoSave(): void {
    // Persistencia dinamica apos 10s de inatividade.
    this.form.valueChanges
      .pipe(
        map(() => (this.currentNoteId ? this.buildObjetctInput(this.currentNoteId) : null)),
        filter((draft): draft is NoteDraft => draft !== null),
        debounceTime(10000),
        distinctUntilChanged((previousDraft, currentDraft) =>
          this.areDraftsEqual(previousDraft, currentDraft),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        void this.flushCurrentDraft();
      });
  }

  private setupRouteChangeFlush(): void {
    // Flush ao navegar para outra rota.
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        void this.flushCurrentDraft();
      });
  }

  // Guardar “último estado persistido” por nota para suportar dirty check
  private rememberPersistedDraft(noteId: string, draft: NoteDraft): void {
    if (!this.lastPersistedDraftByNoteId.has(noteId)) {
      this.lastPersistedDraftByNoteId.set(noteId, draft);
    }
  }

  // Monta o payload de persistencia da nota atual (form + cor atual no store).
  private buildObjetctInput(noteId: string): NoteDraft | null {
    const currentNote = this.store.notes().find((note) => note.id === noteId);
    if (!currentNote) {
      return null;
    }

    const formValue = this.form.getRawValue();
    return {
      title: formValue.title,
      content: formValue.content,
      color: currentNote.color,
    };
  }

  private isDraftDirty(noteId: string, currentDraft: NoteDraft): boolean {
    const lastPersistedDraft = this.lastPersistedDraftByNoteId.get(noteId);
    if (!lastPersistedDraft) {
      return true;
    }

    return !this.areDraftsEqual(lastPersistedDraft, currentDraft);
  }

  private areDraftsEqual(left: NoteDraft, right: NoteDraft): boolean {
    return left.title === right.title && left.content === right.content && left.color === right.color;
  }

  private async flushCurrentDraft(noteId = this.currentNoteId): Promise<void> {
    if (!noteId) {
      return;
    }

    const currentDraft = this.buildObjetctInput(noteId);
    if (!currentDraft) {
      return;
    }

    if (!this.isDraftDirty(noteId, currentDraft)) {
      return;
    }

    if (this.isPersisting) {
      this.shouldPersistAgain = true;
      return;
    }

    this.isPersisting = true;
    try {
      const savedNote = await firstValueFrom(this.store.persistNoteDraft(noteId, currentDraft));
      const persistedNoteId = savedNote.id ?? noteId;
      if (persistedNoteId !== noteId) {
        this.lastPersistedDraftByNoteId.delete(noteId);
      }
      this.lastPersistedDraftByNoteId.set(persistedNoteId, currentDraft);
    } catch {
      // Erro de rede fica silencioso; o draft continua dirty para nova tentativa.
    } finally {
      this.isPersisting = false;
      if (this.shouldPersistAgain) {
        this.shouldPersistAgain = false;
        void this.flushCurrentDraft();
      }
    }
  }
}
