import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { VisualBlockDescriptions, BlockLanguage, EditorBlockDescription } from '../../../shared/block';
import { FocusDirective } from '../../../shared/focus-element.directive';
import { LanguageService, NodeDescription, Tree, CodeResource } from '../../../shared';
import { BlockLanguageDataService, GrammarDataService, ServerApiService } from '../../../shared/serverdata';

import { ProjectService } from '../../project.service';
//import { DragService } from '../../drag.service';

import { RenderedCodeResourceService } from './rendered-coderesource.service';
import { BlockRenderInputComponent } from './block-render-input.component';
import { BlockBaseDirective } from './block-base.directive';
import { BlockHostComponent } from './block-host.component';
//import { BlockRenderBlockComponent } from './block-render-block.component';
import { BlockRenderComponent } from './block-render.component';


describe('BlockHostComponent', () => {
  async function createComponent(
    nodeDesc: NodeDescription,
    editorBlocks: EditorBlockDescription[]
  ) {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatSnackBarModule,
        HttpClientTestingModule
      ],
      providers: [
        BlockLanguageDataService,
        // DragService,
        GrammarDataService,
        LanguageService,
        RenderedCodeResourceService,
        ServerApiService,
        ProjectService,
      ],
      declarations: [
        BlockRenderComponent,
        BlockRenderInputComponent,
        // BlockRenderBlockComponent,
        BlockHostComponent,
        BlockBaseDirective,
        FocusDirective
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(BlockHostComponent);
    let component = fixture.componentInstance;

    const renderData = TestBed.get(RenderedCodeResourceService) as RenderedCodeResourceService;

    const blockLanguage = new BlockLanguage({
      id: "specBlockLang",
      name: "Spec Block Lang",
      sidebars: [],
      editorBlocks,
      editorComponents: [],
      defaultProgrammingLanguageId: "generic",
    });

    const codeResource = new CodeResource({
      ast: nodeDesc,
      name: "Spec",
      id: "spec",
      blockLanguageId: blockLanguage.id,
      programmingLanguageId: "generic"
    }, undefined);

    component.node = new Tree(nodeDesc).rootNode;
    component.blockLanguage = blockLanguage;

    renderData._updateRenderData(
      codeResource,
      blockLanguage,
      false,
    )

    fixture.detectChanges();

    return ({ fixture, component, element: fixture.nativeElement as HTMLElement });
  }

  it(`Single input`, async () => {
    const treeDesc: NodeDescription = {
      language: "spec",
      name: "input",
      properties: {
        text: "original"
      }
    };

    const editorBlocks: EditorBlockDescription[] = [
      {
        describedType: { languageName: "spec", typeName: "input" },
        visual: [{ blockType: "input", property: "text" }]
      }
    ]

    const c = await createComponent(treeDesc, editorBlocks);

    expect(c.component.blockLanguage).not.toBeUndefined();
  });
});