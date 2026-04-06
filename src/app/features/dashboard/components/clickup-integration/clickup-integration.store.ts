import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import type {
  ClickupConnectionStatus,
  ClickupFolder,
  ClickupList,
  ClickupSpace,
  ClickupTask,
  ClickupTaskPagination,
  ConnectClickupDto,
} from '../../../../shared/models/clickup.models';
import { ClickupService } from '../../../../services/clickup/clickup.service';

export type ClickupFeedbackTone = 'success' | 'danger';

export interface ClickupFeedback {
  tone: ClickupFeedbackTone;
  message: string;
}

const disconnectedStatus: ClickupConnectionStatus = {
  connected: false,
  status: 'disconnected',
  defaultWorkspaceId: null,
  defaultWorkspaceName: null,
  lastCheckedAt: null,
  message: null,
  errorMessage: null,
};

const emptyPagination: ClickupTaskPagination = {
  page: 0,
  hasMore: false,
};

@Injectable({ providedIn: 'root' })
export class ClickupIntegrationStore {
  private readonly clickupService = inject(ClickupService);

  readonly status = signal<ClickupConnectionStatus>(disconnectedStatus);
  readonly spaces = signal<ClickupSpace[]>([]);
  readonly folders = signal<ClickupFolder[]>([]);
  readonly lists = signal<ClickupList[]>([]);
  readonly tasks = signal<ClickupTask[]>([]);
  readonly selectedSpaceId = signal<string | null>(null);
  readonly selectedListId = signal<string | null>(null);
  readonly tasksPagination = signal<ClickupTaskPagination>(emptyPagination);
  readonly feedback = signal<ClickupFeedback | null>(null);
  readonly statusError = signal<string | null>(null);
  readonly spacesError = signal<string | null>(null);
  readonly hierarchyError = signal<string | null>(null);
  readonly tasksError = signal<string | null>(null);

  readonly statusLoading = signal(false);
  readonly connectLoading = signal(false);
  readonly spacesLoading = signal(false);
  readonly hierarchyLoading = signal(false);
  readonly tasksLoading = signal(false);

  readonly selectedSpace = computed(() =>
    this.spaces().find((space) => space.id === this.selectedSpaceId()) ?? null,
  );

  readonly selectedList = computed(() =>
    this.lists().find((list) => list.id === this.selectedListId()) ?? null,
  );

  readonly isConnected = computed(() => this.status().connected);

  initialize(): void {
    this.loadStatus(true);
  }

  connect(payload: ConnectClickupDto): Observable<void> {
    this.feedback.set(null);
    this.connectLoading.set(true);

    return this.clickupService.connect(payload).pipe(
      switchMap(() =>
        forkJoin({
          status: this.clickupService.getStatus(),
          spaces: this.clickupService.listSpaces(),
        }),
      ),
      tap(({ status, spaces }) => {
        this.status.set(this.normalizeStatus(status));
        this.statusError.set(null);
        this.spaces.set(spaces);
        this.spacesError.set(null);
        this.feedback.set({
          tone: 'success',
          message: 'ClickUp connected successfully. Your spaces are ready to explore.',
        });

        const nextSpaceId = this.pickSpaceIdAfterLoad(spaces);
        if (!nextSpaceId) {
          this.clearHierarchySelection();
          return;
        }

        this.loadHierarchy(nextSpaceId);
      }),
      map(() => void 0),
      catchError((error) => {
        const message = this.resolveErrorMessage(error, 'Unable to connect ClickUp right now.');
        this.feedback.set({ tone: 'danger', message });
        return EMPTY;
      }),
      finalize(() => this.connectLoading.set(false)),
    );
  }

  loadStatus(loadSpacesOnSuccess = false): void {
    this.statusLoading.set(true);
    this.statusError.set(null);

    this.clickupService
      .getStatus()
      .pipe(
        tap((status) => {
          const nextStatus = this.normalizeStatus(status);
          this.status.set(nextStatus);

          if (!nextStatus.connected) {
            this.spaces.set([]);
            this.clearHierarchySelection();
            return;
          }

          if (loadSpacesOnSuccess) {
            this.loadSpaces();
          }
        }),
        catchError((error) => {
          const message = this.resolveErrorMessage(
            error,
            'Unable to verify the ClickUp connection.',
          );
          this.statusError.set(message);
          this.status.set({
            ...disconnectedStatus,
            status: 'error',
            errorMessage: message,
            message,
          });
          this.spaces.set([]);
          this.clearHierarchySelection();
          return EMPTY;
        }),
        finalize(() => this.statusLoading.set(false)),
      )
      .subscribe();
  }

