import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { World } from '../../../shared/syntaxtree/truck/world';
import { readFromNode } from '../../../shared/syntaxtree/truck/world.description';

@Injectable()
export class TruckWorldService implements OnInit {
  private readonly _worlds: { [id: string]: World } = {};

  private _selectedWorldId = new BehaviorSubject('ee006a2d-501a-42b0-9c19-9f7bb4df45ba');

  readonly currentWorld = this._selectedWorldId
    .pipe(
      // TODO: Create a world (if it does not exist yet)
      map(id => {
        const currentProgram = this._currentCodeResource.peekResource;
        const project = currentProgram.project;
        const worldResource = project.getCodeResourceById(id);
        const worldTree = worldResource.syntaxTreePeek.toModel();

        // TODO: Move this translation somewhere else
        // TODO: Decide when to replace the old world and when to simply return it
        if (!this._worlds[currentProgram.id]) {
          const wd = readFromNode(worldTree);
          this._worlds[currentProgram.id] = new World(wd);
        }

        return (this._worlds[currentProgram.id]);
      })
    );

  constructor(private _currentCodeResource: CurrentCodeResourceService) {

  }

  ngOnInit(): void {
    this._currentCodeResource.currentResource.subscribe(program => {
      this.setNewWorld(this._selectedWorldId.value);
    });
  }

  setNewWorld(id: string) {
    this._selectedWorldId.next(id);
  }
}