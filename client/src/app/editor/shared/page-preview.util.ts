import { Widget, isWidget, WidgetCategory } from '../../shared/page/widgets/index'

/**
 * @return A CSS-class that denots the border that should be
 *         used for this widget.
 */
export function borderCssClass(widget: Widget | WidgetCategory): string {
  const category = isWidget(widget) ? widget.category : widget;
  return (`border-${category}-preview`);
}
