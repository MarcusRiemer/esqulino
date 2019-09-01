import { MayPerformRequestDescription } from '../../may-perform.description';

/**
 * Is used to check an ui element with the may perform component
 */
export class BasePerformData {
  constructor(resourceType: string) {
    this._resourceType = resourceType;
  }

  // Which resource-typ (Example: News, Projekt)
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