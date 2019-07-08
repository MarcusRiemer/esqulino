import { PerformDescription } from '../../may-perform.description';

export class BasePerformData {
  constructor(resourceType: string) {
    this._resourceType = resourceType;
  }

  private _resourceType: string;

  public update(resourceId: string): PerformDescription {
    return  ({ resourceType: this._resourceType,
               resourceId: resourceId,
               policyAction: "update" })
  }

  public create(): PerformDescription {
    return ({ resourceType: this._resourceType,
              policyAction: "create" })
  }

  public delete(resourceId: string): PerformDescription {
    return ({ resourceType: "News",
              resourceId: resourceId,
              policyAction: "delete" })
  }
}