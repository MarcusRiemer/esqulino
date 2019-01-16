import { Component, OnInit, OnDestroy, ApplicationRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { TruckWorldService } from './truck-world.service'
import { World, Command, Sensor } from '../../../shared/syntaxtree/truck/world';

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

  get generatedCode() {
    return new Promise((resolve) => {
      // TODO: best way to get the code?
      this._currentCodeResource.peekResource.generatedCode.subscribe((code) => {
        resolve(code);
      });
    })
  }

  runSequence() {
    this.generatedCode.then((generatedCode) => {
      if (!this.blocked) {
        this.blocked = true;

        // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
        // TODO: Get rid of `eval`
        const AsyncFunction = eval('Object.getPrototypeOf(async function() {}).constructor');

        const cmd = (c: Command) => this.world.commandAsync(c).then(() => this._app.tick());
        const sensor = (s: Sensor) => this.world.sensor(s);

        // Generate and execute asynchronous function
        try {
          const f = new AsyncFunction(generatedCode);
          f.call({
            goForward: async () => { await cmd(Command.goForward); },
            turnLeft: async () => { await cmd(Command.turnLeft); },
            turnRight: async () => { await cmd(Command.turnRight); },
            noTurn: async () => { await cmd(Command.noTurn); },
            wait: async () => { await cmd(Command.wait); },
            load: async () => { await cmd(Command.load); },
            unload: async () => { await cmd(Command.unload); },

            lightIsRed: () => sensor(Sensor.lightIsRed),
            lightIsGreen: () => sensor(Sensor.lightIsGreen),
            canGoStraight: () => sensor(Sensor.canGoStraight),
            canTurnLeft: () => sensor(Sensor.canTurnLeft),
            canTurnRight: () => sensor(Sensor.canTurnRight),
            isSolved: () => sensor(Sensor.isSolved),
          }).then(() => {
            // success, nothing to do
          }).catch((error) => {
            console.error(error);
            alert(error.msg);
          }).finally(() => {
            this.blocked = false;
          });
        } catch(error) {
          console.error(error);
          this.blocked = false;
        }
      }
    });
  }

  undo() { this.world.undo(); }
}
