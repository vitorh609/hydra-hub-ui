import {Component, inject, OnInit} from '@angular/core';

import { NotesListComponent } from '../notes-list/notes-list.component';
import { NotesEditorComponent } from '../notes-editor/notes-editor.component';
import {NotesStore} from '../notes.store';

@Component({
  selector: 'app-notes-board',
  standalone: true,
  imports: [NotesListComponent, NotesEditorComponent],
  templateUrl: './notes-board.component.html',
  styleUrl: './notes-board.component.scss',
})
export class NotesBoardComponent implements OnInit{
  private readonly store = inject(NotesStore)
  isListCollapsed = false;

  ngOnInit(): void {
    this.store.loadNotes();
  }

  toggleList(): void {
    this.isListCollapsed = !this.isListCollapsed;
  }
}
