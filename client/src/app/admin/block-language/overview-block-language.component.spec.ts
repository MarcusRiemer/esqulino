import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { PortalModule } from "@angular/cdk/portal";

import { ToolbarService } from "../../shared";
import {
  ListBlockLanguageDataService,
  MutateBlockLanguageService,
} from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";

import { OverviewBlockLanguageComponent } from "./overview-block-language.component";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { PaginatorTableGraphqlComponent } from "../../shared/table/paginator-table-graphql.component";
import {
  AdminListBlockLanguagesDocument,
  DestroyBlockLanguageDocument,
} from "../../../generated/graphql";
import {
  buildEmptyBlockLanguageResponse,
  buildSingleBlockLanguageResponse,
} from "../../editor/spec-util/block-language.gql.data.spec";

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
        ListBlockLanguageDataService,
        MutateBlockLanguageService,
      ],
      declarations: [
        OverviewBlockLanguageComponent,
        DefaultValuePipe,
        PaginatorTableGraphqlComponent,
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
    const states: boolean[] = [false, true, false];
    const response = buildSingleBlockLanguageResponse();

    t.component.query.valueChanges.subscribe((response) => {
      expect(response.loading).toBe(states.pop());
    });

    const op = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op.flush(response);

    t.component.query.refetch();

    const op2 = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op2.flush(response);
  });

  it(`Displays an empty list`, async () => {
    const t = await createComponent();
    const response = buildEmptyBlockLanguageResponse();

    const res = t.component.query.valueChanges.toPromise();
    const op = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op.flush(response);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.fixture.nativeElement.querySelector("table");
    const rows = tableElement.querySelectorAll("tbody > tr");

    expect(rows.length).toEqual(0);
  });

  it(`Displays a list with a single element`, async () => {
    const t = await createComponent();
    const response = buildSingleBlockLanguageResponse();

    const res = t.component.query.valueChanges.toPromise();
    const op = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op.flush(response);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");

    expect(i1Row.textContent).toMatch(
      response.data.blockLanguages.nodes[0].name
    );
    expect(i1Row.textContent).toMatch(response.data.blockLanguages.nodes[0].id);
  });

  it(`reloads data on refresh`, async () => {
    const t = await createComponent();
    const singleBlockLanguage = buildSingleBlockLanguageResponse();
    const emptyBlockLanguage = buildEmptyBlockLanguageResponse();
    const responses = [emptyBlockLanguage, singleBlockLanguage];

    const res = t.component.query.valueChanges.subscribe((response) => {
      if (!response.loading) {
        expect(response.data).toEqual(responses.pop().data);
      }
    });
    const op = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op.flush(singleBlockLanguage);

    t.component.query.refetch();
    const op2 = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op2.flush(emptyBlockLanguage);
  });

  it(`Triggers deletion`, async () => {
    const t = await createComponent();
    const singleBlockLanguage = buildSingleBlockLanguageResponse();
    const emptyBlockLanguage = buildEmptyBlockLanguageResponse();
    const responses = [emptyBlockLanguage, singleBlockLanguage];

    const res = t.component.query.valueChanges.subscribe((response) => {
      if (!response.loading) {
        expect(response.data).toEqual(responses.pop().data);
      }
    });

    const op = t.controller.expectOne(AdminListBlockLanguagesDocument);
    op.flush(singleBlockLanguage);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    const tableElement = t.element.querySelector("table");
    const i1Row = tableElement.querySelector("tbody > tr");
    const i1Delete = i1Row.querySelector(
      "button[data-spec=delete]"
    ) as HTMLButtonElement;

    i1Delete.click();

    const op2 = t.controller.expectOne(DestroyBlockLanguageDocument);
    op2.flush({ data: {} });
  });
});
