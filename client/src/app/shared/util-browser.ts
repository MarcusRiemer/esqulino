/**
 * Generates a properly formatted UUIDv4 string. Taken from:
 * https://gist.github.com/jed/982883
 */
export function generateUUIDv4() {
  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: any) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  );
}

export function urlParamsFromObject(
  params: Object | Array<unknown>,
  skipobjects = false,
  whitelist: string[] = [],
  prefix = ""
) {
  var isObj = function (a: unknown): boolean {
    return !!a && a.constructor === Object;
  };
  var _st = function (z: string, g: string) {
    return "" + (g != "" ? "[" : "") + z + (g != "" ? "]" : "");
  };
  var result = "";
  if (typeof params != "object") {
    return prefix + "=" + encodeURIComponent(params) + "&";
  }
  for (var param in params) {
    if (whitelist.length > 0 && !whitelist.includes(param)) {
      continue;
    }

    var c = "" + prefix + _st(param, prefix);
    if (isObj(params[param]) && !skipobjects) {
      result += urlParamsFromObject(
        params[param],
        skipobjects,
        whitelist,
        "" + c
      );
    } else if (Array.isArray(params[param]) && !skipobjects) {
      params[param].forEach((item, ind) => {
        result += urlParamsFromObject(
          item,
          skipobjects,
          whitelist,
          c + "[" + ind + "]"
        );
      });
    } else {
      result += c + "=" + encodeURIComponent(params[param]) + "&";
    }
  }
  if (prefix === "" && result.endsWith("&")) {
    result = result.substring(0, result.length - 1);
  }
  return result;
}
