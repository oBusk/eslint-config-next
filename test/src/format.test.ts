import { formatCount } from "./format";

describe("formatCount", () => {
  it("leaves values below a thousand alone", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("abbreviates values of a thousand and above", () => {
    expect(formatCount(1000)).toBe("1.0k");
    expect(formatCount(12345)).toBe("12.3k");
  });
});
