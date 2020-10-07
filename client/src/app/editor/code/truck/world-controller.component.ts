import { Component, OnInit, OnDestroy, ViewChild, NgZone } from "@angular/core";
import { Subscription } from "rxjs";
import { flatMap, first, filter } from "rxjs/operators";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { World, Command } from "../../../shared/syntaxtree/truck/world";
import { NodeLocation } from "../../../shared/syntaxtree";
import { rxFilterRootLanguage } from "../../../shared/util";
import { referencedResourceIds } from "../../../shared/syntaxtree/syntaxtree-util";

import { TruckWorldService } from "./truck-world.service";
import { WorldSelectorComponent } from "./world-selector.component";

@Component({
  templateUrl: "templates/world-controller.html",
  styles: [
    ":host ::ng-deep truck-world-selector select.custom-select { border-top-left-radius: 0px; border-bottom-left-radius: 0px; }",
    ".btn-full-disable.disabled, .btn-full-disable:disabled { background-color: #e4e4e4; border-color: #e4e4e4; }",
  ],
})
export class WorldControllerComponent implements OnInit, OnDestroy {
  @ViewChild("worldSelector", { static: true })
  worldSelector: WorldSelectorComponent;

  private _worldSubscription: Subscription;
  private _worldSelectorSubscription: Subscription;
  public world: World = null;

  readonly currentWorld = this._truckWorld.currentWorld;
  readonly currentProgram = this._currentCodeResource.currentResource;

  readonly blocked = this._truckWorld.currentWorld.pipe(
    flatMap((world) => world.commandInProgress)
  );
  readonly paused = this._truckWorld.currentWorld.pipe(
    flatMap((world) => world.codeShouldPause)
  );

  constructor(
    private _truckWorld: TruckWorldService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _zone: NgZone
  ) {}

  ngOnInit(): void {
    this._worldSubscription = this._truckWorld.currentWorld.subscribe(
      (world) => {
        this.world = world;
      }
    );
    this._worldSelectorSubscription = this.worldSelector.selectedWorldIdChange.subscribe(
      (selectedWorldId: string) => {
        this._truckWorld.setNewWorld(selectedWorldId);
      }
    );

    // If the program provides a world to use: Use it
    // TODO?: Maybe honor a pre-selected world?
    this.currentProgram
      .pipe(filter(rxFilterRootLanguage("trucklino_program")))
      .subscribe((prog) => {
        const g = prog.validatorPeek.getGrammarValidator("trucklino_program")
          .description;
        const refs = referencedResourceIds(
          prog.syntaxTreePeek,
          g,
          "codeResourceReference"
        );
        if (refs.length > 0) {
          this._truckWorld.setNewWorld(refs[0]);
        }
      });
  }

  ngOnDestroy(): void {
    if (this._worldSubscription) {
      this._worldSubscription.unsubscribe();
    }
    if (this._worldSelectorSubscription) {
      this._worldSelectorSubscription.unsubscribe();
    }
  }

  goForward() {
    this.command(Command.goForward);
  }
  turnLeft() {
    this.command(Command.turnLeft);
  }
  turnRight() {
    this.command(Command.turnRight);
  }
  noTurn() {
    this.command(Command.noTurn);
  }
  load() {
    this.command(Command.load);
  }
  unload() {
    this.command(Command.unload);
  }
  wait() {
    this.command(Command.wait);
  }

  command(command: Command) {
    this.world
      .commandAsync(command)
      .then(() => {
        // success, nothing to do
      })
      .catch((error) => {
        console.error(error);
        alert(error.msg);
      });
  }

  get generatedCode() {
    return this._currentCodeResource.peekResource.generatedCode
      .pipe(first())
      .toPromise();
  }

  runCode() {
    this.generatedCode.then((generatedCode) => {
      // We start a new program, that means the program is currently not running.
      this._currentCodeResource.setCurrentExecutionLocation(undefined);

      this.world
        .runCode(
          generatedCode,
          // Run the executed callback inside the angular zone
          (loc: NodeLocation) => {
            this._zone.run((_) => {
              this._progressCallback(loc);
            });
          }
        )
        .then(() => {
          // success, nothing to do
        })
        .catch((error) => {
          console.error(error);
          alert(error.msg);
        });
    });
  }

  resumeCode() {
    this.world
      .resumeCode()
      .then(() => {
        // success, nothing to do
      })
      .catch((error) => {
        console.error(error);
        alert(error.msg);
      });
  }

  pauseCode() {
    this.world.pauseCode();
  }

  undo() {
    this.world.undo();
  }
  reset() {
    this.world.reset();
  }

  /**
   * Called on every meaningful progress of the program.
   */
  private _progressCallback(loc: NodeLocation) {
    this._currentCodeResource.setCurrentExecutionLocation(loc);
  }
}
