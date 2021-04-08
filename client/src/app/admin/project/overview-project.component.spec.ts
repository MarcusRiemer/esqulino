import { LOCALE_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { PortalModule } from "@angular/cdk/portal";

import {
  ApolloTestingModule,
  ApolloTestingController,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";

import { NaturalLanguagesService } from "../../natural-languages.service";
import { LinkService } from "../../link.service";

import { ToolbarService, LanguageService } from "../../shared";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { CurrentLanguagePipe } from "../../shared/current-language.pipe";

import {
  AdminListProjectsDocument,
  AdminListProjectsGQL,
} from "../../../generated/graphql";

import { OverviewProjectComponent } from "./overview-project.component";
import {
  buildEmptyProjectResponse,
  buildSingleProjectResponse,
} from "../../editor/spec-util";
import { PaginatorTableGraphqlComponent } from "../../shared/table/paginator-table-graphql.component";
import { ConditionalDisplayDirective } from "../../shared/table/directives/conditional-display.directive";
import { UrlFriendlyIdPipe } from "../../shared/url-friendly-id.pipe";
import { getOperationName } from "@apollo/client/utilities";
import { InMemoryCache } from "@apollo/client/core";

describe("OverviewProjectComponent", () => {
  async function createComponent(localeId: string = "en") {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        PortalModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        AdminListProjectsGQL,
        ToolbarService,
        LanguageService,
        NaturalLanguagesService,
        LinkService,
        { provide: LOCALE_ID, useValue: localeId },
        {
          provide: APOLLO_TESTING_CACHE,
          useValue: new InMemoryCache({ addTypename: true }),
        },
      ],
      declarations: [
        OverviewProjectComponent,
        DefaultValuePipe,
        CurrentLanguagePipe,
        PaginatorTableGraphqlComponent,
        ConditionalDisplayDirective,
        UrlFriendlyIdPipe,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewProjectComponent);
    let component = fixture.componentInstance;

    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  it(`Displays a loading indicator (or not)`, async () => {
    const t = await createComponent();
    const states: boolean[] = [false, true, false];
    const response = buildSingleProjectResponse();

    t.component.query.valueChanges.subscribe((response) => {
      expect(response.loading).toBe(states.pop());
    });

    t.controller
      .expectOne(getOperationName(AdminListProjectsDocument))
      .flush(response);

    t.component.query.refetch();

    t.controller
      .expectOne(getOperationName(AdminListProjectsDocument))
      .flush(response);
  });
  it(`Displays an empty list`, async () => {
    const t = await createComponent();
    const response = buildEmptyProjectResponse();

    t.controller
      .expectOne(getOperationName(AdminListProjectsDocument))
      .flush(response);

    await t.fixture.whenStable();
    t.fixture.detectChanges();

    const tableElement = t.fixture.nativeElement.querySelector("table");
    const rows = tableElement.querySelectorAll("tbody > tr");

    expect(rows.length).toEqual(0);
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();
    const response = buildSingleProjectResponse();

    t.controller
      .expectOne(getOperationName(AdminListProjectsDocument))
      .flush(response);

    await t.fixture.whenStable();
    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(
      response.data.projects.nodes[0].name["en"]
    );
    // Prefers slug over id
    expect(i1Row.textContent).toMatch(response.data.projects.nodes[0].slug);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();
    const singleProject = buildSingleProjectResponse();
    const emptyProject = buildEmptyProjectResponse();
    const responses = [emptyProject, singleProject];

    t.component.query.valueChanges.subscribe((response) => {
      if (!response.loading) {
        expect(response.data).toEqual(responses.pop().data);
      }
    });
    const op = t.controller.expectOne(
      getOperationName(AdminListProjectsDocument)
    );
    op.flush(singleProject);

    t.component.query.refetch();
    const op2 = t.controller.expectOne(
      getOperationName(AdminListProjectsDocument)
    );
    op2.flush(emptyProject);
  });
});
