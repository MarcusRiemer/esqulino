import { PerformDescription } from '../../may-perform.description';

export const performUpdateDescription: PerformDescription = {
  resourceType: "News",
  resourceId: this._newsId,
  policyAction: "update"
}

export const performCreateDescription: PerformDescription = {
  resourceType: "News",
  policyAction: "create"
}

export const performDeleteDescription: PerformDescription = {
  resourceType: "News",
  resourceId: this._newsId,
  policyAction: "delete"
}

