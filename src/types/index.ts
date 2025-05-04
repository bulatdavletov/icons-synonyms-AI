import { EventHandler } from '@create-figma-plugin/utilities'

/**
 * Represents a group of synonyms in a specific category
 * 
 * Categories:
 * - Usage: How the icon is used in the IDE (actions/features)
 * - Name of object: Main object representation in the icon
 * - Modificator: Additional states or modifiers (usually small icons)
 * - Synonyms: Additional related terms and shapes
 */
export interface SynonymGroup {
  title: string
  synonyms: string[]
}

export interface ComponentInfo {
  id: string // Unique identifier for the component
  name: string
  type: string
  description: string
  hasDescription: boolean
  // New fields for variants handling
  baseComponentId?: string // ID of the base component (without size variants)
  isBaseComponent?: boolean // Whether this is the base component (no @ in name)
  sizeVariants?: ComponentInfo[] // Related size variants
  originalName?: string // Original name without size info
  normalizedName?: string // Original name without spaces (for matching)
  sizeInfo?: string // Size information (e.g., @20x20)
  // Fields for instances
  mainComponentId?: string // ID of the main component for instances
  componentSetId?: string // ID of the component set for instances
}

// Extended component info with generation status and synonyms
export interface ComponentWithSynonyms extends ComponentInfo {
  synonyms: string[] // Generated synonyms
  isLoading?: boolean // Whether synonyms are being generated
  isEdited?: boolean // Whether component has been edited
  isError?: boolean // Whether there was an error during generation
  errorMessage?: string // Error message if any
}

// Map to store components and their synonyms
export type ComponentsMap = Map<string, ComponentWithSynonyms>

export interface Handler {
  'ui-ready': () => void
  'selection-change': (components: ComponentInfo[]) => void
  'generate-synonyms': (componentIds: string[]) => void
  'synonyms-generated': (data: { synonyms: string[], componentId?: string }) => void
  'generate-error': (data: { error: string, componentId?: string }) => void
  'update-description': (data: { synonyms: string[] }) => void
  'description-updated': (data: { description: string, hasDescription: boolean, componentId?: string }) => void
  'get-current-synonyms': () => void
  'current-synonyms-response': (data: { synonyms: string[] }) => void
}

export type HandlerEvent<K extends keyof Handler> = {
  type: K
  data: Parameters<Handler[K]>[0]
} 