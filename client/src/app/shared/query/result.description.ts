import { RequestErrorDescription } from '../serverapi.service.description'

/**
 * Not much ado about type safety here, in the raw
 * format every cell is a string.
 */
export type RawRow = string[]

/**
 * The result usually contains a list of rows and a list of columns.
 * If the result is a simulation there are additional properties.
 */
export type QueryResultDescription = {
  rows?: RawRow[]
  inserted?: RawRow[]
  highlight?: number[]
  columns: string[]
};

/**
 * Over the wire format to describe a query that could not
 * be run on the server.
 */
export interface QueryRunErrorDescription extends RequestErrorDescription {

}
