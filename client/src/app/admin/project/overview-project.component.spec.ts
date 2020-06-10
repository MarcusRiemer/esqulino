import { LOCALE_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { PortalModule } from "@angular/cdk/portal";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";

import { first } from "rxjs/operators";

import { NaturalLanguagesService } from "../../natural-languages.service";
import { LinkService } from "../../link.service";

import {
  ServerApiService,
  ToolbarService,
  LanguageService,
} from "../../shared";
import { AdminListProjectDataService } from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { PaginatorTableComponent } from "../../shared/table/paginator-table.component";
import { CurrentLanguagePipe } from "../../shared/current-language.pipe";
import { ServerTasksService } from "../../shared/serverdata/server-tasks.service";

import { buildProject, provideProjectList } from "../../editor/spec-util";
import {
  AdminListProjectsDocument,
  AdminListProjectsGQL,
} from "../../../generated/graphql";

import { OverviewProjectComponent } from "./overview-project.component";

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
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        AdminListProjectsGQL,
        ToolbarService,
        ServerApiService,
        AdminListProjectDataService,
        LanguageService,
        ServerTasksService,
        NaturalLanguagesService,
        LinkService,
        { provide: LOCALE_ID, useValue: localeId },
      ],
      declarations: [
        OverviewProjectComponent,
        DefaultValuePipe,
        CurrentLanguagePipe,
        PaginatorTableComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewProjectComponent);
    let component = fixture.componentInstance;

    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);
    const httpTesting = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
      httpTesting,
      serverApi,
    };
  }

  xit(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  /*it(`Displays a loading indicator (or not)`, async () => {
    const t = await createComponent();

    const initialLoading = await t.component.progress
      .pipe(first())
      .toPromise();
    expect(initialLoading).toBe(true);
    t.component.projectsService.fetch().subscribe(response => {
      expect(response.data.projects.totalCount).toEqual(1);
    });

    const op = t.controller.expectOne(AdminListProjectsDocument);
    op.flush({
      data: {
        projects: {
          nodes: {
            id: 0,
            name: 'test',
            slug: 'test',
            codeResources: {
              totalCount: 10
            }
          },
          totalCount: 1,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
            startCursor: "NQ",
            endCursor: "NQ"
          }
        },
      },
    });

    const afterResponse = await t.component.progress
      .pipe(first())
      .toPromise();
    expect(afterResponse).toBe(false);
  });*/

  xit(`Displays an empty list`, async () => {
    const t = await createComponent();

    provideProjectList([]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const rows = tableElement.querySelectorAll("tbody > tr");

    expect(rows.length).toEqual(0);
  });

  xit(`Displays a list with a single element`, async () => {
    const t = await createComponent();

    const i1 = buildProject({ name: { en: "G1" } });
    provideProjectList([i1]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(i1.name["en"]);
    expect(i1Row.textContent).toMatch(i1.id);
  });

  /*xit(`reloads data on refresh`, async () => {
    const t = await createComponent();

    const i1 = buildProject({ name: { en: "B1" } });
    provideProjectList([i1]);

    const initialData = await t.component.projects
      .pipe(first())
      .toPromise();
    expect(initialData).toEqual([i1]);

    t.component.onRefresh();
    provideProjectList([]);

    const refreshedData = await t.component.projects
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });*/
});
