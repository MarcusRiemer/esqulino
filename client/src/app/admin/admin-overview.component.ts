import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'

/**
 * Administrative Overview, this is the "greeting" page for every
 * user that enters the administration panels.
 */
@Component({
  templateUrl: 'templates/admin-overview.html'
})
export class AdminOverviewComponent implements OnInit {

  constructor(
    private _title: Title,
  ) {
  }

  ngOnInit(): void {
    this._title.setTitle(`Admin - BlattWerkzeug`)
  }
}
