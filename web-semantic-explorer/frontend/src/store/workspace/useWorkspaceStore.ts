import { create } from "zustand"
import { syncLinkedContextFlags } from "@/components/Graph/context/syncLinkedContextFlags"
import { migrateGraphSnapshot } from "@/components/Graph/workspace/migrateGraphSnapshot"
import { isLoggedIn } from "@/hooks/useAuth"
import { useGraphStore } from "@/store/useGraphStore"

import {
  buildDefaultStoragePayload,
  buildGuestStoragePayload,
  clearGuestWorkspacesFromStorage,
  createWorkspaceRecord,
  GUEST_WORKSPACE_ID,
  loadGuestWorkspacesFromStorage,
  loadWorkspacesFromStorage,
  saveGuestWorkspacesToStorage,
  saveWorkspacesToStorage,
} from "./storage"
import type {
  WorkspaceGraphSnapshot,
  WorkspaceRecord,
  WorkspaceStoragePayload,
  WorkspaceViewport,
} from "./types"

type WorkspaceState = {
  workspaces: WorkspaceRecord[]
  activeWorkspaceId: string | null
  isHydrated: boolean
  isDirty: boolean
  isGuestMode: boolean

  hydrateFromStorage: () => void
  hydrateForCurrentUser: () => void
  createWorkspace: (name?: string) => string
  switchWorkspace: (workspaceId: string) => void
  renameActiveWorkspace: (name: string) => void
  deleteWorkspace: (workspaceId: string) => void

  captureActiveWorkspace: (viewport?: WorkspaceViewport | null) => void
  markDirty: () => void
  applyActiveWorkspaceToGraph: () => void
  getActiveWorkspace: () => WorkspaceRecord | null
  exportActiveWorkspaceForApi: () => WorkspaceRecord | null
}

function persist(state: WorkspaceState) {
  if (!state.activeWorkspaceId || state.workspaces.length === 0) {
    return
  }

  const payload = {
    schemaVersion: 1 as const,
    activeWorkspaceId: state.activeWorkspaceId,
    workspaces: state.workspaces,
  }

  if (state.isGuestMode) {
    saveGuestWorkspacesToStorage(payload)
    return
  }

  saveWorkspacesToStorage(payload)
}

function guestGraphHasProgress(graph: WorkspaceGraphSnapshot): boolean {
  if (graph.edges.length > 0) {
    return true
  }

  const inputNodes = graph.nodes.filter((node) => node.type === "input")
  if (inputNodes.length !== 1) {
    return true
  }

  const articles = graph.nodes.filter((node) => node.type === "article")
  if (articles.length > 0) {
    return true
  }

  const query = inputNodes[0]?.data?.query
  return typeof query === "string" && query.trim().length > 0
}

function mergeGuestGraphIntoUserPayload(
  payload: WorkspaceStoragePayload,
  guestGraph: WorkspaceGraphSnapshot,
): WorkspaceStoragePayload {
  const activeId = payload.activeWorkspaceId
  const workspaces = payload.workspaces.map((workspace) =>
    workspace.id === activeId
      ? {
          ...workspace,
          updatedAt: new Date().toISOString(),
          graph: migrateGraphSnapshot(guestGraph),
        }
      : workspace,
  )

  return { ...payload, workspaces }
}

