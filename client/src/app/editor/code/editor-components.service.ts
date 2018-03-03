import { Injectable } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';

import { EditorComponentDescription } from '../../shared/block/block-language.description';

import { QueryPreviewComponent } from './query/query-preview.component';

/**
 * Allows registration of available editor components and hands them
 * out on demand.
 */
export class EditorComponentsService {
  createComponent(description: EditorComponentDescription): ComponentPortal<{}> {
    switch (description.componentType) {
      case "query-preview": return (new ComponentPortal(QueryPreviewComponent));
    }
  }
}
