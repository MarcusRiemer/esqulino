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

import {
  LanguageService,
  ServerApiService,
  ToolbarService,
} from "../../shared";
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { provideGrammarList, buildGrammar } from "../../editor/spec-util";

import { CreateGrammarComponent } from "./create-grammar.component";
import { ServerTasksService } from "../../shared/serverdata/server-tasks.service";

describe("CreateGrammarComponent", () => {
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
        LanguageService,
        ListGrammarDataService,
        MutateGrammarService,
        ServerTasksService,
      ],
      declarations: [CreateGrammarComponent, DefaultValuePipe],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateGrammarComponent);
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
  it(`create grammar`, async () => {
    const t = await createComponent();
    const g1 = buildGrammar({ name: "G1Test", programmingLanguageId: "sql" });

    await t.fixture.whenRenderingDone();

    const nameInput: HTMLInputElement = t.element.querySelector(
      "input[data-spec=nameInput]"
    );
    const plSelect: HTMLSelectElement = t.element.querySelector(
      "select[data-spec=programmingLanguageSelect]"
    );
    const createButton: HTMLButtonElement = t.element.querySelector(
      "button[data-spec=submit]"
    );

    // simulate user entering a new name into the input box
    nameInput.value = "G1Test";
    plSelect.value = plSelect.options[0].value;

    // dispatch a DOM event so that Angular learns of input value change.
    // use newEvent utility function (not provided by Angular) for better browser compatibility
    nameInput.dispatchEvent(new Event("input"));
    plSelect.dispatchEvent(new Event("change"));
    createButton.click();

    t.fixture.detectChanges();

    t.httpTesting
      .expectOne({ method: "POST", url: t.serverApi.createGrammarUrl() })
      .flush("");
    // t.httpTesting.expectOne({method: "GET", url: "/admin/grammars/undefined"}).flush("");
  });
});
