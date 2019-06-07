import { VisualBlockDescriptions } from '../block.description';

export function readableConstants(all: VisualBlockDescriptions.ConcreteBlock[]): string {
  let toReturn = "";
  all.forEach(b => {
    switch (b.blockType) {
      case "constant":
        toReturn += b.text;
        break;
      case "block":
      case "iterator":
        toReturn += `<${b.blockType}>` + readableConstants(b.children) + `</${b.blockType}>`;
        break;
    }
  });

  return (toReturn);
}