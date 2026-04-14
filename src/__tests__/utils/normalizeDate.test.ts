function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) return value;
  return null;
}

describe("normalizeDate utility", () => {
  describe("Firestore Timestamp", () => {
    it("calls toDate() on Firestore Timestamp objects", () => {
      const mockDate = new Date("2025-06-15");
      const mockTimestamp = { toDate: () => mockDate };

      expect(normalizeDate(mockTimestamp)).toBe(mockDate);
    });

    it("returns the exact date from toDate()", () => {
      const specificDate = new Date("2024-03-22T10:30:00.000Z");
      const ts = { toDate: () => specificDate };

      const result = normalizeDate(ts);
      expect(result?.getTime()).toBe(specificDate.getTime());
    });
  });

  describe("String dates", () => {
    it("parses ISO date string", () => {
      const result = normalizeDate("2025-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result!.getTime())).toBe(false);
    });

    it("parses ISO datetime string", () => {
      const result = normalizeDate("2025-06-01T12:00:00.000Z");
      expect(result).toBeInstanceOf(Date);
      expect(result!.getUTCHours()).toBe(12);
    });

    it("returns null for invalid date string", () => {
      expect(normalizeDate("not-a-date")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(normalizeDate("")).toBeNull();
    });

    it("returns null for random string", () => {
      expect(normalizeDate("hello world")).toBeNull();
    });
  });

  describe("Date objects", () => {
    it("returns the same Date object if already a Date", () => {
      const date = new Date("2025-07-04");
      const result = normalizeDate(date);
      expect(result).toBe(date);
    });

    it("handles Date at epoch", () => {
      const epoch = new Date(0);
      expect(normalizeDate(epoch)).toBe(epoch);
    });
  });

  describe("Null and falsy values", () => {
    it("returns null for null input", () => {
      expect(normalizeDate(null)).toBeNull();
    });

    it("returns null for undefined input", () => {
      expect(normalizeDate(undefined)).toBeNull();
    });

    it("returns null for 0", () => {
      expect(normalizeDate(0)).toBeNull();
    });

    it("returns null for false", () => {
      expect(normalizeDate(false)).toBeNull();
    });
  });

  describe("Other types", () => {
    it("returns null for plain objects without toDate", () => {
      expect(normalizeDate({ someKey: "value" })).toBeNull();
    });

    it("returns null for numbers (non-falsy)", () => {
      expect(normalizeDate(12345)).toBeNull();
    });
  });
});