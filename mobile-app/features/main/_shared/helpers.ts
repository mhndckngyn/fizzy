export function getInitials(name: string) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "$blue9",
    "$orange9",
    "$green9",
    "$pink9",
    "$purple9",
    "$red9",
  ];

  const charCodeSum = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const color = colors[charCodeSum % colors.length];

  return { initials, color };
}
