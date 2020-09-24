import { TestBed } from "@angular/core/testing";

import { ProjectService } from "../project.service";

import {
  FullProjectDocument,
  FullProjectQuery,
} from "../../../generated/graphql";

import {
  ProjectFullDescription,
  Project,
  ProjectDescription,
} from "../../shared/project";
import { ServerApiService } from "../../shared";
import { generateUUIDv4 } from "../../shared/util-browser";
import { ListOrder, provideListResponse } from "./list.data.spec";
import { ApolloTestingController } from "apollo-angular/testing";
import { GraphQLError } from "graphql";

type FullProjectNode = FullProjectQuery["projects"]["nodes"][0];

type FullProjectGQLResponse =
  | { data: FullProjectQuery }
  | { errors: ReadonlyArray<GraphQLError> };

const DEFAULT_EMPTY_PROJECT: ProjectFullDescription = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  blockLanguages: [],
  codeResources: [],
  description: { en: "Default Empty Project" },
  grammars: [],
  name: { en: "Project" },
  projectSources: [],
  projectUsesBlockLanguages: [],
  defaultDatabase: {
    id: "4861f7ad-53c6-481f-b4a7-2b19aeffb021",
    name: "specDb",
  },
  schema: [],
  public: false,
  indexPageId: null,
  slug: null,
};

const wrapProjectData = (data: FullProjectNode[]): FullProjectGQLResponse => {
  return {
    data: {
      projects: {
        nodes: data,
      },
    },
  };
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

export const specLoadProject = (
  projectService: ProjectService,
  override?: Partial<ProjectFullDescription>
): Promise<Project> => {
  const testingController = TestBed.inject(ApolloTestingController);

  const id = override?.id ?? generateUUIDv4();
  const p = Object.assign({}, DEFAULT_EMPTY_PROJECT, override || {}, { id });

  const toReturn = projectService.setActiveProject(p.id, true);
  const wrappedData = wrapProjectData([p]);

  testingController
    .expectOne(
      (op) => op.query === FullProjectDocument && op.variables.id === p.id
    )
    .flush(wrappedData);

  testingController.verify();

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
