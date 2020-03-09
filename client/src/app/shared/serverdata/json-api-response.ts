/**
 * A response that also informs about the total number of items
 * that are available.
 */
export interface JsonApiListResponse<TListItem> {
  data: TListItem[];
  meta: {
    totalCount: number;
  }
}

export function isJsonApiListResponse<T>(obj: any): obj is JsonApiListResponse<T> {
  return (obj && obj.data);
}