import * as http from 'http'
import * as https from 'https'
import { URL } from 'url'

export function httpRequest<T>(url: URL, method: "GET" | "POST" | "PUT", body: any) {
  const p = new Promise<T>((resolve, reject) => {
    const lib = url.protocol === "https" ? https : http;

    // Build the complicated request options object
    // This is basicly the same as the URL + required headers + the method
    const options: http.RequestOptions = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol,
      path: url.pathname,
      headers: {
        "Content-Type": "application/json"
      },
    }

    const buffer = body instanceof Buffer ? body : Buffer.from(JSON.stringify(body), 'utf8');
    options.headers["Content-Length"] = buffer.byteLength;

    // Build the request object
    const request = http.request(options, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed to load page, status code: ' + response.statusCode));
      }

      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => {
        body.push(chunk);
      });
      // we are done, resolve promise with those joined chunks
      response.on('end', () => {
        resolve(body.join('') as any);
      });
    });

    // handle connection errors of the request
    request.on('error', (err) => reject(`ERROR ${method}: ${url.toString()}\n${JSON.stringify(err)}`));

    // Pump data into the request (if its a POST request)
    if (buffer.length > 0) {
      request.write(buffer);
    }

    console.log(`${method}: ${url.toString()} (${buffer.length} byte)`);

    // And hit off the request for good
    request.end();
  });

  return (p);
}

