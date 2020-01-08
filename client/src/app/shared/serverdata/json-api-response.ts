export interface JsonApiListResponse<TList> {
  data: TList[];
  meta: {
    totalCount: number;
  }
}

export function isJsonApiListResponse<T>(obj: any): obj is JsonApiListResponse<T> {
  return (obj && obj.data);
}