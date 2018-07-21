import { JsonEditorOptions } from 'ang-jsoneditor';

export function defaultJsonEditorOptions() {
  const toReturn = new JsonEditorOptions();

  toReturn.sortObjectKeys = false;
  toReturn.modes = ["tree", "text", "code"];
  toReturn.mode = "code";

  return (toReturn);
}