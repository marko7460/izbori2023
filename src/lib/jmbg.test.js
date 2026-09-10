import { digitsOnly, isCompleteJmbg, isValidJmbg, jmbgChecksum } from "./jmbg";

describe("jmbg helpers", () => {
  test("keeps only the first 13 digits", () => {
    expect(digitsOnly("12-34-567 890123456")).toBe("1234567890123");
  });

  test("accepts a complete 13-digit value", () => {
    expect(isCompleteJmbg("0101990710006")).toBe(true);
    expect(isCompleteJmbg("123")).toBe(false);
  });

  test("validates the official checksum", () => {
    const valid = "0101990710121";
    expect(jmbgChecksum(valid)).toBe(1);
    expect(isValidJmbg(valid)).toBe(true);
    expect(isValidJmbg("0101990710128")).toBe(false);
  });
});
