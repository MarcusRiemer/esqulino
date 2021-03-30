import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ApolloTestingModule } from "apollo-angular/testing";

import { first } from "rxjs/operators";

import {
  FullBlockLanguageGQL,
  FullGrammarGQL,
} from "../../../../generated/graphql";

import { ServerApiService } from "../../../shared/serverdata";

import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { ResourceReferencesOnlineService } from "../../../shared/resource-references-online.service";
import {
  LanguageService,
  NodeDescription,
  CodeResource,
  NamedTypes,
} from "../../../shared";
import { VisualBlockDescriptions, BlockLanguage } from "../../../shared/block";

import {
  ensureLocalGrammarRequest,
  mkGrammarDescription,
  specBuildBlockLanguage,
  specCacheBlockLanguage,
} from "../../spec-util";
import { DragService } from "../../drag.service";

import { BlockRenderErrorComponent } from "./block-render-error.component";
import { RenderedCodeResourceService } from "./rendered-coderesource.service";

describe(`BlockRenderErrorComponent`, () => {
  async function createComponent(
    nodeDesc: NodeDescription,
    types: NamedTypes,
    visual: VisualBlockDescriptions.EditorErrorIndicator
  ) {
    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        HttpClientTestingModule,
        ApolloTestingModule,
      ],
      providers: [
        DragService,
        LanguageService,
        ServerApiService,
        RenderedCodeResourceService,
        FullGrammarGQL,
        FullBlockLanguageGQL,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
      ],
      declarations: [BlockRenderErrorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(BlockRenderErrorComponent);
    const component = fixture.componentInstance;
    const renderData = TestBed.inject(RenderedCodeResourceService);

    // WRONG: Must use GraphQL service
    const grammarDesc = await ensureLocalGrammarRequest(
      mkGrammarDescription({ types: { spec: types } })
    );

    const blockLangDesc = specCacheBlockLanguage(
      specBuildBlockLanguage({
        editorBlocks: [
          {
            describedType: { languageName: "spec", typeName: "root" },
            visual: [visual],
          },
        ],
        grammarId: grammarDesc.id,
      })
    );

    const blockLanguage = new BlockLanguage(blockLangDesc);

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
    await fixture.whenRenderingDone();

    const dataAvailable = await renderData.dataAvailable$
      .pipe(first())
      .toPromise();
    expect(dataAvailable)
      .withContext("Must have all data to render")
      .toEqual(true);

    console.log("###  Reached ###");

    const validator = await renderData.validator$.pipe(first()).toPromise();
    expect(validator).toBeDefined();

    console.log("### Not Reached ###");

    const promisedTree = await renderData.syntaxTree$.pipe(first()).toPromise();
    expect(promisedTree).toBeDefined();

    const validationContext = await renderData.validationContext$
      .pipe(first())
      .toPromise();
    expect(validationContext).toBeDefined();

    const validationResult = await renderData.validationResult$
      .pipe(first())
      .toPromise();
    const componentErrors = await component.nodeErrors$
      .pipe(first())
      .toPromise();

    return {
      fixture,
      component,
      renderData,
      validationResult,
      componentErrors,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`Is invisible without errors`, async () => {
    const c = await createComponent(
      { language: "spec", name: "root" },
      { root: { type: "concrete" } },
      { blockType: "error" }
    );

    expect(c.element.childElementCount).toEqual(0);
    expect(c.validationResult.errors).withContext("All errors").toEqual([]);
    expect(c.componentErrors).withContext("Component errors").toEqual([]);
  });
});
