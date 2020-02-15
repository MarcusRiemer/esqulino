import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MatSnackBar } from '@angular/material';
import { Overlay } from '@angular/cdk/overlay';

import { specLoadEmptyProject, buildBlockLanguage } from '../../editor/spec-util';

import { ServerApiService, LanguageService } from '../../shared';
import { BlockLanguageDataService, GrammarDataService } from '../../shared/serverdata';
import { CodeResourceDescription } from '../../shared/syntaxtree';
import { EmptyComponent } from '../../shared/empty.component';

import { ToolbarService } from '../toolbar.service';
import { SidebarService } from '../sidebar.service';
import { ProjectService } from '../project.service';
import { CodeResourceService } from '../coderesource.service';
import { RegistrationService } from '../registration.service';

import { CreateCodeResourceComponent } from './create-code-resource.component';

describe(`CreateCodeResourceComponent`, () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([
          { path: ":id", component: EmptyComponent }
        ]),
        HttpClientTestingModule,
      ],
      providers: [
        LanguageService,
        ServerApiService,
        RegistrationService,
        ToolbarService,
        SidebarService,
        ProjectService,
        CodeResourceService,
        BlockLanguageDataService,
        GrammarDataService,
        MatSnackBar,
        Overlay
      ],
      declarations: [
        CreateCodeResourceComponent,
        EmptyComponent
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(CreateCodeResourceComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return ({
      fixture, component,
      element: fixture.nativeElement as HTMLElement,
      projectService: TestBed.get(ProjectService) as ProjectService
    });
  }

  it(`Has empty inputs without data`, async () => {
    let t = await createComponent();

    expect(t.component.blockLanguageId).toBeUndefined();
    expect(t.component.resourceName).toBeUndefined();
  });

  it(`Shows the default block language`, async () => {
    let t = await createComponent();

    specLoadEmptyProject(t.projectService, {
      blockLanguages: [
        {
          id: "1",
          name: "B1",
          sidebars: [],
          editorBlocks: [],
          editorComponents: [],
          defaultProgrammingLanguageId: "spec"
        }
      ]
    });

    t.fixture.detectChanges();

    expect(t.component.blockLanguageId).toEqual("1");
  });

  it(`Shows the first availabe block language as default`, async () => {
    let t = await createComponent();
    const b = buildBlockLanguage()

    specLoadEmptyProject(t.projectService, {
      blockLanguages: [
        b,
        buildBlockLanguage() // Two languages available
      ]
    });

    t.fixture.detectChanges();

    expect(t.component.blockLanguageId).toEqual(b.id);
  });

  it(`Creating a new resource results in a HTTP request and a redirect`, async () => {
    const t = await createComponent();
    const b = buildBlockLanguage()
    const p = await specLoadEmptyProject(t.projectService, { blockLanguages: [b] });
    const r: CodeResourceDescription = {
      id: "a292fae1-aad7-4cfe-9646-6210a6814eab",
      name: "Test",
      blockLanguageId: b.id,
      ast: undefined,
      createdAt: "",
      programmingLanguageId: "spec",
      updatedAt: "",
    };

    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);

    // Setup a name and call the creation method
    t.component.resourceName = r.name;
    const created = t.component.createCodeResource();

    // Mimic a succesful response
    httpTestingController.expectOne(serverApi.getCodeResourceBaseUrl(p.id))
      .flush(r);

    // Ensure the creation has actually happened
    await created;

    // There should be a new resource in the project now
    expect(p.codeResources).not.toEqual([]);
    expect(p.codeResources[0].name).toEqual(r.name);

    const router: Router = TestBed.get(Router);
    expect(router.url).toEqual("/" + r.id);
  });
})