import { MayPerformRequestDescription } from '../../may-perform.description';

export class BasePerformData {
  constructor(resourceType: string) {
    this._resourceType = resourceType;
  }

  private _resourceType: string;

  public update(resourceId: string): MayPerformRequestDescription {
    return ({
      resourceType: this._resourceType,
      resourceId: resourceId,
      policyAction: "update"
    })
  }

  public create(): MayPerformRequestDescription {
    return ({
      resourceType: this._resourceType,
      policyAction: "create"
    })
  }

  public delete(resourceId: string): MayPerformRequestDescription {
    return ({
      resourceType: this._resourceType,
      resourceId: resourceId,
      policyAction: "destroy"
    })
  }
}