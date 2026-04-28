import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ----------- Chat API -----------

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Send message to AI
export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<{ response: string; sessionId: string }> {
  try {
    const res = await api.post("/chat", { message, sessionId });
    return res.data;
  } catch {
    // Mock AI response for demo
    return mockAIResponse(message, sessionId);
  }
}

// Get chat history
export async function getChatHistory(): Promise<ChatSession[]> {
  try {
    const res = await api.get("/history");
    return res.data;
  } catch {
    // Return mock data
    const stored = localStorage.getItem("chatSessions");
    return stored ? JSON.parse(stored) : [];
  }
}

// Get single session
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  try {
    const res = await api.get(`/history/${sessionId}`);
    return res.data;
  } catch {
    const stored = localStorage.getItem("chatSessions");
    if (stored) {
      const sessions: ChatSession[] = JSON.parse(stored);
      return sessions.find((s) => s.id === sessionId) || null;
    }
    return null;
  }
}

// Delete session
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    await api.delete(`/history/${sessionId}`);
  } catch {
    const stored = localStorage.getItem("chatSessions");
    if (stored) {
      const sessions: ChatSession[] = JSON.parse(stored);
      const filtered = sessions.filter((s) => s.id !== sessionId);
      localStorage.setItem("chatSessions", JSON.stringify(filtered));
    }
  }
}

// ----------- Hospitals API -----------

export interface Hospital {
  placeId: string;
  name: string;
  address: string;
  distance: number; // in km
  rating: number;
  totalRatings: number;
  mapsUrl: string;
  phoneNumber?: string;
  lat: number;
  lng: number;
}

export async function getNearbyHospitals(
  lat: number,
  lng: number
): Promise<Hospital[]> {
  try {
    const res = await api.get("/nearby-hospitals", {
      params: { lat, lng },
    });
    return res.data;
  } catch {
    return mockHospitals(lat, lng);
  }
}

// ----------- Mock Data -----------

