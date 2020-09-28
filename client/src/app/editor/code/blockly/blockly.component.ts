import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";

import { first } from "rxjs/operators";

import * as Blockly from "blockly";

import {
  internalToBlockly,
  blocklyToInternal,
} from "../../../shared/block/blockly/sync-ast";
import { allPresentTypes } from "../../../shared/syntaxtree/grammar-type-util";
import { CodeResource } from "../../../shared";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService } from "../../toolbar.service";
import { SidebarService } from "../../sidebar.service";

import { BlocklyBlocksService } from "./blockly-blocks.service";
import { Subscription } from "rxjs";

/**
 * Host component for a blockly workspace. Blockly seems to use a global
 * variable for the pool of available blocks, so different instances of
 * this component may not be entirely independent.
 */
@Component({
  template: `
    <div #blocklyOutlet class="blockly-outlet"></div>
  `,
})
export class BlocklyComponent implements AfterViewInit, OnDestroy, OnInit {
  // The DOM element in which blockly is hosted
  @ViewChild("blocklyOutlet")
  blocklyOutlet: ElementRef;

  // The canvas the user is interacting with
  private _workspace: Blockly.WorkspaceSvg;

  // This is an experimental API not yet supported by Typescript
  private _resizeObserver: any;

  // Subscriptions that need to be unsubscribed when leaving the page
  private _subscriptions: Subscription[] = [];

  constructor(
    private _blocklyBlocks: BlocklyBlocksService,
    private _current: CurrentCodeResourceService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    private _router: Router
  ) {}

  ngOnInit() {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;
    this._sidebarService.hideSidebar();

    // Wiring up the "switch to other editor"-button
    let btnBuiltinEditor = this._toolbarService.addButton(
      "builtin-editor",
      "Eingebauter Editor",
      "code"
    );
    btnBuiltinEditor.onClick.pipe(first()).subscribe(async (_) => {
      this.syncToCodeResource();
      const snap = this._router.url;
      this._router.navigateByUrl(snap.substring(0, snap.length - 2));
    });

    // Wiring up the "switch to other editor"-button
    let btnSync = this._toolbarService.addButton(
      "sync-coderesource",
      "Synchronisieren",
      "refresh"
    );
    const subsSync = btnSync.onClick.subscribe((_) => {
      this.syncToCodeResource();
    });

    this._subscriptions.push(subsSync);
  }

  /**
   * Injecting Blockly into the outlet and register relevant events.
   */
  ngAfterViewInit(): void {
    const currResSub = this._current.currentResource.subscribe(
      (currRes: CodeResource) => {
        // Clear previously loaded blockly data
        if (this._workspace) {
          this._workspace.clear();
        }

        const validators = currRes.validatorPeek.grammarValidators;

        if (!validators || validators.length != 1) {
          throw new Error(
            `Blockly generation currently requires a single grammar document`
          );
        }

        const g = validators[0].description;

        const generated = this._blocklyBlocks.loadGrammar(g);
        console.log("Generated blockly settings", generated);
        console.log("XML Toolbox", generated.toolbox);

        Blockly.defineBlocksWithJsonArray(generated.blocks);

        if (!this._workspace) {
          this._workspace = Blockly.inject(
            this.blocklyOutlet.nativeElement,
            Object.assign({}, this.config, { toolbox: generated.toolbox })
          );
        } else {
          this._workspace.updateToolbox(generated.toolbox);
        }

        const astXmlWorkspace = internalToBlockly(
          currRes.syntaxTreePeek.toModel(),
          allPresentTypes(g, (t) => t.type !== "visualize")
        );
        const loadedIds = Blockly.Xml.domToWorkspace(
          astXmlWorkspace,
          this._workspace
        );
      }
    );

    this._subscriptions.push(currResSub);

    // Can't pass the method directly, `this` would be incorrectly bound
    // when the callback is executed.
    this._workspace.addChangeListener((_: Blockly.Events.Change) => {
      // this.syncToCodeResource(e);
    });

    // Detect resizes
    // @ts-ignore
    if (ResizeObserver) {
      // @ts-ignore
      this._resizeObserver = new ResizeObserver(() => {
        Blockly.svgResize(this._workspace);
      });
      this._resizeObserver.observe(this.blocklyOutlet.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this._workspace.removeChangeListener(this.syncToCodeResource);
    this._resizeObserver.disconnect();

    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }

  /**
   * The user has interacted with the workspace.
   */
  syncToCodeResource() {
    const workspaceDom = Blockly.Xml.workspaceToDom(this._workspace);

    try {
      const ast = blocklyToInternal(workspaceDom);
      console.log("Blockly to AST conversion", { blockly: workspaceDom, ast });
      this._current.peekResource.replaceSyntaxTree(ast);
    } catch (e) {
      const xml = Blockly.Xml.domToPrettyText(workspaceDom);
      throw new Error(
        `Error updating AST from Blockly.\nXML: ${xml}\nError: ${e}`
      );
    }
  }

  readonly config: Blockly.BlocklyOptions = {
    media: "/blockly-media/",
    trashcan: true,
    toolboxPosition: "end",
    move: {
      scrollbars: true,
      drag: false,
      wheel: true,
    },
  };
}
