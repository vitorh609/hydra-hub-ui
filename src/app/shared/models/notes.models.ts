export type NoteColor = 'blue' | 'pink' | 'orange' | 'green' | 'teal';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  updatedAt: string;
  createdAt: string;
}
