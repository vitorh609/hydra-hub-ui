import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CardComponent } from '../../../../core/ui/card/card.component';
import { AppInputComponent } from '../../../../core/ui/input/app-input.component';
import { BadgeComponent, BadgeTone } from '../../../../core/ui/badge/badge.component';
import { TableComponent } from '../table/table.component';
import type { TableColumn } from '../table/table.types';
import type {
  ClickupFolder,
  ClickupList,
  ClickupSpace,
  ClickupTask,
  ConnectClickupDto,
} from '../../../../shared/models/clickup.models';
import { ClickupIntegrationStore } from './clickup-integration.store';

interface ClickupConnectForm {
  token: FormControl<string>;
  defaultWorkspaceId: FormControl<string>;
  defaultWorkspaceName: FormControl<string>;
}

interface GroupedLists {
  folder: ClickupFolder | null;
  lists: ClickupList[];
}

@Component({
  selector: 'app-clickup-integration-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    AppInputComponent,
    BadgeComponent,
    TableComponent,
  ],
  templateUrl: './clickup-integration-board.component.html',
  styleUrl: './clickup-integration-board.component.scss',
})
export class ClickupIntegrationBoardComponent implements OnInit {
  readonly store = inject(ClickupIntegrationStore);

  readonly form = new FormGroup<ClickupConnectForm>({
    token: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    defaultWorkspaceId: new FormControl('', { nonNullable: true }),
    defaultWorkspaceName: new FormControl('', { nonNullable: true }),
  });

  readonly groupedLists = computed<GroupedLists[]>(() => {
    const folders = this.store.folders();
    const lists = this.store.lists();

    const groups: GroupedLists[] = folders.map((folder) => ({
      folder,
      lists: lists.filter((list) => list.folderId === folder.id),
    }));

    const ungroupedLists = lists.filter((list) => !list.folderId);
    if (ungroupedLists.length) {
      groups.unshift({ folder: null, lists: ungroupedLists });
    }

    return groups;
  });

  readonly statusTone = computed<BadgeTone>(() => {
    const status = this.store.status().status;
    if (status === 'connected') {
      return 'success';
    }
    if (status === 'error') {
      return 'danger';
    }
    return 'neutral';
  });

  readonly taskColumns: TableColumn<ClickupTask>[] = [
    {
      key: 'task',
      header: 'Task',
      cell: (task) => this.renderTaskCell(task),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (task) => this.renderStatusCell(task.status),
      align: 'center',
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (task) => this.renderPriorityCell(task.priority),
      align: 'center',
    },
    {
      key: 'assignees',
      header: 'Assignees',
      cell: (task) => this.renderAssigneeCell(task.assigneeIds),
      align: 'center',
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      cell: (task) => this.formatDate(task.dateUpdated),
      align: 'end',
    },
  ];

  ngOnInit(): void {
    this.store.initialize();
  }

  onConnect(): void {
    if (this.form.invalid || this.store.connectLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.store.connect(payload).subscribe({
      next: () => {
        this.form.controls.token.reset('');
      },
    });
  }

  onRefreshStatus(): void {
    this.store.clearFeedback();
    this.store.loadStatus(true);
  }

  onSpaceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value.trim();
    if (value) {
      this.store.selectSpace(value);
    }
  }

  onSelectList(listId: string): void {
    this.store.selectList(listId);
  }

  rowId = (task: ClickupTask): string => task.id;

  trackSpace = (_: number, space: ClickupSpace): string => space.id;
  trackGroup = (_: number, group: GroupedLists): string =>
    group.folder?.id ?? `ungrouped-${group.lists.map((list) => list.id).join('-')}`;
  trackList = (_: number, list: ClickupList): string => list.id;

  formatStatusLabel(status: string): string {
    const normalized = status.trim().toLowerCase();
    if (normalized === 'connected') {
      return 'Connected';
    }
    if (normalized === 'disconnected') {
      return 'Disconnected';
    }
    if (normalized === 'error') {
      return 'Error';
    }
    return this.toTitleCase(status);
  }

  formatLastChecked(value?: string | null): string {
    if (!value) {
      return 'Not checked yet';
    }

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  hasWorkspaceHint(): boolean {
    const status = this.store.status();
    return Boolean(status.defaultWorkspaceId || status.defaultWorkspaceName);
  }

  private buildPayload(): ConnectClickupDto {
    const token = this.form.controls.token.value.trim();
    const defaultWorkspaceId = this.form.controls.defaultWorkspaceId.value.trim();
    const defaultWorkspaceName = this.form.controls.defaultWorkspaceName.value.trim();

    return {
      token,
      ...(defaultWorkspaceId ? { defaultWorkspaceId } : {}),
      ...(defaultWorkspaceName ? { defaultWorkspaceName } : {}),
    };
  }

  private renderTaskCell(task: ClickupTask): string {
    return `
      <div class="clickup-task-cell">
        <div class="clickup-task-title">${this.escapeHtml(task.name)}</div>
        <div class="clickup-task-meta">Task ID ${this.escapeHtml(task.id)}</div>
      </div>
    `;
  }

  private renderStatusCell(status: string): string {
    const normalized = status.trim().toLowerCase();
    const className =
      normalized === 'done' || normalized === 'closed'
        ? 'badge-soft-success'
        : normalized === 'open' || normalized === 'in progress'
          ? 'badge-soft-primary'
          : 'badge-soft-secondary';

    return `<span class="badge ${className}">${this.escapeHtml(this.toTitleCase(status))}</span>`;
  }

  private renderPriorityCell(priority?: string | null): string {
    if (!priority) {
      return '<span class="app-muted">Not set</span>';
    }

    const normalized = priority.trim().toLowerCase();
    const className =
      normalized === 'urgent' || normalized === 'high'
        ? 'badge-soft-danger'
        : normalized === 'normal' || normalized === 'medium'
          ? 'badge-soft-warning'
          : 'badge-soft-secondary';

    return `<span class="badge ${className}">${this.escapeHtml(this.toTitleCase(priority))}</span>`;
  }

  private renderAssigneeCell(assigneeIds: string[]): string {
    const count = assigneeIds.length;
    return count === 0
      ? '<span class="app-muted">Unassigned</span>'
      : `<span class="clickup-assignee-count">${count} assigned</span>`;
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
