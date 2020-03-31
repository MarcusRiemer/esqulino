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
import { PortalModule } from "@angular/cdk/portal";

import { first } from "rxjs/operators";

import { ServerApiService, ToolbarService } from "../../shared";
import {
  ListBlockLanguageDataService,
  MutateBlockLanguageService,
} from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import {
  provideBlockLanguageList,
  buildBlockLanguage,
} from "../../editor/spec-util";

import { OverviewBlockLanguageComponent } from "./overview-block-language.component";

describe("OverviewBlockLanguageComponent", () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTableModule,
        PortalModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        ToolbarService,
        ServerApiService,
        ListBlockLanguageDataService,
        MutateBlockLanguageService,
      ],
      declarations: [OverviewBlockLanguageComponent, DefaultValuePipe],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewBlockLanguageComponent);
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

    provideBlockLanguageList([]);

    const afterResponse = await t.component.inProgress
      .pipe(first())
      .toPromise();
    expect(afterResponse).toBe(false);
  });

  it(`Displays an empty list`, async () => {
    const t = await createComponent();

    provideBlockLanguageList([]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();

    const i1 = buildBlockLanguage({ name: "B1" });
    provideBlockLanguageList([i1]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(i1.name);
    expect(i1Row.textContent).toMatch(i1.id);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();

    const i1 = buildBlockLanguage({ name: "B1" });
    provideBlockLanguageList([i1]);

    const initialData = await t.component.availableBlockLanguages
      .pipe(first())
      .toPromise();
    expect(initialData).toEqual([i1]);

    t.component.onRefresh();
    provideBlockLanguageList([]);

    const refreshedData = await t.component.availableBlockLanguages
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });

  it(`Triggers deletion`, async () => {
    const t = await createComponent();

    const i1 = buildBlockLanguage({ name: "B1" });
    provideBlockLanguageList([i1]);

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
        url: t.serverApi.individualBlockLanguageUrl(i1.id),
      })
      .flush("");

    provideBlockLanguageList([]);

    const refreshedData = await t.component.availableBlockLanguages
      .pipe(first())
      .toPromise();
    expect(refreshedData).toEqual([]);
  });
});