function mockAIResponse(
  message: string,
  sessionId?: string
): { response: string; sessionId: string } {
  const sid = sessionId || "session-" + Date.now();
  const lowerMsg = message.toLowerCase();

  // Emergency keywords
  const emergencyKeywords = [
    "chest pain",
    "heart attack",
    "stroke",
    "cannot breathe",
    "severe bleeding",
    "unconscious",
    "seizure",
    "suicide",
    "overdose",
  ];

  const isEmergency = emergencyKeywords.some((kw) => lowerMsg.includes(kw));

  if (isEmergency) {
    return {
      response: `🚨 **EMERGENCY WARNING** 🚨

Based on what you described, this could be a medical emergency. Please take immediate action:

- **Call 108 (Ambulance)** or **112 (Emergency)** immediately
- Go to the nearest hospital emergency room
- Do NOT drive yourself if you have chest pain or breathing difficulty
- If someone is with you, ask them to help

⚠️ *This is not a medical diagnosis. Please seek emergency medical help immediately.*`,
      sessionId: sid,
    };
  }

  // Symptom-based mock responses
  if (lowerMsg.includes("headache") || lowerMsg.includes("migraine")) {
    return {
      response: `🩺 **Headache Analysis**

**Possible Causes:**
- Stress or tension
- Dehydration
- Eye strain from screens
- Lack of sleep
- Sinus issues

**Home Remedies:**
- Drink plenty of water (at least 2-3 glasses)
- Rest in a dark, quiet room
- Cold or warm compress on forehead
- Gentle temple massage
- Avoid screen time for a while

**Safe OTC Options:**
- Paracetamol (Crocin/Dolo 650) if pain is moderate
- Ibuprofen (after food) for tension headaches

**When to See a Doctor:**
- Headache lasts more than 72 hours
- Sudden severe "thunderclap" headache
- Accompanied by stiff neck, fever, or vision changes
- Headache after head injury

⚠️ *This is not a medical diagnosis. Please consult a doctor for persistent symptoms.*`,
      sessionId: sid,
    };
  }

  if (lowerMsg.includes("fever") || lowerMsg.includes("temperature") || lowerMsg.includes("bukhar")) {
    return {
      response: `🌡️ **Fever Analysis**

**Possible Causes:**
- Viral or bacterial infection
- Seasonal flu
- Dengue/Malaria (if in endemic area)
- Urinary tract infection
- COVID-19

**Home Remedies:**
- Rest well and avoid exertion
- Drink lots of fluids (water, ORS, coconut water)
- Sponge bath with lukewarm water (not cold)
- Wear light, breathable clothing
- Monitor temperature every 4-6 hours

**Safe OTC Options:**
- Paracetamol (Crocin/Dolo 650) every 6 hours
- Avoid self-medicating with antibiotics

**When to See a Doctor:**
- Fever above 103°F (39.4°C)
- Fever lasting more than 3 days
- Severe body pain or rashes
- Difficulty breathing
- Confusion or extreme weakness

⚠️ *This is not a medical diagnosis. Please consult a doctor.*`,
      sessionId: sid,
    };
  }

  if (lowerMsg.includes("cold") || lowerMsg.includes("cough") || lowerMsg.includes("khansi") || lowerMsg.includes("sardi")) {
    return {
      response: `🤧 **Cold & Cough Analysis**

**Possible Causes:**
- Common cold (viral)
- Seasonal allergies
- Sinusitis
- Post-nasal drip

**Home Remedies:**
- Steam inhalation 2-3 times daily
- Warm salt water gargle
- Honey + ginger + tulsi tea
- Turmeric milk (haldi doodh) at bedtime
- Use a humidifier
- Stay hydrated

**Safe OTC Options:**
- Cetirizine for runny nose/allergies
- Cough syrup with dextromethorphan (for dry cough)
- Vicks VapoRub for chest congestion

**When to See a Doctor:**
- Cough lasting more than 2 weeks
- Green/yellow mucus with fever
- Blood in sputum
- Wheezing or shortness of breath
- Chest pain while coughing

⚠️ *This is not a medical diagnosis. Please consult a doctor.*`,
      sessionId: sid,
    };
  }

  if (lowerMsg.includes("stomach") || lowerMsg.includes("pet") || lowerMsg.includes("gas") || lowerMsg.includes("acidity")) {
    return {
      response: `🫄 **Stomach / Digestion Analysis**

**Possible Causes:**
- Indigestion / acidity
- Gas and bloating
- Food poisoning
- Gastritis
- Constipation

**Home Remedies:**
- Jeera (cumin) water after meals
- Ginger + lemon tea
- Buttermilk (chaas) with a pinch of hing
- Avoid spicy and oily food
- Eat small, frequent meals
- Walk for 10-15 min after eating

**Safe OTC Options:**
- Antacid gel (Digene/Gelusil) for acidity
- Pantoprazole (after consulting pharmacist)
- ORS for diarrhea

**When to See a Doctor:**
- Severe abdominal pain
- Blood in stool or vomit
- Persistent vomiting
- High fever with stomach pain
- Pain lasting more than 24 hours

⚠️ *This is not a medical diagnosis. Please consult a doctor.*`,
      sessionId: sid,
    };
  }

  // Default response
  return {
    response: `👋 **Thanks for sharing your symptoms!**

Based on what you've described, here are some general guidelines:

**General Precautions:**
- Get adequate rest
- Stay well hydrated (8-10 glasses of water)
- Eat light, nutritious meals
- Monitor your symptoms

**Home Care Tips:**
- Warm water with honey and lemon
- Herbal teas (ginger, tulsi, chamomile)
- Proper sleep schedule

**OTC Medications (General):**
- Paracetamol for pain/fever (only if needed)
- Always read the label before taking any medicine

**See a Doctor If:**
- Symptoms worsen or persist beyond 3 days
- You develop new, severe symptoms
- You have any underlying health conditions

Could you tell me more specific details about what you're experiencing? I'm here to help guide you.

⚠️ *This is not a medical diagnosis. This information is for educational purposes only. Please consult a qualified healthcare professional for proper medical advice.*`,
    sessionId: sid,
  };
}

function mockHospitals(lat: number, lng: number): Hospital[] {
  const hospitalNames = [
    { name: "AIIMS - All India Institute of Medical Sciences", rating: 4.5, ratings: 12500 },
    { name: "Apollo Hospital", rating: 4.4, ratings: 8900 },
    { name: "Fortis Healthcare", rating: 4.3, ratings: 7200 },
    { name: "Max Super Specialty Hospital", rating: 4.5, ratings: 6500 },
    { name: "Medanta - The Medicity", rating: 4.6, ratings: 9800 },
    { name: "Sir Ganga Ram Hospital", rating: 4.2, ratings: 5400 },
    { name: "BLK-Max Hospital", rating: 4.3, ratings: 4600 },
    { name: "Manipal Hospital", rating: 4.4, ratings: 5800 },
    { name: "Safdarjung Hospital", rating: 4.0, ratings: 8200 },
    { name: "Holy Family Hospital", rating: 4.1, ratings: 3100 },
  ];

  return hospitalNames.map((h, i) => {
    const distance = Math.round((0.5 + Math.random() * 19.5) * 10) / 10;
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    return {
      placeId: `mock-place-${i}`,
      name: h.name,
      address: `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 60) + 1}, Near Metro Station`,
      distance,
      rating: h.rating,
      totalRatings: h.ratings,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat + latOffset},${lng + lngOffset}`,
      phoneNumber: `+91-11-${Math.floor(10000000 + Math.random() * 90000000)}`,
      lat: lat + latOffset,
      lng: lng + lngOffset,
    };
  }).sort((a, b) => a.distance - b.distance);
}
