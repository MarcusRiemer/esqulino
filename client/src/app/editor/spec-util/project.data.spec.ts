import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from '../project.service';

import { ProjectFullDescription, Project } from '../../shared/project';
import { ServerApiService } from '../../shared';
import { generateUUIDv4 } from '../../shared/util-browser';


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
  codeResources: []
};

export const specLoadEmptyProject = (
  projectService: ProjectService,
  override?: Partial<ProjectFullDescription>
): Promise<Project> => {
  const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  const serverApi: ServerApiService = TestBed.get(ServerApiService);

  const id = override?.id ?? generateUUIDv4();
  const p = Object.assign({}, DEFAULT_EMPTY_PROJECT, override || {}, { id });

  const toReturn = projectService.setActiveProject(p.id, true);

  httpTestingController.expectOne(serverApi.getProjectUrl(p.id))
    .flush(p);

  return (toReturn);
}