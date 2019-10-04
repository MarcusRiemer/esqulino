import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from '../../project.service';

import { ProjectFullDescription } from '../../../shared/project';
import { ServerApiService } from '../../../shared';


const DEFAULT_EMPTY_PROJECT: ProjectFullDescription = {
  id: "28066939-7d53-40de-a89b-95bf37c982be",
  projectUsesBlockLanguages: [],
  blockLanguages: [],
  grammars: [],
  availableDatabases: {},
  sources: [],
  slug: "28066939-7d53-40de-a89b-95bf37c982be",
  name: "Project",
  apiVersion: "4",
  description: "Default Empty Project",
  schema: [],
  codeResources: []
};

export const specLoadEmptyProject = (
  projectService: ProjectService,
  override?: Partial<ProjectFullDescription>
) => {
  const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  const serverApi: ServerApiService = TestBed.get(ServerApiService);

  const p = Object.assign({}, DEFAULT_EMPTY_PROJECT, override || {});

  const toReturn = projectService.setActiveProject(DEFAULT_EMPTY_PROJECT.id, true).toPromise();

  httpTestingController.expectOne(serverApi.getProjectUrl(p.id))
    .flush(p);

  return (toReturn);
}