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
import { Router } from "@angular/router";

import {
  LanguageService,
  ServerApiService,
  ToolbarService,
  GrammarDescription,
} from "../../shared";
import {
  ListGrammarDataService,
  ListBlockLanguageDataService,
  MutateBlockLanguageService,
  IndividualGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { ServerTasksService } from "../../shared/serverdata/server-tasks.service";

import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { buildGrammar, provideGrammarList } from "../../editor/spec-util";
import { EmptyComponent } from "../../shared/empty.component";

import { CreateBlockLanguageComponent } from "./create-block-language.component";

describe("CreateBlockLanguageComponent", () => {
  async function createComponent(availableGrammars: GrammarDescription[] = []) {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "admin/block-language/:id", component: EmptyComponent },
        ]),
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTableModule,
        PortalModule,
        HttpClientTestingModule,
      ],
      providers: [
        ToolbarService,
        ServerApiService,
        LanguageService,
        ListGrammarDataService,
        IndividualGrammarDataService,
        MutateGrammarService,
        ListBlockLanguageDataService,
        MutateBlockLanguageService,
        ServerTasksService,
      ],
      declarations: [CreateBlockLanguageComponent, DefaultValuePipe],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateBlockLanguageComponent);
    let component = fixture.componentInstance;

    // Initial rendering to trigger requirement for grammar list
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    provideGrammarList(availableGrammars);

    // Render with grammar list
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const httpTesting = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);
    const router = TestBed.inject(Router);

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTesting,
      serverApi,
      availableGrammars,
      router,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  it(`shows the grammars that are available`, async () => {
    const t = await createComponent([buildGrammar({ name: "G1" })]);

    const grammarIdSelect: HTMLSelectElement = t.element.querySelector(
      "select[data-spec=grammarIdSelect]"
    );

    const grammarOption = grammarIdSelect.options.item(1);

    expect(grammarOption.value).toEqual(t.availableGrammars[0].id);
    expect(grammarOption.innerText.trim()).toEqual(t.availableGrammars[0].name);
  });

  it(`create BlockLanguage without a slug`, async () => {
    const t = await createComponent([buildGrammar({ name: "G1" })]);

    const nameInput: HTMLInputElement = t.element.querySelector(
      "input[data-spec=nameInput]"
    );
    const grammarIdSelect: HTMLSelectElement = t.element.querySelector(
      "select[data-spec=grammarIdSelect]"
    );

    // simulate user entering a new name into the input box
    nameInput.value = "G1Test";
    grammarIdSelect.value = grammarIdSelect.options[1].value;

    // dispatch a DOM event so that Angular learns of input value change.
    // use newEvent utility function (not provided by Angular) for better browser compatibility
    nameInput.dispatchEvent(new Event("input"));
    grammarIdSelect.dispatchEvent(new Event("change"));

    t.fixture.detectChanges();

    const req = t.component.submitForm();

    t.httpTesting
      .expectOne(t.serverApi.individualGrammarUrl(t.availableGrammars[0].id))
      .flush(t.availableGrammars[0]);

    await t.fixture.whenStable();

    const generatedId = "f9f64792-0ceb-4e3c-ae7b-4c7a8af6a552";
    t.httpTesting
      .expectOne({ method: "POST", url: t.serverApi.createBlockLanguageUrl() })
      .flush({ id: generatedId });

    const res = await req;

    expect(res.id).toEqual(generatedId);
    expect(t.router.url).toEqual(`/admin/block-language/${res.id}`);
  });
});
