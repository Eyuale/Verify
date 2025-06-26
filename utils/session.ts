import { ironOptions } from "@/lib/config";

// In-memory store for simplicity (replace with Redis/MongoDB in production)
let inMemorySession: { formData: Record<string, string> } = { formData: {} };

export async function getSession() {
  // For server actions, use in-memory for testing
  // In production, use Redis or MongoDB
  return inMemorySession;
}

export async function saveSession(session: {
  formData: Record<string, string>;
}) {
  inMemorySession = session;
}
