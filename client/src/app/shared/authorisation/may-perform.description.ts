export interface MayPerformRequestDescription {
  resourceType: string;
  resourceId?: string;
  policyAction: string;
}

export interface MayPerformResponseDescription {
  perform: boolean;
}
