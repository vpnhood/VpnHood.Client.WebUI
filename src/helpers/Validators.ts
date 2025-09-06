export const ipRegex: RegExp = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4})$/;

export function validateIp(value: string | null, errorMessage = 'Invalid IP address'): true | string {
  if (!value || value.trim() === '') return true;
  return ipRegex.test(value.trim()) ? true : errorMessage;
}

export function formatIpInput(value: string): string {
  const raw = value.replace(/\s+/g, '').toLowerCase();

  // If it contains colons or hex characters, treat as IPv6
  if (/[a-f:]/.test(raw)) {
    return formatIPv6(raw);
  }

  // If it already looks like a valid IPv4, leave it alone
  if (/^(\d{1,3}\.){0,3}\d{1,3}$/.test(raw)) {
    return raw;
  }

  // Otherwise, format as raw IPv4
  return formatIPv4(raw);
}

export function isEmptyString(value: string): boolean{
  return value.trim() === '';
}

function formatIPv4(value: string): string {
  const segments = value.split('.').map(s => s.replace(/[^\d]/g, '')).filter(Boolean);
  const parts: string[] = [];

  for (const segment of segments) {
    if (segment.length <= 3) {
      parts.push(segment);
    } else {
      for (let i = 0; i < segment.length && parts.length < 4; i += 3) {
        parts.push(segment.slice(i, i + 3));
      }
    }
    if (parts.length >= 4) break;
  }

  return parts.join('.');
}

function formatIPv6(value: string): string {
  // Preserve valid IPv6 input
  if (/^([a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}$/.test(value)) return value;

  const hex = value.replace(/[^a-f0-9]/gi, '');
  const parts: string[] = [];

  for (let i = 0; i < hex.length && parts.length < 8;) {
    const remaining = hex.length - i;

    if (remaining >= 4) {
      parts.push(hex.slice(i, i + 4));
      i += 4;
    } else {
      parts.push(hex.slice(i));
      break;
    }
  }

  return parts.join(':');
}
