export {
  WORKSPACE_SCHEMA_VERSION,
  workspaceToApiBody,
  type WorkspaceApiBody,
  type WorkspaceGraphSnapshot,
  type WorkspaceRecord,
  type WorkspaceSchemaVersion,
  type WorkspaceStoragePayload,
  type WorkspaceViewport,
} from "./model/types"
export { useWorkspaceStore } from "./model/useWorkspaceStore"
export {
  GUEST_WORKSPACE_ID,
  buildDefaultStoragePayload,
  buildGuestStoragePayload,
  clearGuestWorkspacesFromStorage,
  createEmptyGraphSnapshot,
  createWorkspaceRecord,
  loadGuestWorkspacesFromStorage,
  loadWorkspacesFromStorage,
  saveGuestWorkspacesToStorage,
  saveWorkspacesToStorage,
} from "./model/storage"
