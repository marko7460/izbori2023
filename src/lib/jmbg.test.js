import { digitsOnly } from "./jmbg";

describe("jmbg helpers", () => {
  test("keeps only the first 13 digits", () => {
    expect(digitsOnly("12-34-567 890123456")).toBe("1234567890123");
  });
});
