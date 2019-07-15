import { NodeDescription } from '../syntaxtree.description';

export interface QueryReferenceDescription {
  "$queryId": string
}

export interface FrontMatterDescription {
  [key: string]: string | number | QueryReferenceDescription
}

export interface HtmlDocumentDescription {
  frontMatter: FrontMatterDescription
}

export function readFrontMatterFromNode(node: NodeDescription): FrontMatterDescription {
  return ({});
}

export function readHtmlDocumentFromNode(node: NodeDescription): HtmlDocumentDescription {
  return ({
    frontMatter: {}
  });
}