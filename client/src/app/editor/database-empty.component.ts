import { Component, Input } from '@angular/core'

import { Project } from '../shared/project'

@Component({
  selector: 'database-empty',
  templateUrl: "templates/database-empty.html"
})
export class DatabaseEmptyComponent {
  @Input() project: Project;
}
