import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { TruckWorldService } from './truck-world.service'
import { World, Command } from 'src/app/shared/syntaxtree/truck/world';

@Component({
  templateUrl: 'templates/world-controller.html',
})
export class WorldControllerComponent implements OnInit, OnDestroy {
  private _worldSubscription: Subscription;
  public world: World;
  public blocked = false;

  readonly currentWorld = this._truckWorld.currentWorld;
  readonly currentProgram = this._currentCodeResource.currentResource;

  constructor(
    private _truckWorld: TruckWorldService,
    private _currentCodeResource: CurrentCodeResourceService
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
    if (!this.blocked) {
      this.blocked = true;
      this.world.commandAsync(command).then(() => {
        this.blocked = false;
      }).catch((error) => {
        console.error(error);
        alert(error.msg);
        this.blocked = false;
      });
    }
  }

  runSequence() {
    // TODO: Get and run code
  }

  undo() { this.world.undo(); }
}
