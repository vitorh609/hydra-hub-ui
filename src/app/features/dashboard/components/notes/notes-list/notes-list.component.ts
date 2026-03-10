import {Component, effect, inject, OnInit} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IconComponent } from '../../../../../core/ui/icon/icon.component';
import { NotesStore } from '../notes.store';
import { NoteItemComponent } from '../note-item/note-item.component';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, NoteItemComponent],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.scss',
})
export class NotesListComponent {
  private readonly store = inject(NotesStore);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly searchCtrl = new FormControl('', { nonNullable: true });
  readonly notes = this.store.filteredNotes;
  readonly selectedId = this.store.selectedId;

  constructor() {
    this.searchCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.store.setQuery(value));

    effect(() => {
      const query = this.store.query();
      if (this.searchCtrl.value !== query) {
        this.searchCtrl.setValue(query, { emitEvent: false });
      }
    });
  }


  selectNote(id: string): void {
    this.store.selectNote(id);
  }

  async deleteNote(id: string): Promise<void> {
    const confirmed = await this.confirmDialog.open({
      title: 'Delete note',
      message: 'This action cannot be undone. Do you want to delete this note?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (!confirmed) {
      return;
    }

    this.store.deleteNote(id);
  }
}
