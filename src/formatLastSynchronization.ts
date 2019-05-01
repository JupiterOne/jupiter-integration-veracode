export default function formatLastSynchronization(
  lastSuccessfulSynchronizationTime: number | null,
): string | undefined {
  return lastSuccessfulSynchronizationTime
    ? new Date(lastSuccessfulSynchronizationTime).toISOString().split("T")[0]
    : undefined;
}
