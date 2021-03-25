import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { MatSnackBar } from "@angular/material/snack-bar";
import { Overlay } from "@angular/cdk/overlay";

import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";

import { FullProjectGQL } from "../../../generated/graphql";

import { specLoadProject, buildBlockLanguage } from "../../editor/spec-util";

import { ResourceReferencesService } from "../../shared/resource-references.service";
import { ResourceReferencesOnlineService } from "../../shared/resource-references-online.service";

import { ServerApiService, LanguageService } from "../../shared";
import {
  IndividualBlockLanguageDataService,
  IndividualGrammarDataService,
} from "../../shared/serverdata";
import { MayPerformService } from "../../shared/authorisation/may-perform.service";
import { CodeResourceDescription } from "../../shared/syntaxtree";
import { EmptyComponent } from "../../shared/empty.component";
import { PerformDataService } from "../../shared/authorisation/perform-data.service";
import { specExpectMayPerform } from "../../shared/authorisation/may-perform.spec-util";
import { MayPerformComponent } from "../../shared/authorisation/may-perform.component";
import { Project, ProjectFullDescription } from "../../shared/project";
import { DisplayResourcePipe } from "../../shared/display-resource.pipe";

import { EditorToolbarService } from "../toolbar.service";
import { SidebarService } from "../sidebar.service";
import { ProjectService } from "../project.service";
import { CodeResourceService } from "../coderesource.service";
import { RegistrationService } from "../registration.service";

import { CreateCodeResourceComponent } from "./create-code-resource.component";

describe(`CreateCodeResourceComponent`, () => {
  async function createComponent(
    projectCreationParams?: Partial<ProjectFullDescription>,
    permissionToCreate: boolean = true
  ) {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: ":id", component: EmptyComponent },
        ]),
        HttpClientTestingModule,
      ],
      providers: [
        LanguageService,
        ServerApiService,
        RegistrationService,
        EditorToolbarService,
        SidebarService,
        ProjectService,
        CodeResourceService,
        IndividualBlockLanguageDataService,
        IndividualGrammarDataService,
        MatSnackBar,
        Overlay,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
        FullProjectGQL,
        PerformDataService,
        MayPerformService,
      ],
      declarations: [
        CreateCodeResourceComponent,
        EmptyComponent,
        MayPerformComponent,
        DisplayResourcePipe,
      ],
    }).compileComponents();

    const projectService = TestBed.inject(ProjectService);
    let project: Project = undefined;
    if (projectCreationParams !== undefined) {
      project = await specLoadProject(projectService, projectCreationParams);
    }

    let fixture = TestBed.createComponent(CreateCodeResourceComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    // Allow or deny operation
    specExpectMayPerform("first", permissionToCreate);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      projectService,
      project,
      httpTesting: TestBed.inject(HttpTestingController),
      serverApi: TestBed.inject(ServerApiService),
      apolloTesting: TestBed.inject(ApolloTestingController),
    };
  }

  it(`Has empty inputs without data`, async () => {
    let t = await createComponent({}, true);

    expect(t.component.blockLanguageId).toBeUndefined();
    expect(t.component.resourceName).toBeUndefined();
  });

  it(`Has empty inputs when not allowed to create`, async () => {
    let t = await createComponent({}, false);

    expect(t.component.blockLanguageId).toBeUndefined();
    expect(t.component.resourceName).toBeUndefined();
  });

  it(`Shows the default block language`, async () => {
    let t = await createComponent(
      {
        blockLanguages: [
          {
            id: "1",
            name: "B1",
            sidebars: [],
            editorBlocks: [],
            editorComponents: [],
            defaultProgrammingLanguageId: "spec",
            rootCssClasses: [],
            grammarId: "4330b41a-294b-43be-b1d0-679df35a7c87",
            localGeneratorInstructions: { type: "manual" },
          },
        ],
      },
      true
    );

    expect(t.component.blockLanguageId).toEqual("1");
  });

  it(`Shows the first availabe block language as default`, async () => {
    const b = buildBlockLanguage();

    let t = await createComponent(
      {
        blockLanguages: [
          b,
          buildBlockLanguage(), // Two languages available
        ],
      },
      true
    );

    expect(t.component.blockLanguageId).toEqual(b.id);
  });

  it(`Creating a new resource results in a HTTP request and a redirect`, async () => {
    const b = buildBlockLanguage();

    const t = await createComponent({
      blockLanguages: [b],
    });

    const r: CodeResourceDescription = {
      id: "a292fae1-aad7-4cfe-9646-6210a6814eab",
      name: "Test",
      blockLanguageId: b.id,
      ast: undefined,
      createdAt: "",
      programmingLanguageId: "spec",
      updatedAt: "",
    };

    // Setup a name and call the creation method
    t.component.resourceName = r.name;
    const created = t.component.createCodeResource();

    // Mimic a successful response
    t.apolloTesting
      .expectOne((req) => req.operationName === "CreateCodeResource")
      .flush({
        data: {
          createCodeResource: {
            codeResource: r,
          },
        },
      });

    // Ensure the creation has actually happened
    await created;

    // There should be a new resource in the project now
    expect(t.project.codeResources).not.toEqual([]);
    expect(t.project.codeResources[0].name).toEqual(r.name);

    const router = TestBed.inject(Router);
    expect(router.url).toEqual("/" + r.id);
  });
});
