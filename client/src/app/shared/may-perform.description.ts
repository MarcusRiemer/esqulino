
export interface PerformDescription {
  resourceType: string;
  resourceId?: string;
  policyAction: string;
}

export interface MayPerformDescription {
  perform: boolean;
}