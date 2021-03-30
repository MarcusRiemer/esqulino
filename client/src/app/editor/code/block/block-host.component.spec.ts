import { FormsModule } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ApolloTestingModule } from "apollo-angular/testing";

import { first } from "rxjs/operators";

import {
  FullBlockLanguageGQL,
  FullGrammarGQL,
} from "../../../../generated/graphql";

import { BlockLanguage, EditorBlockDescription } from "../../../shared/block";
import { FocusDirective } from "../../../shared/focus-element.directive";
import {
  LanguageService,
  NodeDescription,
  SyntaxTree,
  CodeResource,
} from "../../../shared";
import { ServerApiService } from "../../../shared/serverdata";
import { ResourceReferencesOnlineService } from "../../../shared/resource-references-online.service";
import { ResourceReferencesService } from "../../../shared/resource-references.service";

import { DragService } from "../../drag.service";
import {
  specCacheBlockLanguage,
  specBuildBlockLanguage,
  ensureLocalGrammarRequest,
  mkGrammarDescription,
} from "../../spec-util";

import { RenderedCodeResourceService } from "./rendered-coderesource.service";
import { BlockHostComponent } from "./block-host.component";
import { BLOCK_RENDER_COMPONENTS } from "./index";

describe("BlockHostComponent", () => {
  async function createComponent(
    nodeDesc: NodeDescription,
    editorBlocks: EditorBlockDescription[]
  ) {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatSnackBarModule,
        HttpClientTestingModule,
        ApolloTestingModule,
      ],
      providers: [
        DragService,
        FullGrammarGQL,
        LanguageService,
        RenderedCodeResourceService,
        ServerApiService,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
        FullBlockLanguageGQL,
      ],
      declarations: [FocusDirective, ...BLOCK_RENDER_COMPONENTS],
    }).compileComponents();

    const grammarDesc = await ensureLocalGrammarRequest(
      mkGrammarDescription({})
    );

    const blockLangDesc = specCacheBlockLanguage(
      specBuildBlockLanguage({
        editorBlocks,
        grammarId: grammarDesc.id,
      })
    );

    let fixture = TestBed.createComponent(BlockHostComponent);
    let component = fixture.componentInstance;

    // The component instantiates the service for the particular subtree. I had a loooong
    // search for nasty bugs because this basic assumption didn't hold, so I will leave
    // the expectation enabled just as a warning to myself.
    //
    // The cast to "any" is a hack to remove the private-ness of the injected service.
    const renderData = (component as any)
      ._renderedCodeResourceService as RenderedCodeResourceService;
    expect(renderData)
      .withContext("Spec and component must share same service")
      .toBe((component as any)._renderedCodeResourceService);

    const blockLanguage = new BlockLanguage(blockLangDesc);

    const codeResource = new CodeResource(
      {
        ast: nodeDesc,
        name: "Spec",
        id: "spec",
        blockLanguageId: blockLanguage.id,
        programmingLanguageId: blockLangDesc.defaultProgrammingLanguageId,
      },
      undefined
    );

    component.node = new SyntaxTree(nodeDesc).rootNode;
    component.blockLanguage = blockLanguage;
    component.codeResource = codeResource;

    await renderData._updateRenderData(codeResource, blockLanguage, false, {});

    fixture.detectChanges();
    await fixture.whenStable();

    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();

    const serviceRenderDataAvailable = await renderData.dataAvailable$
      .pipe(first())
      .toPromise();
    const componentRenderDataAvailable = await component.renderDataAvailable$
      .pipe(first())
      .toPromise();

    expect(componentRenderDataAvailable)
      .withContext("Component render data must be available")
      .toBe(true);
    expect(serviceRenderDataAvailable)
      .withContext("Service render data must be available")
      .toBe(true);

    expect(component.node)
      .withContext("Component must have a valid node")
      .not.toBeUndefined();
    expect(component.codeResource)
      .withContext("Component must have a valid code resource")
      .not.toBeUndefined();
    expect(component.blockLanguage)
      .withContext("Component must have a valid block language")
      .not.toBeUndefined();

    return {
      fixture,
      component,
      componentRenderDataAvailable,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`Single input`, async () => {
    const treeDesc: NodeDescription = {
      language: "spec",
      name: "input",
      properties: {
        text: "original",
      },
    };

    const editorBlocks: EditorBlockDescription[] = [
      {
        describedType: { languageName: "spec", typeName: "input" },
        visual: [{ blockType: "input", property: "text" }],
      },
    ];

    const c = await createComponent(treeDesc, editorBlocks);
    expect(c.element.innerText).toEqual("original");
  });

  it(`Single terminal`, async () => {
    const treeDesc: NodeDescription = {
      language: "spec",
      name: "constant",
    };

    const editorBlocks: EditorBlockDescription[] = [
      {
        describedType: { languageName: "spec", typeName: "constant" },
        visual: [{ blockType: "constant", text: "constant" }],
      },
    ];

    const c = await createComponent(treeDesc, editorBlocks);

    expect(c.element.innerText).toEqual("constant");
  });

  it(`Single interpolated`, async () => {
    const treeDesc: NodeDescription = {
      language: "spec",
      name: "interpolated",
      properties: {
        text: "interpolated",
      },
    };

    const editorBlocks: EditorBlockDescription[] = [
      {
        describedType: { languageName: "spec", typeName: "interpolated" },
        visual: [{ blockType: "interpolated", property: "text" }],
      },
    ];

    const c = await createComponent(treeDesc, editorBlocks);

    expect(c.element.innerText).toEqual("interpolated");
  });
});
