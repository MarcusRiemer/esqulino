import { Component, Input, OnInit } from '@angular/core'

import { CodeResourceDescription, CodeResource } from '../shared';
import { BlockLanguage } from '../shared/block';

@Component({
  templateUrl: 'templates/code-resource-gallery.html',
  selector: `code-resource-gallery`
})
export class CodeResourceGalleryComponent implements OnInit {
  @Input()
  public resourceDescriptions: CodeResourceDescription[] = [];

  @Input()
  public blockLanguage: BlockLanguage;

  public toRender: CodeResource[] = [];

  ngOnInit() {
    this.toRender = this.resourceDescriptions.map(desc => new CodeResource(desc));
  }
}