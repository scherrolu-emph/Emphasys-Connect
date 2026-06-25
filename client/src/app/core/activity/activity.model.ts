export interface ActivityItem {
  messageId: string;
  body: string;
  messageType: 'system' | 'manual';
  authorName?: string;
  caseId: string;
  caseName: string;
  createdAt: string;
}

export function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
