
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
// If any request gets 401, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// ── Persona endpoints ────────────────────────────────────────────────────────
export const createPersona = (data) =>
  api.post("/persona/create", data);

export const getAllPersonas = () =>
  api.get("/persona/all");

export const getPersona = (id) =>
  api.get(`/persona/${id}`);

export const deletePersona = (id) =>
  api.delete(`/persona/${id}`);

export const deletePersonaMemory = (personaId, memory) =>
  api.delete(`/persona/${personaId}/memory`, { data: { memory } });

// ── Chat endpoints ───────────────────────────────────────────────────────────
export const sendMessage = (personaId, message, chatId = null) =>
  api.post(`/chat/${personaId}`, { message, chatId });

export const getChatHistory = (personaId) =>
  api.get(`/chat/${personaId}/history`);

export const getChatSession = (chatId) =>
  api.get(`/chat/session/${chatId}`);

// ── Room endpoints ───────────────────────────────────────────────────────────
export const createRoom = (data) =>
  api.post("/room/create", data);

export const getAllRooms = () =>
  api.get("/room/all");

export const getRoom = (roomId) =>
  api.get(`/room/${roomId}`);

export const deleteRoom = (roomId) =>
  api.delete(`/room/${roomId}`);

export const sendRoomMessage = (roomId, message) =>
  api.post(`/room/${roomId}/message`, { message });

export const triggerRoomInteraction = (roomId) =>
  api.post(`/room/${roomId}/interact`);

// ── OTP endpoints ────────────────────────────────────────────────────────────
export const sendOtp = (email) =>
  api.post("/auth/send-otp", { email });

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

export default api;