import { Injectable } from "@angular/core";

import { ProjectPerformData } from "./payload/project";
import { NewsPerformData } from "./payload/news";
import { BlockLanguagePerformData } from "./payload/block_language";

/**
 * Constructing "mayPerform" objects for the most common
 * use cases.
 */
@Injectable()
export class PerformDataService {
  readonly news = new NewsPerformData();

  readonly project = new ProjectPerformData();

  readonly blockLanguage = new BlockLanguagePerformData();
}
