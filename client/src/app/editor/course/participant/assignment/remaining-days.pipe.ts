import { StringMap } from "@angular/compiler/src/compiler_facade_interface";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "remainingDays" })
export class RemainingDaysPipe implements PipeTransform {
  transform(value: string): string {
    const inputDate = new Date(value);
    const today = new Date();
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    var different = inputDate.getTime() - today.getTime();
    if (different > 0) {
      return (
        "in " + Math.round(different / millisecondsPerDay).toString() + " Tagen"
      );
    } else {
      return "";
    }
  }
}
