import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";

import { Subscription } from "rxjs";
import { first, skip } from "rxjs/operators";

import * as Blockly from "blockly";

import {
  internalToBlockly,
  blocklyToInternal,
} from "../../../shared/block/blockly/sync-ast";
import { CodeResource } from "../../../shared";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService } from "../../toolbar.service";
import { SidebarService } from "../../sidebar.service";

import { BlocklyBlocksService } from "./blockly-blocks.service";
import { downloadBlockly } from "./workspace-to-image";

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

  // Relevant properties of the current blockly instance
  private _blockly: {
    // The canvas the user is interacting with
    workspace: Blockly.WorkspaceSvg;

    // The toolbox sometimes needs to be updated on the fly. This
    // subscription is used to
    xmlToolboxSubscription: Subscription;
  };

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

    // Wiring up the "sync AST" button
    let btnSync = this._toolbarService.addButton(
      "sync-coderesource",
      "Synchronisieren",
      "refresh"
    );
    const subsSync = btnSync.onClick.subscribe((_) => {
      this.syncToCodeResource();
    });

    this._subscriptions.push(subsSync);

    // Wiring up the "download as image"-button
    let btnDownloadImage = this._toolbarService.addButton(
      "download-image",
      "Als Bild speichern",
      "download"
    );
    const subsDownloadImage = btnDownloadImage.onClick.subscribe((_) => {
      downloadBlockly(
        "png",
        this._blockly.workspace,
        this._current.peekResource.name
      );
    });
    this._subscriptions.push(subsDownloadImage);
  }

  /**
   * Injecting Blockly into the outlet and register relevant events.
   */
  ngAfterViewInit(): void {
    const currResSub = this._current.currentResource.subscribe(
      async (currRes: CodeResource) => {
        // Clear previously loaded blockly data
        if (this._blockly?.workspace) {
          this._blockly.workspace.clear();
        }

        // Ensure that old subscriptions are not fired anymore
        this._blockly?.xmlToolboxSubscription?.unsubscribe();

        const validators = (await currRes.validatorPeek()).grammarValidators;

        if (!validators || validators.length != 1) {
          throw new Error(
            `Blockly generation currently requires a single grammar document`
          );
        }

        const g = validators[0].description;

        const blocklyLoadable = this._blocklyBlocks.loadGrammar(
          g,
          await currRes.blockLanguagePeek
        );

        console.log("Generated blockly settings", blocklyLoadable);

        Blockly.defineBlocksWithJsonArray(blocklyLoadable.blocks);

        // Is a workspace present or is there a need to create one?
        if (!this._blockly) {
          const toolboxXml = await blocklyLoadable.toolboxXml
            .pipe(first())
            .toPromise();

          console.log("Initial XML Toolbox", toolboxXml);

          const config = Object.assign({}, this.config, {
            toolbox: toolboxXml,
          });

          // Create a new workspace
          this._blockly = {
            workspace: Blockly.inject(this.blocklyOutlet.nativeElement, config),
            xmlToolboxSubscription: undefined,
          };
        }

        // Available blocks have been defined, now react to changes in the workspace
        this._blockly.xmlToolboxSubscription = blocklyLoadable.toolboxXml
          // First value can be skipped as it was assigned on initial load
          .pipe(skip(1))
          .subscribe((toolboxXml) => {
            console.log("Updated Toolbox XML: ", toolboxXml);
            this._blockly.workspace.updateToolbox(toolboxXml);
          });

        const astXmlWorkspace = internalToBlockly(
          currRes.syntaxTreePeek.toModel(),
          g.types
        );
        const _loadedIds = Blockly.Xml.domToWorkspace(
          astXmlWorkspace,
          this._blockly.workspace
        );
      }
    );

    this._subscriptions.push(currResSub);

    // Detect resizes
    // @ts-ignore
    if (ResizeObserver) {
      // @ts-ignore
      this._resizeObserver = new ResizeObserver(() => {
        if (this._blockly?.workspace) {
          Blockly.svgResize(this._blockly.workspace);
        }
      });
      this._resizeObserver.observe(this.blocklyOutlet.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this._blockly?.workspace.removeChangeListener(this.syncToCodeResource);
    this._blockly?.xmlToolboxSubscription?.unsubscribe();

    this._resizeObserver.disconnect();

    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }

  /**
   * The user has interacted with the workspace.
   */
  syncToCodeResource() {
    const workspaceDom = Blockly.Xml.workspaceToDom(this._blockly.workspace);

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
