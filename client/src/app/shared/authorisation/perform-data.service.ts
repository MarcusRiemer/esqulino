import { Injectable } from "@angular/core";

import { ProjectPerformData } from "./payload/project";
import { NewsPerformData } from "./payload/news";

@Injectable()
export class PerformDataService {
  readonly news = new NewsPerformData();

  readonly project = new ProjectPerformData();
}
