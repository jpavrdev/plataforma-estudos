export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, maxChars)
    .join('')
    .toUpperCase();
}
