import { Component, Input } from '@angular/core'

import { CodeResource } from '../shared';
import { BlockLanguage } from '../shared/block';

@Component({
  templateUrl: 'templates/code-resource-gallery.html',
  selector: `code-resource-gallery`
})
export class CodeResourceGalleryComponent {
  @Input()
  public toRender: CodeResource[] = [];

  @Input()
  public blockLanguage: BlockLanguage;
}