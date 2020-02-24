import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ProjectService } from '../../project.service';

/**
 * Provides a convenient way to select a world to run a truck
 * program in.
 */
@Component({
  templateUrl: 'templates/world-selector.html',
  selector: 'truck-world-selector'
})
export class WorldSelectorComponent {

  // Fired when the world changes
  @Output() selectedWorldIdChange = new EventEmitter<string>();

  // Backing field for the world that is selected
  private _selectedWorldId: string = undefined;

  constructor(
    private _projectService: ProjectService,
  ) {
  }

  /**
   * @return All worlds that are applicable to the current program.
   */
  get availableWorlds() {
    const codeResources = this._projectService.cachedProject.codeResources;
    return (codeResources.filter(res => res.emittedLanguageIdPeek == "truck-world"));
  }

  /**
   * @return The id of the currently selected world.
   */
  @Input()
  get selectedWorldId() {
    return (this._selectedWorldId);
  }

  /**
   * Assigns a different world.
   */
  set selectedWorldId(id: string) {
    this._selectedWorldId = id;
    this.selectedWorldIdChange.emit(id);
  }
}