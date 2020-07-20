import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { PortalModule } from "@angular/cdk/portal";

import { LanguageService, ToolbarService } from "../../shared";
import { DefaultValuePipe } from "../../shared/default-value.pipe";

import { CreateGrammarComponent } from "./create-grammar.component";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { CreateGrammarDocument } from "../../../generated/graphql";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { EmptyComponent } from "../../shared/empty.component";
import { NavigationStart, Router } from "@angular/router";

describe("CreateGrammarComponent", () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        FormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatTableModule,
        PortalModule,
        RouterTestingModule.withRoutes([
          { path: "admin/grammar/:id", component: EmptyComponent },
        ]),
        HttpClientTestingModule,
      ],
      providers: [ToolbarService, LanguageService],
      declarations: [CreateGrammarComponent, DefaultValuePipe],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateGrammarComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);
    const router = TestBed.inject(Router);

    return {
      fixture,
      component,
      controller,
      router,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();
    expect(t.component).toBeDefined();
  });

  it(`create Grammar`, async () => {
    const t = await createComponent();

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

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    expect(t.component.grammar.name).toEqual("G1Test");
    expect(t.component.grammar.programmingLanguageId).not.toBeUndefined();

    createButton.click();

    t.fixture.detectChanges();

    const generatedId = "f9f64792-0ceb-4e3c-ae7b-4c7a8af6a552";
    const op = t.controller.expectOne(CreateGrammarDocument);
    op.flush({ data: { createGrammar: { grammar: { id: generatedId } } } });
    t.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Navigation started.
        expect(event.url).toEqual(`/admin/grammar/${generatedId}`);
      }
    });
  });
});
