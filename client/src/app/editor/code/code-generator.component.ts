import { Component, Input } from '@angular/core';

import { CodeResource } from '../../shared/syntaxtree'

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: 'templates/code-generator.html',
  selector: 'ast-code-generator'
})
export class CodeGeneratorComponent {
  @Input() codeResource: CodeResource;
}
