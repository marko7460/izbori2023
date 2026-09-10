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
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const result = await savePdfOnDevice(new Uint8Array([1, 2, 3]), "form.pdf");
    expect(result).toBe("downloaded");
    expect(click).toHaveBeenCalled();
  });

  test("shares only the PDF file on iPhone, without a title or text payload", async () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const share = jest.fn().mockResolvedValue(undefined);
    navigator.canShare = jest.fn(() => true);
    navigator.share = share;
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const result = await savePdfOnDevice(new Uint8Array([1, 2, 3]), "form.pdf");

    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledTimes(1);
    expect(Object.keys(share.mock.calls[0][0])).toEqual(["files"]);
    expect(share.mock.calls[0][0].files).toHaveLength(1);
    expect(share.mock.calls[0][0].files[0].name).toBe("form.pdf");
    expect(click).not.toHaveBeenCalled();
  });
});
