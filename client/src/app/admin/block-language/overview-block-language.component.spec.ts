import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed, ComponentFixtureAutoDetect } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatSortModule } from "@angular/material/sort";
import { PortalModule } from "@angular/cdk/portal";
import { InMemoryCache } from "@apollo/client/core";
import { getOperationName } from "@apollo/client/utilities";

import { ToolbarService } from "../../shared";
import { DefaultValuePipe } from "../../shared/default-value.pipe";

import { OverviewBlockLanguageComponent } from "./overview-block-language.component";
import {
  ApolloTestingController,
  ApolloTestingModule,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";
import { PaginatorTableGraphqlComponent } from "../../shared/table/paginator-table-graphql.component";
import {
  AdminListBlockLanguagesDocument,
  DestroyBlockLanguageDocument,
} from "../../../generated/graphql";
import {
  specAdminbuildEmptyBlockLanguageResponse,
  specAdminBuildSingleBlockLanguageResponse,
} from "../../editor/spec-util/block-language.admin-data.spec";
import { ConditionalDisplayDirective } from "../../shared/table/directives/conditional-display.directive";
import { CreateBlockLanguageComponent } from "./create-block-language.component";
import { LinkGrammarComponent } from "../link-grammar.component";

describe("OverviewBlockLanguageComponent", () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        PortalModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        ToolbarService,
        {
          provide: APOLLO_TESTING_CACHE,
          useValue: new InMemoryCache({ addTypename: true }),
        },
      ],
      declarations: [
        OverviewBlockLanguageComponent,
        DefaultValuePipe,
        PaginatorTableGraphqlComponent,
        ConditionalDisplayDirective,
        CreateBlockLanguageComponent,
        LinkGrammarComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(OverviewBlockLanguageComponent);
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
    // only works like that when fetch-policy is network-only
    const states: boolean[] = [false, true, false];
    const response = specAdminBuildSingleBlockLanguageResponse();

    t.component.query.valueChanges.subscribe((response) => {
      expect(response.loading).toBe(states.pop());
    });

    t.controller
      .expectOne(getOperationName(AdminListBlockLanguagesDocument))
      .flush(response);

    t.component.query.refetch();

    t.controller
      .expectOne(getOperationName(AdminListBlockLanguagesDocument))
      .flush(response);
  });

  it(`Displays an empty list`, async () => {
    const t = await createComponent();
    const response = specAdminbuildEmptyBlockLanguageResponse();

    // Trigger a request
    t.component.query.valueChanges.subscribe(
      (v) => v.data.blockLanguages.totalCount === 0
    );

    t.controller
      .expectOne(getOperationName(AdminListBlockLanguagesDocument))
      .flush(response);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.fixture.nativeElement.querySelector("table");
    const rows = tableElement.querySelectorAll("tbody > tr");

    expect(rows.length).toEqual(0);
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();
    const response = specAdminBuildSingleBlockLanguageResponse();

    t.controller
      .expectOne(getOperationName(AdminListBlockLanguagesDocument))
      .flush(response);

    await t.fixture.whenStable();
    t.fixture.detectChanges();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(
      response.data.blockLanguages.nodes[0].name
    );
    expect(i1Row.textContent).toMatch(response.data.blockLanguages.nodes[0].id);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();
    const singleBlockLanguage = specAdminBuildSingleBlockLanguageResponse();
    const emptyBlockLanguage = specAdminbuildEmptyBlockLanguageResponse();
    const responses = [emptyBlockLanguage, singleBlockLanguage];

    t.component.query.valueChanges.subscribe((response) => {
      if (!response.loading) {
        const expResponse = responses.pop().data;
        expect(response.data).toEqual(expResponse);
      }
    });

    const op = t.controller.expectOne(
      getOperationName(AdminListBlockLanguagesDocument)
    );
    op.flush(singleBlockLanguage);

    t.component.query.refetch();
    const op2 = t.controller.expectOne(
      getOperationName(AdminListBlockLanguagesDocument)
    );
    op2.flush(emptyBlockLanguage);
  });

  it(`Triggers deletion`, async () => {
    const t = await createComponent();
    const singleBlockLanguage = specAdminBuildSingleBlockLanguageResponse();
    const emptyBlockLanguage = specAdminbuildEmptyBlockLanguageResponse();
    const responses = [emptyBlockLanguage, singleBlockLanguage];

    t.component.query.valueChanges.subscribe((response) => {
      if (!response.loading) {
        expect(response.data).toEqual(responses.pop().data);
      }
    });

    t.controller
      .expectOne(getOperationName(AdminListBlockLanguagesDocument))
      .flush(singleBlockLanguage);

    await t.fixture.whenStable();
    t.fixture.detectChanges();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");
    const i1Delete = i1Row.querySelector(
      "button[data-spec=delete]"
    ) as HTMLButtonElement;

    i1Delete.click();

    t.controller
      .expectOne(getOperationName(DestroyBlockLanguageDocument))
      .flush({ data: { destroyBlockLanguage: { id: "test", errors: [] } } });
  });
});
