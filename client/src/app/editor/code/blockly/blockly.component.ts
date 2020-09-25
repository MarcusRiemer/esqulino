import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { first } from "rxjs/operators";

import * as Blockly from "blockly";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService } from "../../toolbar.service";
import { SidebarService } from "../../sidebar.service";

import { BlocklyBlocksService } from "./blockly-blocks.service";

const debugWorkspace = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="sql.querySelect" id="?6DU32Yrf{(ws:Sl)f1f" x="326" y="157">
    <statement name="select">
      <block type="sql.select" id="nMuuh~x1lg^Xglx-{95P">
        <value name="distinct">
          <block type="sql.distinct" id="0,?Ss~9Jy8H=EJ+h7U/."></block>
        </value>
        <value name="columns">
          <block type="sql.columnName" id="1rJnP5$A.9=jEw5_}vZJ">
            <field name="refTableName"></field>
            <field name="columnName"></field>
            <value name="__list__">
              <block type="sql.columnName" id="MhrF#8=}O:;PV0-yq_JP">
                <field name="refTableName"></field>
                <field name="columnName"></field>
              </block>
            </value>
          </block>
        </value>
      </block>
    </statement>
    <statement name="from">
      <block type="sql.from" id="q$f8BBt]/.h8)E=s2KWw">
        <value name="tables">
          <block type="sql.tableIntroduction" id="@!M?$N.nQ^!m$Rnb1$5C">
            <field name="name"></field>
            <value name="__list__">
              <block type="sql.tableIntroduction" id="ZpooE1:'XWu+{K~5kJf4">
                <field name="name"></field>
                <value name="__list__">
                  <block type="sql.whereAdditional" id=";Y+[*~+EoV|J2[!{{,sX">
                    <field name="operator">AND</field>
                    <value name="expression">
                      <block type="sql.tableIntroduction" id=";8p6K7d8}*$^)CiLu5;O">
                        <field name="name"></field>
                      </block>
                    </value>
                    <value name="__list__">
                      <block type="sql.relationalOperator" id="jwfI@w]_md(VSRh$*i%)">
                        <field name="operator">&lt;</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </value>
        <statement name="joins">
          <block type="sql.crossJoin" id="Otd)FmcsBf4egEn*Pe5#">
            <value name="table">
              <block type="sql.tableIntroduction" id="pg7~Dktq/OX8cU1CcX{_">
                <field name="name"></field>
              </block>
            </value>
            <next>
              <block type="sql.crossJoin" id="Ld%#cKCtx[k6?8%ojMyP">
                <value name="table">
                  <block type="sql.tableIntroduction" id="%H2eP=j@ACnuSoC'NMA.">
                    <field name="name"></field>
                  </block>
                </value>
                <next>
                  <block type="sql.crossJoin" id="Pc.6(a}V]4?JQL+GF*z#">
                    <value name="table">
                      <block type="sql.tableIntroduction" id="^$SsG1#{HIZ)*WQ;nMaR">
                        <field name="name"></field>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

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

    // Wiring up the delete button
    let btnBuiltinEditor = this._toolbarService.addButton(
      "builtin-editor",
      "Eingebauter Editor",
      "star"
    );
    btnBuiltinEditor.onClick.pipe(first()).subscribe(async (_) => {
      const snap = this._router.url;
      console.log(snap.substring(0, snap.length - 2));

      this._router.navigateByUrl(snap.substring(0, snap.length - 2));
    });
  }

  /**
   * Injecting Blockly into the outlet and register relevant events.
   */
  ngAfterViewInit(): void {
    const validators = this._current.peekResource.validatorPeek
      .grammarValidators;

    if (!validators || validators.length != 1) {
      throw new Error(
        `Blockly generation currently requires a single grammar document`
      );
    }

    const g = validators[0].description;

    const generated = this._blocklyBlocks.load(g);
    console.log("Generated blockly settings", generated);
    console.log("XML Toolbox", generated.toolbox);

    Blockly.defineBlocksWithJsonArray(generated.blocks);

    this._workspace = Blockly.inject(
      this.blocklyOutlet.nativeElement,
      Object.assign({}, this.config, { toolbox: generated.toolbox })
    );

    this.loadWorkspaceXml(debugWorkspace);

    this._workspace.addChangeListener(this.onWorkspaceChangeCallback);

    // Detect resizes
    // @ts-ignore
    if (ResizeObserver) {
      // @ts-ignore
      this._resizeObserver = new ResizeObserver((entries: any) => {
        console.log(entries);
        Blockly.svgResize(this._workspace);
      });
      this._resizeObserver.observe(this.blocklyOutlet.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this._workspace.removeChangeListener(this.onWorkspaceChangeCallback);
    this._resizeObserver.disconnect();
  }

  /**
   * The user has interacted with the workspace.
   */
  onWorkspaceChangeCallback(evt: Blockly.Events.Change) {
    const xml = Blockly.Xml.domToPrettyText(
      Blockly.Xml.workspaceToDom(Blockly.Workspace.getById(evt.workspaceId))
    );

    console.log("Updated workspace", xml);
  }

  readonly config: Blockly.BlocklyOptions = {
    media: "/blockly-media/",
    trashcan: true,
    toolboxPosition: "end",
  };

  onCode(code: string) {
    console.log(code);
  }

  /**
   * Loads the given blockly xml string into the workspace of this component.
   */
  private loadWorkspaceXml(xmlString: string) {
    const xml = Blockly.Xml.textToDom(xmlString);
    Blockly.Xml.domToWorkspace(xml, this._workspace);
  }
}
