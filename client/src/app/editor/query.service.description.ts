import { QueryDescription } from '../shared/query/description'

/**
 * Storing a query on the server
 */
export interface QueryUpdateRequestDescription {
  model: QueryDescription,
  sql?: string
}

/**
 * Parameters are simply a key-value dictionary. Whenever a query
 * makes use of user-bound parameters, these are transferred via
 * this kind of object.
 */
export type QueryParamsDescription = { [paramKey: string]: string }

/**
 * Some servers support execution of arbitrary queries. This is intended
 * to be used during development and can be done via this request-type.
 */
export type ArbitraryQueryRequestDescription = {
  params: QueryParamsDescription
  sql: string
}
