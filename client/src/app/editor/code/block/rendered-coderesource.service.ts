import { Injectable } from '@angular/core'

import { CodeResource, Node } from '../../../shared';
import { BlockLanguage } from '../../../shared/block';
import { Subject } from 'rxjs';

/**
 * This service is provided at the root component that is used to render a coderesource.
 * It shares all data in the rendertree that is required "globally" by all components.
 */
@Injectable()
export class RenderedCodeResourceService {

  private readonly _codeResource = new Subject<CodeResource>();

  private readonly _blockLanguage = new Subject<BlockLanguage>();

  private readonly _node = new Subject<Node>();

  private readonly _readOnly = new Subject<boolean>();

  readonly codeResource = this._codeResource.asObservable();

  readonly blockLanguage = this._blockLanguage.asObservable();

  readonly node = this._node.asObservable();

  readonly readOnly = this._readOnly.asObservable();

  _updateRenderData(
    codeResource: CodeResource,
    blockLanguage: BlockLanguage,
    node: Node,
    readOnly: boolean,
  ) {
    this._codeResource.next(codeResource);
    this._node.next(node);
    this._readOnly.next(readOnly);

    if (blockLanguage) {
      this._blockLanguage.next(blockLanguage);
    } else {
      this._blockLanguage.next(codeResource.blockLanguagePeek);
    }
  }
}