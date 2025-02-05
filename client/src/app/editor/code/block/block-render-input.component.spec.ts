import { FormsModule } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { ApolloTestingModule } from "apollo-angular/testing";

import { FullGrammarGQL } from "../../../../generated/graphql";

import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { VisualBlockDescriptions, BlockLanguage } from "../../../shared/block";
import { FocusDirective } from "../../../shared/focus-element.directive";
import {
  LanguageService,
  NodeDescription,
  CodeResource,
} from "../../../shared";
import { ServerApiService } from "../../../shared/serverdata";

import { ProjectService } from "../../project.service";

import { RenderedCodeResourceService } from "./rendered-coderesource.service";
import { BlockRenderInputComponent } from "./block-render-input.component";
import { BlockBaseDirective } from "./block-base.directive";

describe("BlockRenderInputComponent", () => {
  async function createComponent(
    nodeDesc: NodeDescription,
    visual: VisualBlockDescriptions.EditorInput
  ) {
    await TestBed.configureTestingModule({
      imports: [FormsModule, MatSnackBarModule, ApolloTestingModule],
      providers: [
        FullGrammarGQL,
        LanguageService,
        RenderedCodeResourceService,
        ServerApiService,
        ProjectService,
        ResourceReferencesService,
      ],
      declarations: [
        BlockRenderInputComponent,
        BlockBaseDirective,
        FocusDirective,
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(BlockRenderInputComponent);
    const component = fixture.componentInstance;
    const renderData = TestBed.inject(RenderedCodeResourceService);

    const blockLanguage = new BlockLanguage({
      id: "specBlockLang",
      name: "Spec Block Lang",
      sidebars: [],
      rootCssClasses: [],
      editorBlocks: [
        {
          describedType: { languageName: "spec", typeName: "input" },
          visual: [visual],
        },
      ],
      editorComponents: [],
      defaultProgrammingLanguageId: "generic",
    });

    const codeResource = new CodeResource(
      {
        ast: nodeDesc,
        name: "Spec",
        id: "spec",
        blockLanguageId: blockLanguage.id,
        programmingLanguageId: "generic",
      },
      undefined
    );

    component.node = codeResource.syntaxTreePeek.rootNode;
    component.visual = visual;

    await renderData._updateRenderData(codeResource, blockLanguage, false, {});

    fixture.detectChanges();

    return {
      fixture,
      component,
      codeResource,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  const mkNode = (text = "original") => {
    return {
      language: "spec",
      name: "input",
      properties: {
        text,
      },
    };
  };

  const DEFAULT_VISUAL: VisualBlockDescriptions.EditorInput = {
    blockType: "input",
    property: "text",
  };

  it(`Displays the text of a node without explicit spaces`, async () => {
    const c = await createComponent(mkNode("the text"), DEFAULT_VISUAL);

    expect(c.component.currentlyEditing).toEqual(false);
    expect(c.component.currentValue).toEqual("the text");
    expect(c.component.currentDisplayValue).toEqual("the text");
  });

  it(`Displays the text of a node with explicit spaces`, async () => {
    const visualExplicitSpaces = Object.assign({}, DEFAULT_VISUAL, {
      cssClasses: ["explicit-spaces"],
    });
    const c = await createComponent(mkNode("the text"), visualExplicitSpaces);

    expect(c.component.currentlyEditing).toEqual(false);
    expect(c.component.currentValue).toEqual("the text");
    expect(c.component.currentDisplayValue).toEqual("the␣text");
  });

  it(`Switches to editing mode on click`, async () => {
    const c = await createComponent(mkNode(), DEFAULT_VISUAL);
    (c.element.querySelector(".not-editing > span") as HTMLElement).click();

    expect(c.component.currentlyEditing).toEqual(true);
    expect(c.component.currentValue).toEqual("original");
    expect(c.component.editedValue).toEqual("original");

    c.fixture.detectChanges(); // Should render input from now on
    await c.fixture.whenRenderingDone();

    const input = c.element.querySelector("input");
    expect(input).not.toBeUndefined();
    expect(input.value).toEqual("original");
  });

  it(`Switches to editing mode on click`, async () => {
    const c = await createComponent(mkNode(), DEFAULT_VISUAL);
    (c.element.querySelector(".not-editing > span") as HTMLElement).click();

    expect(c.component.currentlyEditing).toEqual(true);
    expect(c.component.currentValue).toEqual("original");
    expect(c.component.editedValue).toEqual("original");

    c.fixture.detectChanges();
    await c.fixture.whenRenderingDone(); // Should render input from now on

    const input = c.element.querySelector("input");
    expect(input).not.toBeUndefined();

    input.value = "new";
    input.dispatchEvent(new Event("input"));

    await c.fixture.whenStable();
    expect(c.component.currentValue).toEqual("original");
    expect(c.component.editedValue).toEqual("new");
  });

  it(`Changes the model after an accepted edit`, async () => {
    const c = await createComponent(mkNode(), DEFAULT_VISUAL);
    (c.element.querySelector(".not-editing > span") as HTMLElement).click();

    c.fixture.detectChanges(); // Should render input from now on

    expect(c.component.currentlyEditing).toEqual(true);
    expect(c.component.editedValue).toEqual(
      "original",
      "initially set by editing"
    );
    expect(c.component.currentValue).toEqual(
      "original",
      "unchanged by editing"
    );

    c.component.editedValue = "new text";
    expect(c.component.currentValue).toEqual(
      "original",
      "Only changes when accepted"
    );
    expect(c.component.editedValue).toEqual(
      "new text",
      "Changes immediatly internally"
    );

    c.component.acceptInput();
    expect(c.codeResource.syntaxTreePeek.rootNode.properties["text"]).toEqual(
      "new text",
      "in tree"
    );
    expect(c.codeResource.isSavingRequired).toEqual(
      true,
      "Saving now required"
    );
    expect(c.component.currentlyEditing).toEqual(false);

    // No test for c.component.currentValue because it relies on the node input
  });

  it(`Does not change the model after an accepted edit with no change`, async () => {
    const c = await createComponent(mkNode(), DEFAULT_VISUAL);
    (c.element.querySelector(".not-editing > span") as HTMLElement).click();

    c.fixture.detectChanges(); // Should render input from now on

    expect(c.component.currentlyEditing).toEqual(true);
    expect(c.component.editedValue).toEqual(
      "original",
      "initially set by editing"
    );
    expect(c.component.currentValue).toEqual(
      "original",
      "unchanged by editing"
    );

    c.component.acceptInput();
    expect(c.codeResource.syntaxTreePeek.rootNode.properties["text"]).toEqual(
      "original",
      "in tree"
    );
    expect(c.codeResource.isSavingRequired).toEqual(
      false,
      "Saving not required"
    );
    expect(c.component.currentlyEditing).toEqual(false);

    // No test for c.component.currentValue because it relies on the node input
  });

  it(`Does not change the model after a cancelled edit`, async () => {
    const c = await createComponent(mkNode(), DEFAULT_VISUAL);
    (c.element.querySelector(".not-editing > span") as HTMLElement).click();

    c.fixture.detectChanges(); // Should render input from now on

    expect(c.component.currentlyEditing).toEqual(true);
    expect(c.component.editedValue).toEqual(
      "original",
      "initially set by editing"
    );
    expect(c.component.currentValue).toEqual(
      "original",
      "unchanged by editing"
    );

    c.component.editedValue = "new text";
    expect(c.component.currentValue).toEqual(
      "original",
      "Only changes when accepted"
    );
    expect(c.component.editedValue).toEqual(
      "new text",
      "Changes immediatly internally"
    );

    c.component.cancelInput();
    expect(c.codeResource.syntaxTreePeek.rootNode.properties["text"]).toEqual(
      "original",
      "in tree"
    );
    expect(c.codeResource.isSavingRequired).toEqual(
      false,
      "Saving not required"
    );
    expect(c.component.currentlyEditing).toEqual(false);

    // No test for c.component.currentValue because it relies on the node input
  });
});
