import { UrlFriendlyIdPipe } from "./url-friendly-id.pipe";

describe("UrlFriendlyIdPipe", () => {
  it("create an instance", () => {
    const pipe = new UrlFriendlyIdPipe();
    expect(pipe).toBeTruthy();
  });
});
