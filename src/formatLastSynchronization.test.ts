import formatLastSynchronization from "./formatLastSynchronization";

test("returns undefined when lastSuccessfulSynchronizationTime is null", () => {
  expect(formatLastSynchronization(null)).toBeUndefined();
});

test("returns yyyy-mm-dd format when lastSuccessfulSynchronizationTime is not null", () => {
  expect(formatLastSynchronization(1000197900000)).toBe("2001-09-11");
});
