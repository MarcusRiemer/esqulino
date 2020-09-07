import { SettingsPerformData } from "./payload/settings";
import { Injectable } from "@angular/core";

import { ProjectPerformData } from "./payload/project";
import { NewsPerformData } from "./payload/news";

@Injectable()
export class PerformDataService {
  constructor() {}

  public get news(): NewsPerformData {
    return new NewsPerformData();
  }

  public get project(): ProjectPerformData {
    return new ProjectPerformData();
  }

  public get settings(): SettingsPerformData {
    return new SettingsPerformData();
  }
}
