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

import { ApolloTestingModule } from "apollo-angular/testing";

import { FullProjectGQL } from "../../../generated/graphql";

import { specLoadProject, buildBlockLanguage } from "../../editor/spec-util";

import { ResourceReferencesService } from "../../shared/resource-references.service";
import { ResourceReferencesOnlineService } from "../../shared/resource-references-online.service";

import { ServerApiService, LanguageService } from "../../shared";
import {
  IndividualBlockLanguageDataService,
  IndividualGrammarDataService,
} from "../../shared/serverdata";
import { CodeResourceDescription } from "../../shared/syntaxtree";
import { EmptyComponent } from "../../shared/empty.component";

import { EditorToolbarService } from "../toolbar.service";
import { SidebarService } from "../sidebar.service";
import { ProjectService } from "../project.service";
import { CodeResourceService } from "../coderesource.service";
import { RegistrationService } from "../registration.service";

import { CreateCodeResourceComponent } from "./create-code-resource.component";

describe(`CreateCodeResourceComponent`, () => {
  async function createComponent() {
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
      ],
      declarations: [CreateCodeResourceComponent, EmptyComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateCodeResourceComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      projectService: TestBed.inject(ProjectService),
      httpTesting: TestBed.inject(HttpTestingController),
      serverApi: TestBed.inject(ServerApiService),
    };
  }

  it(`Has empty inputs without data`, async () => {
    let t = await createComponent();

    expect(t.component.blockLanguageId).toBeUndefined();
    expect(t.component.resourceName).toBeUndefined();
  });

  it(`Shows the default block language`, async () => {
    let t = await createComponent();

    await specLoadProject(t.projectService, {
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
    });

    t.fixture.detectChanges();

    expect(t.component.blockLanguageId).toEqual("1");
  });

  it(`Shows the first availabe block language as default`, async () => {
    let t = await createComponent();
    const b = buildBlockLanguage();

    await specLoadProject(t.projectService, {
      blockLanguages: [
        b,
        buildBlockLanguage(), // Two languages available
      ],
    });

    t.fixture.detectChanges();

    expect(t.component.blockLanguageId).toEqual(b.id);
  });

  it(`Creating a new resource results in a HTTP request and a redirect`, async () => {
    const t = await createComponent();
    const b = buildBlockLanguage();
    const p = await specLoadProject(t.projectService, {
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
    t.httpTesting.expectOne(t.serverApi.getCodeResourceBaseUrl(p.id)).flush(r);

    // Ensure the creation has actually happened
    await created;

    // There should be a new resource in the project now
    expect(p.codeResources).not.toEqual([]);
    expect(p.codeResources[0].name).toEqual(r.name);

    const router = TestBed.inject(Router);
    expect(router.url).toEqual("/" + r.id);
  });
});
