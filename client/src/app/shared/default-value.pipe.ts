import { Pipe, PipeTransform } from "@angular/core";

/**
 * Inserts a replacement string if the given string is
 * undefined, null or the empty string.
 */
@Pipe({ name: "defaultValue" })
export class DefaultValuePipe implements PipeTransform {
  transform(value: string, defaultValue: string = "␀") {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    } else {
      return value;
    }
  }
}
