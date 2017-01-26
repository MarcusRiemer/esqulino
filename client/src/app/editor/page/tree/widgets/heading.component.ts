import {Component, Inject, OnInit} from '@angular/core'

import {Heading}                  from '../../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

export {Heading}

@Component({
    templateUrl: 'templates/heading.html',
})
export class HeadingComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Heading) {

    }
}
