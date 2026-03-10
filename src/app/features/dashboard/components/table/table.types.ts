import type { AppIconName } from '../../../../core/ui/icon/icon.component';

export interface TableColumn<T> {
  key: string;
  header: string;
  prop?: keyof T;
  width?: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  cell?: (row: T) => string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon: AppIconName;
  variant?: 'default' | 'danger';
  visible?: (row: T) => boolean;
  action: (row: T) => void;
}

export interface TableState {
  page: number;
  pageSize: number;
  total: number;
}
