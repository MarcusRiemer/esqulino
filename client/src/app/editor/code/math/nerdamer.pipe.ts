import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "nerdamer",
  pure: true,
})
export class NerdamerPipe implements PipeTransform {
  transform(value: nerdamer.Expression): string {
    return value.text();
  }
}
