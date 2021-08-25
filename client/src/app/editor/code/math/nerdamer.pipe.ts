import { Pipe, PipeTransform } from "@angular/core";
import nerdamer from "nerdamer";

@Pipe({
  name: "nerdamer",
  pure: true,
})
export class NerdamerPipe implements PipeTransform {
  transform(value: nerdamer.Expression | string): string {
    if (typeof value === "string") {
      return value;
    } else {
      return value.text();
    }
  }
}
