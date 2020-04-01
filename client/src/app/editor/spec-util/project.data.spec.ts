import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { ProjectService } from "../project.service";

import {
  ProjectFullDescription,
  Project,
  ProjectDescription,
} from "../../shared/project";
import { ServerApiService } from "../../shared";
import { generateUUIDv4 } from "../../shared/util-browser";
import { ListOrder, provideListResponse } from "./list.data.spec";

const DEFAULT_EMPTY_PROJECT: ProjectFullDescription = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  projectUsesBlockLanguages: [],
  blockLanguages: [],
  grammars: [],
  availableDatabases: {},
  sources: [],
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Project",
  description: "Default Empty Project",
  schema: [],
  codeResources: [],
};

/**
 * Generates a valid grammar description with a unique ID, that uses
 * the given data (if provided) and uses default data
 */
export const buildProject = (
  override?: Partial<ProjectDescription>
): ProjectDescription => {
  const id = override?.id ?? generateUUIDv4();
  return Object.assign({}, DEFAULT_EMPTY_PROJECT, override || {}, { id });
};

export const specLoadEmptyProject = (
  projectService: ProjectService,
  override?: Partial<ProjectFullDescription>
): Promise<Project> => {
  const httpTestingController: HttpTestingController = TestBed.get(
    HttpTestingController
  );
  const serverApi: ServerApiService = TestBed.get(ServerApiService);

  const id = override?.id ?? generateUUIDv4();
  const p = Object.assign({}, DEFAULT_EMPTY_PROJECT, override || {}, { id });

  const toReturn = projectService.setActiveProject(p.id, true);

  httpTestingController.expectOne(serverApi.getProjectUrl(p.id)).flush(p);

  return toReturn;
};

export type ProjectOrder = ListOrder<ProjectDescription>;

/**
 * Expects a request for the given list of grammars. If a ordered dataset
 * is requested, the `items` param must be already ordered accordingly.
 */
export const provideProjectList = (
  items: ProjectDescription[],
  options?: {
    order?: ProjectOrder;
    pagination?: {
      limit: number;
      page: number;
    };
  }
) => {
  const serverApi = TestBed.inject(ServerApiService);
  let reqUrl = serverApi.getAdminProjectListUrl();

  return provideListResponse(items, reqUrl, options);
};
