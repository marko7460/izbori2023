import { savePdfOnDevice } from "./savePdf";

describe("savePdfOnDevice", () => {
  const originalCanShare = navigator.canShare;
  const originalShare = navigator.share;
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
    navigator.canShare = originalCanShare;
    navigator.share = originalShare;
    jest.restoreAllMocks();
  });

  test("downloads a PDF on desktop", async () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    });
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const result = await savePdfOnDevice(new Uint8Array([1, 2, 3]), "form.pdf");
    expect(result).toBe("downloaded");
    expect(click).toHaveBeenCalled();
  });
});
