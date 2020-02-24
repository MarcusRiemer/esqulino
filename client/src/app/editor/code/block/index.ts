import { BlockBaseDirective } from './block-base.directive'
import { BlockHostComponent } from './block-host.component'
import { BlockRenderComponent } from './block-render.component'
import { BlockRenderBlockComponent } from './block-render-block.component'
import { BlockRenderDropTargetComponent } from './block-render-drop-target.component'
import { BlockRenderInputComponent } from './block-render-input.component'
import { BlockRenderErrorComponent } from './block-render-error.component'

export const BLOCK_RENDER_COMPONENTS = [
  BlockRenderComponent,
  BlockRenderBlockComponent,
  BlockRenderDropTargetComponent,
  BlockRenderErrorComponent,
  BlockRenderInputComponent,
  BlockHostComponent,
  BlockBaseDirective,
]

export {
  BlockRenderComponent,
  BlockRenderBlockComponent,
  BlockRenderDropTargetComponent,
  BlockRenderErrorComponent,
  BlockRenderInputComponent,
  BlockHostComponent,
  BlockBaseDirective,
}