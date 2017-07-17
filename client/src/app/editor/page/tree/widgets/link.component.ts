import { Component, Inject, OnInit } from '@angular/core'

import { Link } from '../../../../shared/page/widgets/index'

import { WIDGET_MODEL_TOKEN } from '../../../editor.token'

@Component({
  templateUrl: 'templates/link.html',
})
export class LinkComponent {
  constructor( @Inject(WIDGET_MODEL_TOKEN) public model: Link) {

  }
}
