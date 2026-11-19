const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  let result;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new ApiError(
      result?.message || `The request failed (${response.status}).`,
      response.status,
    );
  }

  return result;
}

export function formatDate(value, options = { dateStyle: "medium" }) {
  if (!value) return "Date not provided";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not provided" : new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatVital(vital) {
  if (vital.type === "blood-pressure") {
    return `${vital.systolic}/${vital.diastolic} ${vital.unit || "mmHg"}`;
  }

  return `${vital.value} ${vital.unit || ""}`.trim();
}

export function vitalLabel(type) {
  return ({
    "blood-pressure": "Blood pressure",
    "blood-sugar": "Blood sugar",
    weight: "Weight",
    height: "Height",
    "heart-rate": "Heart rate",
    temperature: "Temperature",
    "oxygen-saturation": "Oxygen saturation",
    other: "Other",
  })[type] || type;
}

export function fileLabel(type) {
  return ({
    "lab-report": "Lab report",
    prescription: "Prescription",
    other: "Other document",
  })[type] || "Health document";
}
