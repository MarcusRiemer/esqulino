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

import { first } from "rxjs/operators";

import {
  ServerApiService,
  ToolbarService,
  LanguageService,
} from "../../shared";
import { AdminListProjectDataService } from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { PaginatorTableComponent } from "../../shared/table/paginator-table.component";
import { buildProject, provideProjectList } from "../../editor/spec-util";

import { OverviewProjectComponent } from "./overview-project.component";

describe("OverviewProjectComponent", () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
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
        ToolbarService,
        ServerApiService,
        AdminListProjectDataService,
        LanguageService,
      ],
      declarations: [
        OverviewProjectComponent,
        DefaultValuePipe,
        PaginatorTableComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewProjectComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    const httpTesting = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTesting,
      serverApi,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  it(`Displays a loading indicator (or not)`, async () => {
    const t = await createComponent();

    const initialLoading = await t.component.projects.listCache.inProgress
      .pipe(first())
      .toPromise();
    expect(initialLoading).toBe(true);

    provideProjectList([]);

    const afterResponse = await t.component.projects.listCache.inProgress
      .pipe(first())
      .toPromise();
    expect(afterResponse).toBe(false);
  });

  it(`Displays an empty list`, async () => {
    const t = await createComponent();

    provideProjectList([]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();

    const i1 = buildProject({ name: "G1" });
    provideProjectList([i1]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(i1.name);
    expect(i1Row.textContent).toMatch(i1.id);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();

    const i1 = buildProject({ name: "B1" });
    provideProjectList([i1]);

    const initialData = await t.component.projects.list
      .pipe(first())
      .toPromise();
    expect(initialData).toEqual([i1]);

    t.component.onRefresh();
    provideProjectList([]);

    const refreshedData = await t.component.projects.list
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });
});
