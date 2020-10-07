import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ProjectListComponent } from "./project-list.component";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";

import { FrontpageListProjectsDocument } from "../../generated/graphql";
import {
  buildEmptyProjectResponse,
  buildFrontendProjectResponse,
  FrontendProjectGQLResponse,
} from "../editor/spec-util/project.gql.data.spec";
import { ProjectListItemComponent } from "./project-list-item.component";
import { LanguageService } from "../shared";
import { NaturalLanguagesService } from "../natural-languages.service";
import { CurrentLanguagePipe } from "../shared/current-language.pipe";
import { DefaultValuePipe } from "../shared/default-value.pipe";
import { LinkService } from "../link.service";

describe(`Component: ProjectList`, () => {
  async function createComponent(localeId: string) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        { provide: LOCALE_ID, useValue: localeId },
        LanguageService,
        NaturalLanguagesService,
        LinkService,
      ],
      declarations: [
        ProjectListComponent,
        CurrentLanguagePipe,
        DefaultValuePipe,
        ProjectListItemComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(ProjectListComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const controller = TestBed.inject(ApolloTestingController);
    const op = controller.expectOne(FrontpageListProjectsDocument);

    fixture.detectChanges();
    await fixture.whenRenderingDone();

    return {
      fixture,
      component,
      controller,
      op,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`Works with no projects present at all`, async () => {
    const c = await createComponent("de");
    c.op.flush(buildEmptyProjectResponse());

    expect(Array.from(c.element.querySelectorAll("project-list-item"))).toEqual(
      []
    );
  });

  it(`Works with a single project`, async () => {
    const c = await createComponent("de");
    const project: FrontendProjectGQLResponse = buildFrontendProjectResponse();
    c.op.flush(project);

    await c.fixture.whenStable();
    c.fixture.detectChanges();

    expect(
      Array.from(c.element.querySelectorAll("project-list-item")).length
    ).toEqual(1);
    expect(
      c.element
        .querySelector("project-list-item .card-title")
        .textContent.endsWith(project.data.projects.nodes[0].name["en"])
    ).toBeTrue();
    expect(
      c.element
        .querySelector("project-list-item .card-text")
        .textContent.endsWith(project.data.projects.nodes[0].description["en"])
    ).toBeTrue();
  });
});