function applySnapshotToGraphStore(graph: WorkspaceGraphSnapshot) {
  const migrated = migrateGraphSnapshot(graph)
  const nodes = syncLinkedContextFlags(migrated.nodes, migrated.edges)

  const graphState = useGraphStore.getState()

  useGraphStore.setState({
    nodes,
    edges: migrated.edges,
    activeNodeId: null,
    selectedNode: null,
    modalOpen: false,
    isLoading: false,
    graphRevision: graphState.graphRevision + 1,
  })

  return migrated.viewport
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isHydrated: false,
  isDirty: false,
  isGuestMode: true,

  hydrateFromStorage: () => {
    get().hydrateForCurrentUser()
  },

  hydrateForCurrentUser: () => {
    const guestMode = !isLoggedIn()

    if (guestMode) {
      const stored = loadGuestWorkspacesFromStorage()
      const payload = stored ?? buildGuestStoragePayload()

      if (!stored) {
        saveGuestWorkspacesToStorage(payload)
      }

      set({
        workspaces: payload.workspaces,
        activeWorkspaceId: payload.activeWorkspaceId,
        isHydrated: true,
        isDirty: false,
        isGuestMode: true,
      })

      applySnapshotToGraphStore(payload.workspaces[0].graph)
      return
    }

    const guestStored = loadGuestWorkspacesFromStorage()
    const hadUserStorage = loadWorkspacesFromStorage() !== null
    let payload = hadUserStorage
      ? loadWorkspacesFromStorage()!
      : buildDefaultStoragePayload()
    let shouldPersistUser = !hadUserStorage

    if (guestStored?.workspaces[0]?.graph) {
      const guestGraph = guestStored.workspaces[0].graph
      if (guestGraphHasProgress(guestGraph)) {
        payload = mergeGuestGraphIntoUserPayload(payload, guestGraph)
        shouldPersistUser = true
      }
      clearGuestWorkspacesFromStorage()
    }

    if (shouldPersistUser) {
      saveWorkspacesToStorage(payload)
    }

    set({
      workspaces: payload.workspaces,
      activeWorkspaceId: payload.activeWorkspaceId,
      isHydrated: true,
      isDirty: false,
      isGuestMode: false,
    })

    applySnapshotToGraphStore(
      payload.workspaces.find((ws) => ws.id === payload.activeWorkspaceId)
        ?.graph ?? payload.workspaces[0].graph,
    )
  },

  createWorkspace: (name) => {
    if (get().isGuestMode) {
      return GUEST_WORKSPACE_ID
    }

    const current = get()
    if (current.activeWorkspaceId) {
      get().captureActiveWorkspace()
    }

    const workspace = createWorkspaceRecord(
      name ?? `Investigación ${current.workspaces.length + 1}`,
    )

    const nextWorkspaces = [...get().workspaces, workspace]

    set({
      workspaces: nextWorkspaces,
      activeWorkspaceId: workspace.id,
      isDirty: false,
    })

    applySnapshotToGraphStore(workspace.graph)
    persist(get())

    return workspace.id
  },

  switchWorkspace: (workspaceId) => {
    if (get().isGuestMode) {
      return
    }

    const { activeWorkspaceId, workspaces } = get()
    if (workspaceId === activeWorkspaceId) {
      return
    }

    const target = workspaces.find((ws) => ws.id === workspaceId)
    if (!target) {
      return
    }

    if (activeWorkspaceId) {
      get().captureActiveWorkspace()
    }

    set({ activeWorkspaceId: workspaceId, isDirty: false })
    applySnapshotToGraphStore(target.graph)
    persist(get())
  },

  renameActiveWorkspace: (name) => {
    if (get().isGuestMode) {
      return
    }

    const { activeWorkspaceId, workspaces } = get()
    if (!activeWorkspaceId || !name.trim()) {
      return
    }

    const trimmed = name.trim()
    const now = new Date().toISOString()
    const nextWorkspaces = workspaces.map((ws) =>
      ws.id === activeWorkspaceId
        ? { ...ws, name: trimmed, updatedAt: now }
        : ws,
    )

    set({ workspaces: nextWorkspaces })
    persist(get())
  },

  deleteWorkspace: (workspaceId) => {
    if (get().isGuestMode) {
      return
    }

    const { workspaces, activeWorkspaceId } = get()
    if (workspaces.length <= 1) {
      return
    }

    get().captureActiveWorkspace()

    const nextWorkspaces = workspaces.filter((ws) => ws.id !== workspaceId)
    const nextActiveId =
      activeWorkspaceId === workspaceId
        ? nextWorkspaces[0].id
        : activeWorkspaceId

    set({
      workspaces: nextWorkspaces,
      activeWorkspaceId: nextActiveId,
      isDirty: false,
    })

    const active = nextWorkspaces.find((ws) => ws.id === nextActiveId)
    if (active) {
      applySnapshotToGraphStore(active.graph)
    }

    persist(get())
  },

  markDirty: () => {
    if (!get().isDirty) {
      set({ isDirty: true })
    }
  },

  captureActiveWorkspace: (viewport = null) => {
    const { activeWorkspaceId, workspaces } = get()
    if (!activeWorkspaceId) {
      return
    }

    const { nodes, edges } = useGraphStore.getState()
    const now = new Date().toISOString()

    const graph: WorkspaceGraphSnapshot = {
      nodes,
      edges,
      viewport,
    }

    const nextWorkspaces = workspaces.map((ws) =>
      ws.id === activeWorkspaceId ? { ...ws, updatedAt: now, graph } : ws,
    )

    set({ workspaces: nextWorkspaces, isDirty: false })
    persist(get())
  },

  applyActiveWorkspaceToGraph: () => {
    const active = get().getActiveWorkspace()
    if (!active) {
      return null
    }

    return applySnapshotToGraphStore(active.graph)
  },

  getActiveWorkspace: () => {
    const { activeWorkspaceId, workspaces } = get()
    if (!activeWorkspaceId) {
      return null
    }
    return workspaces.find((ws) => ws.id === activeWorkspaceId) ?? null
  },

  exportActiveWorkspaceForApi: () => {
    get().captureActiveWorkspace()
    return get().getActiveWorkspace()
  },
}))
