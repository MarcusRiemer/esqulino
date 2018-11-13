import { ComponentPortal } from '@angular/cdk/portal';

import { EditorComponentDescription } from '../../shared/block/block-language.description';

import { QueryPreviewComponent } from './query/query-preview.component';
import { ValidationComponent } from './validation.component';
import { CodeGeneratorComponent } from './code-generator.component';

/**
 * Allows registration of available editor components and hands them
 * out on demand.
 */
export class EditorComponentsService {
  createComponent(description: EditorComponentDescription): ComponentPortal<{}> {
    switch (description.componentType) {
      case "query-preview": return (new ComponentPortal(QueryPreviewComponent));
      case "validator": return (new ComponentPortal(ValidationComponent));
      case "generated-code": return (new ComponentPortal(CodeGeneratorComponent));
    }
  }
}
