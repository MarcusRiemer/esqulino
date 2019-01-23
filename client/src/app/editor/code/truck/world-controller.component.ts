import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { flatMap, first } from 'rxjs/operators';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { TruckWorldService } from './truck-world.service'
import { World, Command } from '../../../shared/syntaxtree/truck/world';
import { WorldSelectorComponent } from './world-selector.component';

@Component({
  templateUrl: 'templates/world-controller.html',
})
export class WorldControllerComponent implements OnInit, OnDestroy {
  @ViewChild('worldSelector') worldSelector: WorldSelectorComponent;

  private _worldSubscription: Subscription;
  private _worldSelectorSubscription: Subscription;
  public world: World;

  readonly currentWorld = this._truckWorld.currentWorld;
  readonly currentProgram = this._currentCodeResource.currentResource;

  readonly blocked = this._truckWorld.currentWorld.pipe(
    flatMap(world => world.commandInProgress)
  );

  constructor(
    private _truckWorld: TruckWorldService,
    private _currentCodeResource: CurrentCodeResourceService
  ) {
  }

  ngOnInit(): void {
    this._worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      this.world = world;
    });
    this._worldSelectorSubscription = this.worldSelector.selectedWorldIdChange.subscribe((selectedWorldId: string) => {
      this._truckWorld.setNewWorld(selectedWorldId);
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

  goForward() { this.command(Command.goForward); }
  turnLeft() { this.command(Command.turnLeft); }
  turnRight() { this.command(Command.turnRight); }
  noTurn() { this.command(Command.noTurn); }
  load() { this.command(Command.load); }
  unload() { this.command(Command.unload); }
  wait() { this.command(Command.wait); }

  command(command: Command) {
    this.world.commandAsync(command).then(() => {
      // success, nothing to do
    }).catch((error) => {
      console.error(error);
      alert(error.msg);
    });
  }

  get generatedCode() {
    return this._currentCodeResource.peekResource.generatedCode
      .pipe(
        first()
      ).toPromise();
  }

  runCode() {
    this.generatedCode.then((generatedCode) => {
      this.world.runCode(generatedCode).then(() => {
        // success, nothing to do
      }).catch((error) => {
        console.error(error);
        alert(error.msg);
      });
    });
  }
  terminateCode() { this.world.terminateCode(); }

  undo() { this.world.undo(); }
  reset() { this.world.reset(); }
}
