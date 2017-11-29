import { Component, Input } from '@angular/core';

import { CodeResource } from '../../shared/syntaxtree'

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent {
  @Input() codeResource: CodeResource;
}
