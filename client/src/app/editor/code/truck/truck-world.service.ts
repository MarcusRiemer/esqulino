import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

interface World {
  name: string;
  size: { x: number, y: number };
}

@Injectable()
export class TruckWorldService implements OnInit {
  private readonly _worlds: { [id: string]: World } = {};

  constructor(private _currentCodeResource: CurrentCodeResourceService) {

  }

  private _selectedWorldId = new BehaviorSubject("ee006a2d-501a-42b0-9c19-9f7bb4df45ba");

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
        this._worlds[currentProgram.id] = {
          name: worldResource.name,
          size: {
            x: +worldTree.children["size"][0].properties["x"],
            y: +worldTree.children["size"][0].properties["y"]
          }
        }

        return (this._worlds[currentProgram.id]);
      })
    );

  ngOnInit(): void {
    this._currentCodeResource.currentResource.subscribe(program => {
      this.setNewWorld(this._selectedWorldId.value);
    });
  }

  setNewWorld(id: string) {
    this._selectedWorldId.next(id);
  }
}