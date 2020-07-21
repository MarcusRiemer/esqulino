import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { PortalModule } from "@angular/cdk/portal";
import { NavigationStart, Router } from "@angular/router";

import { LanguageService, ToolbarService } from "../../shared";
import { DefaultValuePipe } from "../../shared/default-value.pipe";
import { EmptyComponent } from "../../shared/empty.component";

import { CreateBlockLanguageComponent } from "./create-block-language.component";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import {
  buildGrammarDescItemResponse,
  buildSingleGrammarResponse,
} from "../../editor/spec-util/grammar.gql.data.spec";
import {
  CreateBlockLanguageDocument,
  GrammarDescriptionItemDocument,
  SelectionListGrammarsDocument,
} from "../../../generated/graphql";

describe("CreateBlockLanguageComponent", () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        RouterTestingModule.withRoutes([
          { path: "admin/block-language/:id", component: EmptyComponent },
        ]),
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTableModule,
        PortalModule,
      ],
      providers: [ToolbarService, LanguageService],
      declarations: [CreateBlockLanguageComponent, DefaultValuePipe],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateBlockLanguageComponent);
    let component = fixture.componentInstance;

    // Initial rendering to trigger requirement for grammar list
    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);
    const router = TestBed.inject(Router);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
      router,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  it(`shows the grammars that are available`, async () => {
    const t = await createComponent();

    const singleGrammar = buildSingleGrammarResponse();
    t.component.availableGrammars$.subscribe(async (response) => {
      // Render with grammar list
      t.fixture.detectChanges();
      await t.fixture.whenRenderingDone();

      const grammarIdSelect: HTMLSelectElement = t.element.querySelector(
        "select[data-spec=grammarIdSelect]"
      );

      const grammarOption = grammarIdSelect.options.item(1);

      expect(grammarOption.value).toEqual(response[0].id);
      expect(grammarOption.innerText.trim()).toEqual(response[0].name);
    });
    const op = t.controller.expectOne(SelectionListGrammarsDocument);
    op.flush(singleGrammar);
  });
  it(`create BlockLanguage without a slug`, async () => {
    const t = await createComponent();

    const nameInput: HTMLInputElement = t.element.querySelector(
      "input[data-spec=nameInput]"
    );
    const grammarIdSelect: HTMLSelectElement = t.element.querySelector(
      "select[data-spec=grammarIdSelect]"
    );

    const singleGrammar = buildSingleGrammarResponse();
    const grammarDescriptionItem = buildGrammarDescItemResponse();

    t.component.availableGrammars$.toPromise();
    // Render with grammar list
    const op = t.controller.expectOne(SelectionListGrammarsDocument);
    op.flush(singleGrammar);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    // simulate user entering a new name into the input box
    nameInput.value = "G1Test";
    grammarIdSelect.value = grammarIdSelect.options[1].value;

    // dispatch a DOM event so that Angular learns of input value change.
    // use newEvent utility function (not provided by Angular) for better browser compatibility
    nameInput.dispatchEvent(new Event("input"));
    grammarIdSelect.dispatchEvent(new Event("change"));

    t.fixture.detectChanges();

    t.component.submitForm();

    const op2 = t.controller.expectOne(GrammarDescriptionItemDocument);
    op2.flush(grammarDescriptionItem);

    await t.fixture.whenStable();

    const generatedId = "f9f64792-0ceb-4e3c-ae7b-4c7a8af6a552";
    const op3 = t.controller.expectOne(CreateBlockLanguageDocument);
    op3.flush({
      data: { createBlockLanguage: { id: generatedId, errors: [] } },
      errors: [],
    });
    //expecting in subscribe would cause a warning that test has no expectations.
    const prom = await new Promise<boolean>((resolve, _) => {
      t.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          // Navigation started.
          resolve(event.url === `/admin/block-language/${generatedId}`);
        }
      });
    });
    expect(prom).toBeTrue();
  });
});
