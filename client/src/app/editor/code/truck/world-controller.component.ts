import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { TruckWorldService } from './truck-world.service'
import { World, Command, Sensor } from '../../../shared/syntaxtree/truck/world';
import { flatMap, first } from 'rxjs/operators';

@Component({
  templateUrl: 'templates/world-controller.html',
})
export class WorldControllerComponent implements OnInit, OnDestroy {
  private _worldSubscription: Subscription;
  public world: World;

  readonly currentWorld = this._truckWorld.currentWorld;
  readonly currentProgram = this._currentCodeResource.currentResource;

  readonly blocked = this._truckWorld.currentWorld.pipe(
    flatMap(curr => curr.commandInProgress)
  );

  constructor(
    private _truckWorld: TruckWorldService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _app: ApplicationRef
  ) {
  }

  ngOnInit(): void {
    this._worldSubscription = this._truckWorld.currentWorld.subscribe(world => {
      this.world = world;
    });
  }

  ngOnDestroy(): void {
    if (this._worldSubscription) {
      this._worldSubscription.unsubscribe();
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
