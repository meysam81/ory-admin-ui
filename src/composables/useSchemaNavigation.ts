import { ref, computed, type Ref } from "vue"

interface PropertySchema {
  type?: string | string[]
  properties?: Record<string, PropertySchema>
  items?: PropertySchema
  required?: string[]
  [key: string]: unknown
}

interface JsonSchema {
  properties?: {
    traits?: {
      properties?: Record<string, PropertySchema>
      required?: string[]
    }
  }
  [key: string]: unknown
}

interface TreeNode {
  path: string
  name: string
  schema: PropertySchema
  required: boolean
  depth: number
  children: TreeNode[]
}

export function useSchemaNavigation(schema: Ref<JsonSchema | null>) {
  const focusedPath = ref("")
  const selectedPath = ref("")
  const expandedPaths = ref<Set<string>>(new Set(["traits"]))
  const searchQuery = ref("")
  const isFullscreen = ref(false)

  // Build flat list of all paths for navigation
  const allPaths = computed(() => {
    if (!schema.value?.properties?.traits?.properties) return []
    const paths: string[] = []

    function collectPaths(properties: Record<string, PropertySchema>, prefix = "", depth = 0) {
      for (const [name, propSchema] of Object.entries(properties)) {
        const path = prefix ? `${prefix}.${name}` : name
        paths.push(path)

        // Only recurse into expanded nodes
        if (expandedPaths.value.has(path)) {
          if (propSchema.properties) {
            collectPaths(propSchema.properties, path, depth + 1)
          }
          if (propSchema.items?.properties) {
            const itemPath = `${path}.[items]`
            paths.push(itemPath)
            if (expandedPaths.value.has(itemPath)) {
              collectPaths(propSchema.items.properties, itemPath, depth + 2)
            }
          }
        }
      }
    }

    collectPaths(schema.value.properties.traits.properties)
    return paths
  })

  // Build tree structure for filtering
  function buildTree(): TreeNode[] {
    if (!schema.value?.properties?.traits?.properties) return []
    const traits = schema.value.properties.traits
    const required = traits.required || []

    function buildNode(
      name: string,
      propSchema: PropertySchema,
      isRequired: boolean,
      parentPath: string,
      depth: number
    ): TreeNode {
      const path = parentPath ? `${parentPath}.${name}` : name
      const children: TreeNode[] = []

      if (propSchema.properties) {
        const childRequired = propSchema.required || []
        for (const [childName, childSchema] of Object.entries(propSchema.properties)) {
          children.push(
            buildNode(childName, childSchema, childRequired.includes(childName), path, depth + 1)
          )
        }
      }

      if (propSchema.items?.properties) {
        const itemRequired = propSchema.items.required || []
        const itemPath = `${path}.[items]`
        const itemChildren: TreeNode[] = []
        for (const [childName, childSchema] of Object.entries(propSchema.items.properties)) {
          itemChildren.push(
            buildNode(childName, childSchema, itemRequired.includes(childName), itemPath, depth + 2)
          )
        }
        children.push({
          path: itemPath,
          name: "[items]",
          schema: propSchema.items,
          required: false,
          depth: depth + 1,
          children: itemChildren,
        })
      }

      return {
        path,
        name,
        schema: propSchema,
        required: isRequired,
        depth,
        children,
      }
    }

    return Object.entries(traits.properties!).map(([name, propSchema]) =>
      buildNode(name, propSchema, required.includes(name), "", 0)
    )
  }

  const tree = computed(() => buildTree())

  // Filter tree by search query
  const filteredTree = computed(() => {
    if (!searchQuery.value.trim()) return tree.value

    const query = searchQuery.value.toLowerCase()

    function filterNode(node: TreeNode): TreeNode | null {
      const matchesName = node.name.toLowerCase().includes(query)
      const matchesType = getType(node.schema).toLowerCase().includes(query)
      const matchesFormat =
        typeof node.schema.format === "string" && node.schema.format.toLowerCase().includes(query)

      const filteredChildren = node.children
        .map(filterNode)
        .filter((n): n is TreeNode => n !== null)

      if (matchesName || matchesType || matchesFormat || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }

      return null
    }

    return tree.value.map(filterNode).filter((n): n is TreeNode => n !== null)
  })

  function getType(propSchema: PropertySchema): string {
    if (Array.isArray(propSchema.type)) return propSchema.type[0] || "any"
    return propSchema.type || "any"
  }

  // Navigation functions
  function moveUp() {
    const paths = allPaths.value
    if (paths.length === 0) return

    const currentIndex = paths.indexOf(focusedPath.value)
    if (currentIndex === -1) {
      focusedPath.value = paths[0]
    } else if (currentIndex > 0) {
      focusedPath.value = paths[currentIndex - 1]
    }
  }

  function moveDown() {
    const paths = allPaths.value
    if (paths.length === 0) return

    const currentIndex = paths.indexOf(focusedPath.value)
    if (currentIndex === -1) {
      focusedPath.value = paths[0]
    } else if (currentIndex < paths.length - 1) {
      focusedPath.value = paths[currentIndex + 1]
    }
  }

  function toggleExpand(path?: string) {
    const targetPath = path || focusedPath.value
    if (!targetPath) return

    const newSet = new Set(expandedPaths.value)
    if (newSet.has(targetPath)) {
      newSet.delete(targetPath)
    } else {
      newSet.add(targetPath)
    }
    expandedPaths.value = newSet
  }

  function select(path?: string) {
    const targetPath = path || focusedPath.value
    if (targetPath) {
      selectedPath.value = targetPath
    }
  }

  function expandAll() {
    const paths = new Set<string>()
    function collectExpandable(nodes: TreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          paths.add(node.path)
          collectExpandable(node.children)
        }
      }
    }
    collectExpandable(tree.value)
    expandedPaths.value = paths
  }

  function collapseAll() {
    expandedPaths.value = new Set()
  }

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowUp":
      case "k":
        event.preventDefault()
        moveUp()
        break
      case "ArrowDown":
      case "j":
        event.preventDefault()
        moveDown()
        break
      case "ArrowRight":
        event.preventDefault()
        if (focusedPath.value && !expandedPaths.value.has(focusedPath.value)) {
          toggleExpand()
        }
        break
      case "ArrowLeft":
        event.preventDefault()
        if (focusedPath.value && expandedPaths.value.has(focusedPath.value)) {
          toggleExpand()
        }
        break
      case "Enter":
        event.preventDefault()
        select()
        break
      case "/":
        event.preventDefault()
        // Focus search is handled by the component
        break
      case "Escape":
        event.preventDefault()
        if (isFullscreen.value) {
          isFullscreen.value = false
        } else if (searchQuery.value) {
          searchQuery.value = ""
        }
        break
    }
  }

  // Get schema for a path
  function getSchemaAtPath(path: string): PropertySchema | null {
    if (!schema.value?.properties?.traits?.properties) return null

    const parts = path.split(".")
    let current: PropertySchema | undefined = schema.value.properties.traits.properties[parts[0]]

    for (let i = 1; i < parts.length && current; i++) {
      const part = parts[i]
      if (part === "[items]") {
        current = current.items
      } else if (current.properties) {
        current = current.properties[part]
      } else {
        return null
      }
    }

    return current || null
  }

  // Check if a path is required
  function isPathRequired(path: string): boolean {
    if (!schema.value?.properties?.traits) return false

    const parts = path.split(".")
    if (parts.length === 1) {
      return schema.value.properties.traits.required?.includes(parts[0]) ?? false
    }

    // Navigate to parent and check its required array
    const parentPath = parts.slice(0, -1).join(".")
    const parentSchema = getSchemaAtPath(parentPath)
    const fieldName = parts[parts.length - 1]

    return parentSchema?.required?.includes(fieldName) ?? false
  }

  return {
    focusedPath,
    selectedPath,
    expandedPaths,
    searchQuery,
    isFullscreen,
    allPaths,
    tree,
    filteredTree,
    moveUp,
    moveDown,
    toggleExpand,
    select,
    expandAll,
    collapseAll,
    toggleFullscreen,
    handleKeydown,
    getSchemaAtPath,
    isPathRequired,
  }
}