  loadSpaces(): void {
    if (!this.status().connected) {
      this.spaces.set([]);
      this.clearHierarchySelection();
      return;
    }

    this.spacesLoading.set(true);
    this.spacesError.set(null);

    this.clickupService
      .listSpaces()
      .pipe(
        tap((spaces) => {
          this.spaces.set(spaces);
          const nextSpaceId = this.pickSpaceIdAfterLoad(spaces);
          if (!nextSpaceId) {
            this.clearHierarchySelection();
            return;
          }

          this.loadHierarchy(nextSpaceId);
        }),
        catchError((error) => {
          this.spacesError.set(
            this.resolveErrorMessage(error, 'Unable to load ClickUp spaces right now.'),
          );
          this.spaces.set([]);
          this.clearHierarchySelection();
          return EMPTY;
        }),
        finalize(() => this.spacesLoading.set(false)),
      )
      .subscribe();
  }

  selectSpace(spaceId: string): void {
    if (!spaceId || this.selectedSpaceId() === spaceId) {
      return;
    }

    this.loadHierarchy(spaceId);
  }

  loadHierarchy(spaceId: string): void {
    this.selectedSpaceId.set(spaceId);
    this.selectedListId.set(null);
    this.folders.set([]);
    this.lists.set([]);
    this.tasks.set([]);
    this.tasksPagination.set(emptyPagination);
    this.hierarchyLoading.set(true);
    this.hierarchyError.set(null);
    this.tasksError.set(null);

    this.clickupService
      .getSpaceHierarchy(spaceId)
      .pipe(
        tap((hierarchy) => {
          this.folders.set(hierarchy.folders ?? []);
          this.lists.set(hierarchy.lists ?? []);

          const firstListId = hierarchy.lists[0]?.id ?? null;
          this.selectedListId.set(firstListId);

          if (firstListId) {
            this.loadTasks(firstListId, 0);
          } else {
            this.tasks.set([]);
            this.tasksPagination.set(emptyPagination);
          }
        }),
        catchError((error) => {
          this.hierarchyError.set(
            this.resolveErrorMessage(error, 'Unable to load folders and lists for this space.'),
          );
          this.folders.set([]);
          this.lists.set([]);
          this.tasks.set([]);
          this.tasksPagination.set(emptyPagination);
          return EMPTY;
        }),
        finalize(() => this.hierarchyLoading.set(false)),
      )
      .subscribe();
  }

  selectList(listId: string): void {
    if (!listId) {
      return;
    }

    this.selectedListId.set(listId);
    this.loadTasks(listId, 0);
  }

  loadPreviousTasksPage(): void {
    const listId = this.selectedListId();
    const page = this.tasksPagination().page;

    if (!listId || page <= 0 || this.tasksLoading()) {
      return;
    }

    this.loadTasks(listId, page - 1);
  }

  loadNextTasksPage(): void {
    const listId = this.selectedListId();
    const pagination = this.tasksPagination();

    if (!listId || !pagination.hasMore || this.tasksLoading()) {
      return;
    }

    this.loadTasks(listId, pagination.page + 1);
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  private loadTasks(listId: string, page: number): void {
    this.tasksLoading.set(true);
    this.tasksError.set(null);

    this.clickupService
      .listTasks(listId, page)
      .pipe(
        tap((taskPage) => {
          this.tasks.set(taskPage.tasks ?? []);
          this.tasksPagination.set(taskPage.pagination ?? { page, hasMore: false });
        }),
        catchError((error) => {
          this.tasksError.set(
            this.resolveErrorMessage(error, 'Unable to load tasks for the selected list.'),
          );
          this.tasks.set([]);
          this.tasksPagination.set({ page, hasMore: false });
          return EMPTY;
        }),
        finalize(() => this.tasksLoading.set(false)),
      )
      .subscribe();
  }

  private pickSpaceIdAfterLoad(spaces: ClickupSpace[]): string | null {
    const current = this.selectedSpaceId();
    if (current && spaces.some((space) => space.id === current)) {
      return current;
    }

    const preferredWorkspaceId = this.status().defaultWorkspaceId;
    const preferredSpace =
      spaces.find((space) => space.workspace.id === preferredWorkspaceId) ?? spaces[0] ?? null;

    return preferredSpace?.id ?? null;
  }

  private clearHierarchySelection(): void {
    this.selectedSpaceId.set(null);
    this.selectedListId.set(null);
    this.folders.set([]);
    this.lists.set([]);
    this.tasks.set([]);
    this.tasksPagination.set(emptyPagination);
    this.hierarchyError.set(null);
    this.tasksError.set(null);
  }

  private normalizeStatus(status: ClickupConnectionStatus): ClickupConnectionStatus {
    return {
      ...disconnectedStatus,
      ...status,
    };
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage =
        (typeof error.error?.message === 'string' && error.error.message) ||
        (typeof error.error?.error === 'string' && error.error.error) ||
        (typeof error.message === 'string' && error.message) ||
        null;

      return apiMessage ?? fallback;
    }

    return fallback;
  }
}
