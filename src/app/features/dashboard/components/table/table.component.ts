import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';

import type { RowAction, TableColumn, TableState } from './table.types';
import { IconComponent } from '../../../../core/ui/icon/icon.component';

type Align = 'start' | 'center' | 'end';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgClass, IconComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T> {
  @Input({ required: true }) rows: T[] = [];
  @Input({ required: true }) columns: TableColumn<T>[] = [];
  @Input() actions?: RowAction<T>[];
  @Input({ required: true }) rowId!: (row: T) => string;
  @Input() selectable = true;
  @Input() loading = false;
  @Input() framed = true;
  @Input() state?: TableState;

  @Output() stateChange = new EventEmitter<TableState>();
  @Output() selectionChange = new EventEmitter<string[]>();

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly pageSizeOptions = [5, 10, 20];
  readonly openMenuId = signal<string | null>(null);

  readonly allSelected = computed(() => {
    if (!this.rows.length) {
      return false;
    }
    return this.rows.every((row) => this.selectedIds().has(this.rowId(row)));
  });

  readonly someSelected = computed(() => {
    return this.rows.some((row) => this.selectedIds().has(this.rowId(row))) && !this.allSelected();
  });

  trackRow = (_: number, row: T): string => this.rowId(row);

  getAlignClass(align?: Align): string {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'end':
        return 'text-end';
      default:
        return 'text-start';
    }
  }

  isSelected(row: T): boolean {
    return this.selectedIds().has(this.rowId(row));
  }

  toggleRow(row: T): void {
    const id = this.rowId(row);
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
    this.selectionChange.emit(Array.from(next));
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
      this.selectionChange.emit([]);
      return;
    }

    const next = new Set(this.rows.map((row) => this.rowId(row)));
    this.selectedIds.set(next);
    this.selectionChange.emit(Array.from(next));
  }

  toggleActionMenu(row: T, event: MouseEvent): void {
    event.stopPropagation();
    const id = this.rowId(row);
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeActionMenu(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && target.closest('.table-action-menu')) {
      return;
    }
    this.closeActionMenu();
  }

  getCellValue(row: T, column: TableColumn<T>): string {
    if (column.cell) {
      return column.cell(row);
    }

    if (!column.prop) {
      return '';
    }

    const value = row[column.prop];
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  visibleActions(row: T): RowAction<T>[] {
    if (!this.actions) {
      return [];
    }
    return this.actions.filter((action) => (action.visible ? action.visible(row) : true));
  }

  updatePage(page: number): void {
    if (!this.state) {
      return;
    }
    const totalPages = Math.max(1, Math.ceil(this.state.total / this.state.pageSize));
    const nextPage = Math.min(Math.max(1, page), totalPages);
    this.stateChange.emit({ ...this.state, page: nextPage });
  }

  updatePageSize(size: number): void {
    if (!this.state) {
      return;
    }
    this.stateChange.emit({ ...this.state, pageSize: size, page: 1 });
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const size = Number(target.value);
    if (!Number.isNaN(size)) {
      this.updatePageSize(size);
    }
  }

  getRangeStart(): number {
    if (!this.state || this.state.total === 0) {
      return 0;
    }
    return (this.state.page - 1) * this.state.pageSize + 1;
  }

  getRangeEnd(): number {
    if (!this.state) {
      return 0;
    }
    return Math.min(this.state.page * this.state.pageSize, this.state.total);
  }
}
