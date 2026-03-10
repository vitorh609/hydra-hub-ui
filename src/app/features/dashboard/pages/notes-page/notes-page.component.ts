import { Component } from '@angular/core';

import { NotesBoardComponent } from '../../components/notes/notes-board/notes-board.component';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [NotesBoardComponent],
  template: '<app-notes-board></app-notes-board>',
})
export class NotesPageComponent {}
