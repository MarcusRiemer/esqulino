import { Component, Input } from "@angular/core"

import { Action } from '../../../../../shared/page/index'
import { Form } from '../../../../../shared/page/widgets'

/**
 * Displays the state of parameters that are provided by
 * a form.
 */
@Component({
  selector: `form-parameters`,
  templateUrl: 'templates/form-parameters.html',
})
export class FormParametersComponent {
  @Input()
  public action: Action;

  @Input()
  public form: Form;

  get hasParameters(): boolean {
    return (this.parameters.length > 0);
  }

  get parameters(): string[] {
    return (this.action.parameterNames);
  }

  isParameterSatisfied(paramName: string): boolean {
    return (this.form.providesName(paramName));
  }
}
