import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { MatSnackBar } from "@angular/material/snack-bar";
import { Overlay } from "@angular/cdk/overlay";

import { ResourceReferencesService } from "../shared/resource-references.service";
import { ResourceReferencesOnlineService } from "../shared/resource-references-online.service";
import { LanguageService, ServerApiService } from "../shared";
import {
  IndividualBlockLanguageDataService,
  IndividualGrammarDataService,
} from "../shared/serverdata";
import { generateUUIDv4 } from "../shared/util-browser";

import { ProjectService } from "./project.service";
import { specLoadEmptyProject } from "./spec-util";

describe(`ProjectService`, () => {
  function instantiate(): ProjectService {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LanguageService,
        ServerApiService,
        ProjectService,
        IndividualBlockLanguageDataService,
        IndividualGrammarDataService,
        MatSnackBar,
        Overlay,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
      ],
      declarations: [],
    });

    return TestBed.inject(ProjectService);
  }

  it(`Initially loads a project`, async () => {
    const projectService = instantiate();

    let callCount = 0;
    projectService.activeProject.subscribe((p) => {
      expect(p).toBeDefined();
      callCount++;
    });

    const p = await specLoadEmptyProject(projectService);

    expect(p).toBe(projectService.cachedProject);
    expect(callCount).toEqual(1, "Subscription must have fired once");
  });

  it(`Initially loads a project with a specific ID`, async () => {
    const projectService = instantiate();
    const id = generateUUIDv4();

    let callCount = 0;
    projectService.activeProject.subscribe((p) => {
      expect(p).toBeDefined();
      expect(p.id).toEqual(id);
      callCount++;
    });

    const p = await specLoadEmptyProject(projectService, { id });

    expect(p).toBe(projectService.cachedProject);
    expect(projectService.cachedProject.id).toEqual(id);
    expect(callCount).toEqual(1, "Subscription must have fired once");
  });

  it(`Doesn't load the same project twice by default`, async () => {
    const projectService = instantiate();
    let callCount = 0;
    projectService.activeProject.subscribe((_) => callCount++);

    const p = await specLoadEmptyProject(projectService);
    expect(p).withContext("First access").toBe(projectService.cachedProject);

    projectService.setActiveProject(p.id, false);
    expect(p).withContext("Second access").toBe(projectService.cachedProject);
    expect(callCount).toEqual(1, "Subscription must have fired once");
  });

  it(`Does load the same project twice if forced`, async () => {
    const projectService = instantiate();
    let callCount = 0;
    projectService.activeProject.subscribe((_) => callCount++);

    const p = await specLoadEmptyProject(projectService);
    await specLoadEmptyProject(projectService);

    expect(p).not.toBe(projectService.cachedProject);
    expect(callCount).toEqual(2, "Subscription must have fired twice");
  });

  it(`Errors on invalid requests`, async () => {
    const projectService = instantiate();
    projectService.activeProject.subscribe(
      (_) => fail("No project could have been activated"),
      (_) => {
        /* Expected */
      }
    );

    const httpTestingController = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    const req = projectService.setActiveProject("0", false);

    httpTestingController
      .expectOne(serverApi.getProjectUrl("0"))
      .flush("", { status: 404, statusText: "Not found" });

    try {
      await req;
      fail("Request must fail");
    } catch (err) {
      expect(err.status).toEqual(404);
    }
  });
});
