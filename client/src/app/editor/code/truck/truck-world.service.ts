import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

interface World {

}

@Injectable()
export class TruckWorldService implements OnInit {
  private readonly _worlds: { [id: string]: World } = {};

  constructor(private _currentCodeResource: CurrentCodeResourceService) {

  }

  private _currentWorld = new BehaviorSubject("ee006a2d-501a-42b0-9c19-9f7bb4df45ba");

  readonly currentWorld = this._currentWorld
    .pipe(
      // TODO: Create a world (if it does not exist yet)
      map(id => {
        const project = this._currentCodeResource.peekResource.project;
        const worldResource = project.getCodeResourceById(id);
        const worldTree = worldResource.syntaxTreePeek;

        this._worlds[id]
      })
    );

  ngOnInit(): void {
    this._currentCodeResource.currentResource.subscribe(program => {
      this.setNewWorld(program.getWorldResourceId());
    });
  }

  setNewWorld(id: string) {
    this._currentWorld.next(id);
  }
}