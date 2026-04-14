import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBaseUrl } from "./baseUrl";

const buildUrl = (path) => {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

const parseJsonSafe = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const apiRequest = async (path, { method = "GET", body, headers } = {}) => {
  const token = await AsyncStorage.getItem("accessToken");

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const message = json?.message || `Request failed (${res.status})`;
    const code = json?.code || "REQUEST_FAILED";
    const err = new Error(message);
    err.code = code;
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
};
