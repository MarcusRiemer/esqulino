import { Component } from '@angular/core';

import { Angulartics2Piwik } from 'angulartics2/piwik';

@Component({
  selector: 'sql-scratch',
  template: `<router-outlet></router-outlet>`
})
export class SqlScratchComponent {
  // The piwik service needs to be required at least once
  constructor(piwik: Angulartics2Piwik) {

  }
}
