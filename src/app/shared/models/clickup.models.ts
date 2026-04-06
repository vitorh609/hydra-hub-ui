export interface ConnectClickupDto {
  token: string;
  defaultWorkspaceId?: string;
  defaultWorkspaceName?: string;
}

export interface ClickupConnectionStatus {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error' | string;
  defaultWorkspaceId?: string | null;
  defaultWorkspaceName?: string | null;
  lastCheckedAt?: string | null;
  message?: string | null;
  errorMessage?: string | null;
}

export interface ClickupWorkspaceRef {
  id: string;
  name: string;
}

export interface ClickupSpace {
  id: string;
  name: string;
  private: boolean;
  workspace: ClickupWorkspaceRef;
}

export interface ClickupFolder {
  id: string;
  name: string;
  hidden: boolean;
  spaceId: string;
}

export interface ClickupList {
  id: string;
  name: string;
  spaceId: string;
  folderId?: string | null;
}

export interface ClickupSpaceHierarchy {
  spaceId: string;
  folders: ClickupFolder[];
  lists: ClickupList[];
}

export interface ClickupTask {
  id: string;
  name: string;
  status: string;
  priority?: string | null;
  listId: string;
  dateCreated: string;
  dateUpdated: string;
  assigneeIds: string[];
}

export interface ClickupTaskPagination {
  page: number;
  hasMore: boolean;
}

export interface ClickupTaskPage {
  listId: string;
  pagination: ClickupTaskPagination;
  tasks: ClickupTask[];
}
