import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ServerApiService, LanguageService } from '../../shared';

import { ToolbarService } from '../toolbar.service';
import { SidebarService } from '../sidebar.service';
import { ProjectService } from '../project.service';
import { CodeResourceService } from '../coderesource.service';
import { RegistrationService } from '../registration.service';

import { CreateCodeResourceComponent } from './create-code-resource.component';
import { specLoadEmptyProject } from '../../editor/shared/spec-util';
import { By } from '@angular/platform-browser';

describe(`CreateCodeResourceComponent`, () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
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
      ],
      declarations: [
        CreateCodeResourceComponent
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

  it(`Should be instantiated`, async () => {
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
})