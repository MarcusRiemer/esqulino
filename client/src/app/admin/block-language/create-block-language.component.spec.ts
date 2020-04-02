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
import { DefaultValuePipe } from "../../shared/default-value.pipe";

import { CreateBlockLanguageComponent } from "./create-block-language.component";
import { buildGrammar, provideGrammarList } from "src/app/editor/spec-util";

describe("CreateBlockLanguageComponent", () => {
  async function createComponent(availableGrammars: GrammarDescription[] = []) {
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
        IndividualGrammarDataService,
        MutateGrammarService,
        ListBlockLanguageDataService,
        MutateBlockLanguageService,
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

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTesting,
      serverApi,
      availableGrammars,
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
    expect(grammarOption.innerText).toEqual(t.availableGrammars[0].name);
  });

  xit(`create BlockLanguage without a slug`, async () => {
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

    const generatedId = "f9f64792-0ceb-4e3c-ae7b-4c7a8af6a552";
    t.httpTesting
      .expectOne({ method: "POST", url: t.serverApi.createBlockLanguageUrl() })
      .flush({ id: generatedId });

    const res = await req;

    expect(res.id).toEqual(generatedId);
  });
});
