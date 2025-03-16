import { EventHandler } from '@create-figma-plugin/utilities'

export interface SynonymGroup {
  title: string
  synonyms: string[]
}

export interface ComponentInfo {
  name: string
  type: string
  description: string
  hasDescription: boolean
}

export interface Handler {
  SELECTION_CHANGE: (componentInfo: ComponentInfo) => void
  GENERATE_SYNONYMS: () => void
  SYNONYMS_GENERATED: (data: { groups: SynonymGroup[] }) => void
  GENERATE_ERROR: (data: { error: string }) => void
  UPDATE_DESCRIPTION: (data: { synonyms: string[] }) => void
}

export type HandlerEvent<K extends keyof Handler> = {
  type: K
  data: Parameters<Handler[K]>[0]
} 