import { NodeDescription } from '../syntaxtree.description';

export interface RenderRequestDescription {
  html: NodeDescription
  queries?: { [queryId: string]: NodeDescription }
  projectId: string
}