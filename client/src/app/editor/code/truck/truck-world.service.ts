import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { World } from '../../../shared/syntaxtree/truck/world';
import { readFromNode } from '../../../shared/syntaxtree/truck/world.description';

@Injectable()
export class TruckWorldService {
  private readonly _worldIds: { [id: string]: string } = {};
  private readonly _worlds: { [id: string]: { id: string, world: World } } = {};
  private readonly _currentWorldId = new BehaviorSubject<string>(undefined);

  readonly currentWorld = this._currentWorldId
    .pipe(
      filter(worldId => !!worldId),
      map(worldId => {
        const currentProgram = this._currentCodeResource.peekResource;
        if (this._worlds[currentProgram.id] && this._worlds[currentProgram.id].id === worldId) {
          // An instance of the world for this program already exists
          return this._worlds[currentProgram.id].world;
        } else {
          // Create a new instance of the world for this program
          try {
            const worldTree = currentProgram.project.getCodeResourceById(worldId).syntaxTreePeek.toModel();
            this._worlds[currentProgram.id] = {
              id: worldId,
              world: new World(readFromNode(worldTree))
            };
            return this._worlds[currentProgram.id].world;
          } catch (error) {
            return null;
          }
        }
      }),
      filter(world => !!world)
    );

  constructor(private _currentCodeResource: CurrentCodeResourceService) {
    this._currentCodeResource.currentResource.subscribe(currentProgram => {
      if (currentProgram.emittedLanguageIdPeek === 'truck-world') {
        // Current program is a world
        this._worldIds[currentProgram.id] = currentProgram.id;
        this._currentWorldId.next(currentProgram.id);
      } else if (this._worldIds[currentProgram.id]) {
        // Current program is a program and already has a world set
        this._currentWorldId.next(this._worldIds[currentProgram.id]);
      }
    });
  }

  setNewWorld(id: string) {
    if (id) {
      const currentProgramId = this._currentCodeResource.peekResource.id;
      this._worldIds[currentProgramId] = id;
      this._currentWorldId.next(id);
    }
  }
}
