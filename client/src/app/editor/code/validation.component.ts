import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';

import { CurrentCodeResourceService } from '../current-coderesource.service';
import { ProjectService } from '../project.service';

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html'
})
export class ValidationComponent {

  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _projectService: ProjectService,
  ) { }

  readonly codeResource = this._currentCodeResource.currentResource

  readonly result = combineLatest(this.codeResource, this._projectService.activeProject)
    .pipe(

    );
}
