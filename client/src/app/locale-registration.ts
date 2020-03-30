import { registerLocaleData } from "@angular/common";
import localeDe from "@angular/common/locales/de";

/**
 * Register locale data for all supported locales.
 * English is supported by default.
 */
function registerLanguages() {
  registerLocaleData(localeDe, "de");
}

export default registerLanguages;
