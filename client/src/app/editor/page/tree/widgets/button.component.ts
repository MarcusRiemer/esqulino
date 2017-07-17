import { Component, Inject, OnInit } from '@angular/core'

import { Button } from '../../../../shared/page/widgets/index'

import { WIDGET_MODEL_TOKEN } from '../../../editor.token'

export { Button }

@Component({
  templateUrl: 'templates/button.html',
})
export class ButtonComponent {
  constructor( @Inject(WIDGET_MODEL_TOKEN) public model: Button) {

  }
}
