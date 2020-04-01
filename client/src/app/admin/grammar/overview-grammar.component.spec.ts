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
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { PaginatorTableComponent } from "../../shared/table/paginator-table.component";
import { provideGrammarList, buildGrammar } from "../../editor/spec-util";

import { OverviewGrammarComponent } from "./overview-grammar.component";
import { CreateGrammarComponent } from "./create-grammar.component";

describe("OverviewGrammarComponent", () => {
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
        ListGrammarDataService,
        MutateGrammarService,
        LanguageService,
      ],
      declarations: [
        CreateGrammarComponent,
        OverviewGrammarComponent,
        DefaultValuePipe,
        PaginatorTableComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewGrammarComponent);
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

    const initialLoading = await t.component.inProgress
      .pipe(first())
      .toPromise();
    expect(initialLoading).toBe(true);

    provideGrammarList([]);

    const afterResponse = await t.component.inProgress
      .pipe(first())
      .toPromise();
    expect(afterResponse).toBe(false);
  });

  it(`Displays an empty list`, async () => {
    const t = await createComponent();

    provideGrammarList([]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();

    const i1 = buildGrammar({ name: "G1" });
    provideGrammarList([i1]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(i1.name);
    expect(i1Row.textContent).toMatch(i1.id);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();

    const i1 = buildGrammar({ name: "B1" });
    provideGrammarList([i1]);

    const initialData = await t.component.availableGrammars$
      .pipe(first())
      .toPromise();
    expect(initialData).toEqual([i1]);

    t.component.onRefresh();
    provideGrammarList([]);

    const refreshedData = await t.component.availableGrammars$
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });

  it(`Triggers deletion`, async () => {
    const t = await createComponent();

    const i1 = buildGrammar({ name: "B1" });
    provideGrammarList([i1]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");
    const i1Delete = i1Row.querySelector(
      "button[data-spec=delete]"
    ) as HTMLButtonElement;

    i1Delete.click();

    t.httpTesting
      .expectOne({
        method: "DELETE",
        url: t.serverApi.individualGrammarUrl(i1.id),
      })
      .flush("");

    provideGrammarList([]);

    const refreshedData = await t.component.availableGrammars$
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });
});
