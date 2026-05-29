import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react"
import { create } from "zustand"

export type AppNodeData = {
  title: string
  label?: string
  excerpt?: string
  author_name?: string
  category_name?: string
  url?: string
  imageUrl?: string
  appearDelay?: number
  [key: string]: any
}

export type AppNode = Node<AppNodeData>

interface GraphState {
  nodes: AppNode[]
  edges: Edge[]
  isLoading: boolean
  activeNodeId: string | null
  selectedNode: AppNode | null
  modalOpen: boolean
  expandSimilar: ((nodeId: string) => void) | null

  // Actions
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  setNodes: (nodes: AppNode[]) => void
  setEdges: (edges: Edge[]) => void
  addNodes: (nodes: AppNode[]) => void
  addEdges: (edges: Edge[]) => void
  setLoading: (loading: boolean) => void
  setActiveNodeId: (nodeId: string | null) => void
  setSelectedNode: (node: AppNode | null) => void
  setModalOpen: (open: boolean) => void
  setExpandSimilar: (handler: ((nodeId: string) => void) | null) => void
  clearGraph: () => void
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  isLoading: false,
  activeNodeId: null,
  selectedNode: null,
  modalOpen: false,
  expandSimilar: null,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
    })
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    })
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNodes: (newNodes) => set({ nodes: [...get().nodes, ...newNodes] }),
  addEdges: (newEdges) => set({ edges: [...get().edges, ...newEdges] }),

  setLoading: (isLoading) => set({ isLoading }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setModalOpen: (modalOpen) => set({ modalOpen }),
  setExpandSimilar: (expandSimilar) => set({ expandSimilar }),

  clearGraph: () =>
    set({
      nodes: [],
      edges: [],
      activeNodeId: null,
      selectedNode: null,
      modalOpen: false,
    }),
}))
