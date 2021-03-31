import { Pipe, PipeTransform } from "@angular/core";

interface UrlFriendlyEntity {
  id: string;
  slug?: string;
}

@Pipe({
  name: "urlFriendlyId",
  pure: true,
})
export class UrlFriendlyIdPipe implements PipeTransform {
  transform(value: UrlFriendlyEntity, ...args: unknown[]): unknown {
    return value.slug ?? value.id;
  }
}
