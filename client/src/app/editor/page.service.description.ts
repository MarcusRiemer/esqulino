import { PageDescription } from '../shared/page/page.description'

import { QueryParamsDescription } from './query.service.description'

/**
 * Storing a page on the server
 */
export interface PageUpdateRequestDescription {
  /**
   * The backend model to store.
   */
  model: PageDescription

  /**
   * Serialized representations to store.
   */
  sources?: { [sourceType: string]: string }
}

/**
 * Fully self-contained request to render an arbitrary page. Because
 * the development state in the browser could differ significantly
 * from the state stored on the server this description specifies all
 * relevant data at once.
 */
export interface PageRenderRequestDescription {
  sourceType: string,
  source: string,
  page: PageDescription
  queries: {
    name: string,
    sql: string
  }[],
  params: QueryParamsDescription
}
