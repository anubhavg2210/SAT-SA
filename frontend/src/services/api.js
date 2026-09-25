const API_BASE = "http://127.0.0.1:8000";

export async function getAnalysis() {
  const response = await fetch(
    `${API_BASE}/api/analysis`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Analysis failed");
  }

  return response.json();
}
