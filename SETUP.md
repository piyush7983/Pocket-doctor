# 🏥 Swasthya Sahayak - Setup Guide

## 📋 Prerequisites

- **Node.js** 18+ and **npm**
- **Java** 17+
- **Maven** 3.8+
- **MongoDB** 6+ (running locally or cloud instance)
- (Optional) Gemini API Key for real AI responses
- (Optional) Google Places API Key for real hospital data

---

## 🚀 Quick Start

### 1. Clone & Enter Project
```bash
cd swasthya-sahayak
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start dev server
npm run dev
```
Frontend runs at: **http://localhost:5173**

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Make sure MongoDB is running
# Default: mongodb://localhost:27017

# Build & run
mvn spring-boot:run
```
Backend runs at: **http://localhost:8080**

---

## 🔧 Configuration

### Frontend (.env)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080/api` |
| `VITE_GEMINI_API_KEY` | Gemini API key (optional) | - |

### Backend (application.properties)
| Property | Description | Default |
|---|---|---|
| `server.port` | Server port | `8080` |
| `spring.data.mongodb.uri` | MongoDB connection | `mongodb://localhost:27017/swasthya_sahayak` |
| `app.jwt.secret` | JWT signing secret | Change this! |
| `app.gemini.api-key` | Gemini API key | `DEMO_KEY` (uses mock) |
| `app.gemini.model` | Gemini model | `gemini-1.5-flash` |
| `app.gemini.system-prompt` | Gemini system prompt | - |
| `app.google.api-key` | Google Places API key | `DEMO_KEY` (uses mock) |

---

## 📁 Project Structure

```
swasthya-sahayak/
├── src/                          # Frontend (React + Vite + Tailwind)
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatAssistant.tsx     # AI Chat UI
│   │   ├── NearbyHospitals.tsx   # Hospital finder
│   │   ├── History.tsx           # Chat history list
│   │   ├── Profile.tsx           # User profile
│   │   └── LoadingSkeleton.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Dashboard.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   └── api.ts               # API calls + mock data
│   ├── App.tsx
│   └── main.tsx
│
├── backend/                      # Backend (Spring Boot)
│   ├── pom.xml
│   └── src/main/java/com/swasthyasahayak/
│       ├── SwasthyaSahayakApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── JwtAuthFilter.java
│       │   ├── JwtUtil.java
│       │   └── CorsConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── ChatController.java
│       │   └── HospitalController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── ChatService.java
│       │   └── HospitalService.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── ChatSessionRepository.java
│       ├── model/
│       │   ├── User.java
│       │   ├── ChatMessage.java
│       │   └── ChatSession.java
│       └── dto/
│           ├── SignupRequest.java
│           ├── LoginRequest.java
│           ├── AuthResponse.java
│           ├── UserDto.java
│           ├── ChatRequest.java
│           └── ChatResponse.java
│
├── .env.example
├── SETUP.md
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login & get JWT |
| POST | `/api/chat` | Yes | Send message to AI |
| GET | `/api/history` | Yes | Get all chat sessions |
| GET | `/api/history/{id}` | Yes | Get single session |
| DELETE | `/api/history/{id}` | Yes | Delete session |
| GET | `/api/nearby-hospitals?lat=&lng=` | Yes | FIND NEARBY HOSPITALS |

---

## 🎨 Features

- ✅ AI Health Assistant with symptom analysis
- ✅ Emergency symptom detection with alert banner
- ✅ Nearby hospitals finder with geolocation
- ✅ Chat history with persistence
- ✅ JWT authentication (signup/login)
- ✅ Dark mode toggle
- ✅ Voice input (Web Speech API)
- ✅ Responsive design (mobile + desktop)
- ✅ Smooth animations (Framer Motion)
- ✅ Toast notifications
- ✅ Loading skeletons
- ✅ Typing animation for AI responses

---

## 💡 Notes

- The app works **without** any external API keys — it uses mock data for AI responses and hospitals
- For production, configure real API keys in `backend/src/main/resources/application.properties`
- Chat history is stored in MongoDB when backend is connected; falls back to localStorage
- The frontend can run independently for demo purposes with all mock data
