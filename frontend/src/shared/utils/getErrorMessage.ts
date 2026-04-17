export function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.detail || error?.message || fallback;
}