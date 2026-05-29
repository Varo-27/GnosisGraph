import {
    Background,
    BackgroundVariant,
    Controls,
    type Edge,
    MiniMap,
    type NodeTypes,
    ReactFlow,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { type HierarchyPointNode, hierarchy, tree } from "d3-hierarchy"
import { useCallback, useEffect } from "react"

import { GraphService, SearchService } from "@/client"
import { useTheme } from "@/components/theme-provider"
import { type AppNode, useGraphStore } from "@/store/useGraphStore"
import { ArticleNodeModal } from "./ArticleNodeModal"
import { ArticleNode } from "./nodes/ArticleNode"
import { SearchNode } from "./nodes/SearchNode"
import { SearchBar } from "./SearchBar"

const nodeTypes: NodeTypes = {
    article: ArticleNode,
    searchCenter: SearchNode,
}

const getStaggerDelay = (index: number, base = 140, step = 90) => {
    const jitter = Math.floor(Math.random() * 35)
    return base + index * step + jitter
}

type TreeDatum = {
    id: string
    children?: TreeDatum[]
}

const buildHierarchyData = (
    rootId: string,
    nodes: AppNode[],
    edges: Edge[],
) => {
    const adjacency = new Map<string, string[]>()

    edges.forEach((edge) => {
        const source = String(edge.source)
        const target = String(edge.target)
        const current = adjacency.get(source) ?? []
        adjacency.set(source, [...current, target])
    })

    const visited = new Set<string>()

    const buildNode = (id: string): TreeDatum => {
        visited.add(id)
        const childrenIds = adjacency.get(id) ?? []
        const children = childrenIds
            .filter((childId) => !visited.has(childId))
            .map((childId) => buildNode(childId))

        return children.length ? { id, children } : { id }
    }

    const root = buildNode(rootId)
    const extraChildren = nodes
        .map((node) => node.id)
        .filter((nodeId) => !visited.has(nodeId))
        .map((nodeId) => ({ id: nodeId }))

    if (extraChildren.length > 0) {
        root.children = [...(root.children ?? []), ...extraChildren]
    }

    return root
}

const applyTreeLayout = (nodes: AppNode[], edges: Edge[]) => {
    if (nodes.length === 0) {
        return nodes
    }

    const rootId =
        nodes.find((node) => node.id === "search-root")?.id ?? nodes[0].id
    const hierarchyData = buildHierarchyData(rootId, nodes, edges)
    const root = hierarchy<TreeDatum>(hierarchyData)

    const nodeWidth = 300
    const nodeHeight = 220
    const horizontalGap = 140
    const verticalGap = 220
    const layout = tree<TreeDatum>().nodeSize([
        nodeWidth + horizontalGap,
        nodeHeight + verticalGap,
    ])

    const layoutRoot = layout(root)
    const descendants: HierarchyPointNode<TreeDatum>[] = layoutRoot.descendants()
    const xValues = descendants.map((descendant) => descendant.x)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const offsetX = window.innerWidth / 2 - (minX + maxX) / 2
    const offsetY = 140

    const positionMap = new Map(
        descendants.map((descendant) => [descendant.data.id, descendant]),
    )

    return nodes.map((node) => {
        const descendant = positionMap.get(node.id)
        if (!descendant) {
            return node
        }

        return {
            ...node,
            position: {
                x: descendant.x + offsetX - nodeWidth / 2,
                y: descendant.y + offsetY,
            },
        }
    })
}

export default function GraphExplorer() {
    const { resolvedTheme } = useTheme()
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
        isLoading,
        setLoading,
        activeNodeId,
        setActiveNodeId,
        selectedNode,
        setSelectedNode,
        modalOpen,
        setModalOpen,
        setExpandSimilar,
    } = useGraphStore()

    const expandSimilarFromNode = useCallback(
        async (node: AppNode) => {
            const sourceId = Number(node.id)
            if (!Number.isFinite(sourceId)) {
                return
            }

            const existingIds = nodes
                .map((currentNode) => Number(currentNode.id))
                .filter((id) => Number.isFinite(id))

            setLoading(true)

            try {
                const response = await GraphService.expandGraph({
                    requestBody: {
                        source_article_id: sourceId,
                        existing_node_ids: existingIds,
                    },
                    limit: 5,
                    threshold: 0.85,
                })

                const newNodes = response.new_nodes.map((newNode, index) => ({
                    id: newNode.id,
                    type: "article",
                    position: {
                        x: node.position.x,
                        y: node.position.y + 80,
                    },
                    data: {
                        title: newNode.data.title || "Sin titulo",
                        excerpt: newNode.data.excerpt || undefined,
                        url: newNode.data.url,
                        imageUrl: newNode.data.image_url || undefined,
                        author_name: newNode.data.authors?.length
                            ? newNode.data.authors.join(", ")
                            : undefined,
                        appearDelay: getStaggerDelay(index, 120, 80),
                    },
                }))

                const newEdges = response.new_edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                }))

                const mergedNodes = [...nodes, ...newNodes]
                const mergedEdges = [...edges, ...newEdges].filter(
                    (edge, index, self) =>
                        self.findIndex(
                            (candidate) => candidate.id === edge.id,
                        ) === index,
                )

                const layoutNodes = applyTreeLayout(mergedNodes, mergedEdges)

                setNodes(layoutNodes)
                setEdges(mergedEdges)
            } catch (error) {
                console.error("Error expanding graph:", error)
            } finally {
                setLoading(false)
            }
        },
        [edges, nodes, setEdges, setLoading, setNodes],
    )

    useEffect(() => {
        setExpandSimilar((nodeId: string) => {
            const node = useGraphStore.getState().nodes.find((n) => n.id === nodeId)
            if (node) {
                void expandSimilarFromNode(node)
            }
        })

        return () => setExpandSimilar(null)
    }, [expandSimilarFromNode, setExpandSimilar])

    const _handleSearch = async (query: string) => {
        setLoading(true)
        setActiveNodeId(null)
        setSelectedNode(null)
        setModalOpen(false)
        try {
            const response = await SearchService.searchArticles({
                q: query,
                limit: 5,
            })

            const _centralNode = {
                id: "search-root",
                type: "searchCenter",
                position: {
                    x: window.innerWidth / 2 - 140,
                    y: window.innerHeight / 2 - 40,
                },
                data: {
                    title: `Búsqueda: ${query}`,
                    appearDelay: 0,
                },
            }

            const spread = Math.PI / 1.3
            const baseAngle = Math.PI / 2
            const total = response.results.length

            const _newNodes = response.results.map((article, i) => {
                const t = total > 1 ? i / (total - 1) : 0.5
                const jitter = (Math.random() - 0.5) * 0.3
                const angle = baseAngle - spread / 2 + t * spread + jitter
                return {
                    id: String(article.id),
                    type: "article",
                    position: {
                        x: window.innerWidth / 2 + 560 * Math.cos(angle) - 160,
                        y: window.innerHeight / 2 + 560 * Math.sin(angle) - 60,
                    },
                    data: {
                        title: article.title || "Sin título",
                        excerpt: article.excerpt || undefined,
                        url: article.url,
                        imageUrl: article.image_url || undefined,
                        author_name: article.authors?.length
                            ? article.authors.join(", ")
                            : undefined,
                        appearDelay: getStaggerDelay(i, 160, 90),
                    },
                }
            })

            const newEdges = response.results.map((article) => ({
                id: `edge-root-${article.id}`,
                source: "search-root",
                target: String(article.id),
            }))

            const nextNodes = [_centralNode, ..._newNodes]
            const layoutNodes = applyTreeLayout(nextNodes, newEdges)

            setNodes(layoutNodes)
            setEdges(newEdges)
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const _handleNodeClick = (_event: unknown, node: AppNode) => {
        if (node.id === "search-root") {
            return
        }

        setActiveNodeId(node.id)
        setSelectedNode(node)
        setModalOpen(true)
    }

    return (
        <div className="relative w-full h-full bg-muted/20">
            <SearchBar onSearch={_handleSearch} isLoading={isLoading} />
            <ArticleNodeModal
                node={selectedNode}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={_handleNodeClick}
                colorMode={resolvedTheme}
                fitView
            >
                <Controls />
                <MiniMap
                    nodeColor={(node) =>
                        node.id === activeNodeId
                            ? "var(--color-primary)"
                            : "var(--color-muted-foreground)"
                    }
                />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    )
}
