import { identicon } from "minidenticons";

export function getAuthMethod() {
  return localStorage.getItem("authMethod");
}

export function getCurrentAddress() {
  return localStorage.getItem("currentAddress");
}

export function getIcon(input: string | null) {
  if (input === null) return;
  const svg = identicon(input, 50, 50);
  return svg;
}
