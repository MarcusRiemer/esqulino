/**
 * Is used to check an ui element with the may perform component
 */
export class BasePerformData {
  constructor(resourceType?: string) {
    if (resourceType) this.resourceType = resourceType;
  }

  // Which resource-typ (Example: News, Projekt)
  private _resourceType: string;

  public get resourceType(): string {
    return this._resourceType;
  }

  public set resourceType(type: string) {
    this._resourceType = type;
  }
}
