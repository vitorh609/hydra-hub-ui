import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { Note } from '../../../../../shared/models/notes.models';
import { IconComponent } from '../../../../../core/ui/icon/icon.component';

@Component({
  selector: 'app-note-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './note-item.component.html',
  styleUrl: './note-item.component.scss',
})
export class NoteItemComponent {
  @Input({ required: true }) note!: Note;
  @Input() selected = false;

  @Output() select = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();

  get formattedDate(): string {
    const date = new Date(this.note.updatedAt);

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
      date,
    );
  }

  onSelect(): void {
    this.select.emit(this.note.id);
  }

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(this.note.id);
  }
}
