import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { Overlay } from "@angular/cdk/overlay";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";

import {
  FullProjectGQL,
  FullProjectDocument,
  FullGrammarGQL,
} from "../../generated/graphql";

import { ResourceReferencesService } from "../shared/resource-references.service";
import { LanguageService, ServerApiService } from "../shared";
import { generateUUIDv4 } from "../shared/util-browser";

import { ProjectService } from "./project.service";
import { specLoadProject } from "./spec-util";
import { GraphQLError } from "graphql";

describe(`ProjectService`, () => {
  function instantiate(): ProjectService {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApolloTestingModule],
      providers: [
        FullProjectGQL,
        LanguageService,
        ServerApiService,
        ProjectService,
        FullGrammarGQL,
        MatSnackBar,
        Overlay,
        ResourceReferencesService,
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

    const p = await specLoadProject(projectService);

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

    const p = await specLoadProject(projectService, { id });

    expect(p).toBe(projectService.cachedProject);
    expect(projectService.cachedProject.id).toEqual(id);
    expect(callCount).toEqual(1, "Subscription must have fired once");
  });

  it(`Doesn't load the same project twice by default`, async () => {
    const projectService = instantiate();
    let callCount = 0;
    projectService.activeProject.subscribe((_) => callCount++);

    const p = await specLoadProject(projectService);
    expect(p).withContext("First access").toBe(projectService.cachedProject);

    projectService.setActiveProject(p.id, false);
    expect(p).withContext("Second access").toBe(projectService.cachedProject);
    expect(callCount).toEqual(1, "Subscription must have fired once");
  });

  it(`Does load the same project twice if forced`, async () => {
    const projectService = instantiate();
    let callCount = 0;
    projectService.activeProject.subscribe((_) => callCount++);

    const p = await specLoadProject(projectService);
    await specLoadProject(projectService);

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

    const httpTestingController = TestBed.inject(ApolloTestingController);
    const req = projectService.setActiveProject("0", false);

    httpTestingController.expectOne(FullProjectDocument).flush({
      errors: [new GraphQLError("Project does not exist")],
    });

    try {
      await req;
      fail("Request must fail");
    } catch (err) {
      expect(err.graphQLErrors.length).toEqual(1);
    }
  });
});
