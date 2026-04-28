package com.swasthyasahayak.service;

import com.swasthyasahayak.dto.ChatRequest;
import com.swasthyasahayak.dto.ChatResponse;
import com.swasthyasahayak.model.ChatMessage;
import com.swasthyasahayak.model.ChatSession;
import com.swasthyasahayak.repository.ChatSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final ChatSessionRepository sessionRepository;

    @Value("${app.gemini.api-key:DEMO_KEY}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.gemini.system-prompt:}")
    private String systemPrompt;

    public ChatService(ChatSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Process a chat message and return the AI response.
     */
    public ChatResponse processMessage(String userId, ChatRequest request) {
        // Get or create session
        ChatSession session;
        if (request.getSessionId() != null && !request.getSessionId().isEmpty()) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
        } else {
            session = ChatSession.builder()
                    .userId(userId)
                    .title(request.getMessage().length() > 40
                            ? request.getMessage().substring(0, 40) + "..."
                            : request.getMessage())
                    .build();
            session = sessionRepository.save(session);
        }

        // Add user message
        ChatMessage userMsg = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .role("user")
                .content(request.getMessage())
                .timestamp(Instant.now())
                .build();
        session.getMessages().add(userMsg);

        // Generate AI response
        String aiResponse = generateAIResponse(request.getMessage(), session.getMessages());

        // Add AI message
        ChatMessage aiMsg = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .role("assistant")
                .content(aiResponse)
                .timestamp(Instant.now())
                .build();
        session.getMessages().add(aiMsg);

        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        return ChatResponse.builder()
                .response(aiResponse)
                .sessionId(session.getId())
                .build();
    }

    /**
     * Get all chat sessions for a user.
     */
    public List<ChatSession> getUserHistory(String userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    /**
     * Get a single chat session.
     */
    public ChatSession getSession(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    /**
     * Delete a chat session.
     */
    public void deleteSession(String sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    /**
     * Generate AI response. Uses Gemini API if configured, otherwise returns a mock response.
     */
    private String generateAIResponse(String userMessage, List<ChatMessage> history) {
        // If API key is configured, call Gemini
        if (geminiApiKey != null && !geminiApiKey.isEmpty()
                && !geminiApiKey.equals("DEMO_KEY")
                && !geminiApiKey.startsWith("YOUR_")) {
            return callGemini(userMessage, history);
        }

        // Otherwise return mock response (for development/demo)
        return generateMockResponse(userMessage);
    }

    /**
     * Call Gemini API for real AI responses.
     */
    private String callGemini(String userMessage, List<ChatMessage> history) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            List<Map<String, Object>> contents = new ArrayList<>();
            for (ChatMessage msg : history) {
                Map<String, Object> part = new LinkedHashMap<>();
                part.put("text", msg.getContent());

                Map<String, Object> content = new LinkedHashMap<>();
                content.put("role", "user".equals(msg.getRole()) ? "user" : "model");
                content.put("parts", List.of(part));
                contents.add(content);
            }

            Map<String, Object> userPart = new LinkedHashMap<>();
            userPart.put("text", userMessage);

            Map<String, Object> userContent = new LinkedHashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(userPart));
            contents.add(userContent);

            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("contents", contents);

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                Map<String, Object> systemInstruction = new HashMap<>();
                systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
                requestPayload.put("systemInstruction", systemInstruction);
            }

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 500);
            requestPayload.put("generationConfig", generationConfig);

            String requestBody = objectMapper.writeValueAsString(requestPayload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/"
                            + geminiModel + ":generateContent?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");

                if (!textNode.isMissingNode() && !textNode.isNull()) {
                    return textNode.asText();
                }
            }

            log.warn("Gemini API returned non-success status {}: {}", response.statusCode(), response.body());
            return generateMockResponse(userMessage);
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "I'm sorry, I'm having trouble connecting to my knowledge base right now. "
                    + "Please try again in a moment.\n\n"
                    + "⚠️ *This is not a medical diagnosis. Please consult a doctor.*";
        }
    }

    /**
     * Mock AI response for development/testing when no API key is configured.
     */
    private String generateMockResponse(String userMessage) {
        String lowerMsg = userMessage.toLowerCase();

        // Emergency check
        String[] emergencyKeywords = {
            "chest pain", "heart attack", "stroke", "cannot breathe",
            "severe bleeding", "unconscious", "seizure", "suicide", "overdose"
        };
        for (String kw : emergencyKeywords) {
            if (lowerMsg.contains(kw)) {
                return "🚨 **EMERGENCY WARNING** 🚨\n\n"
                        + "Based on what you described, this could be a medical emergency. "
                        + "Please take immediate action:\n\n"
                        + "- **Call 108 (Ambulance)** or **112 (Emergency)** immediately\n"
                        + "- Go to the nearest hospital emergency room\n"
                        + "- Do NOT drive yourself if you have chest pain or breathing difficulty\n\n"
                        + "⚠️ *This is not a medical diagnosis. Please seek emergency medical help immediately.*";
            }
        }

        if (lowerMsg.contains("headache") || lowerMsg.contains("migraine")) {
            return "🩺 **Headache Analysis**\n\n"
                    + "**Possible Causes:** Stress, dehydration, eye strain, lack of sleep, sinus issues.\n\n"
                    + "**Home Remedies:** Drink water, rest in a dark room, cold compress, gentle massage.\n\n"
                    + "**Safe OTC:** Paracetamol (Crocin/Dolo 650) if moderate pain.\n\n"
                    + "**When to See Doctor:** Headache >72 hrs, sudden severe headache, with stiff neck/fever.\n\n"
                    + "⚠️ *This is not a medical diagnosis. Please consult a doctor.*";
        }

        if (lowerMsg.contains("fever") || lowerMsg.contains("temperature") || lowerMsg.contains("bukhar")) {
            return "🌡️ **Fever Analysis**\n\n"
                    + "**Possible Causes:** Viral/bacterial infection, seasonal flu, dengue, UTI, COVID-19.\n\n"
                    + "**Home Remedies:** Rest, fluids (ORS, coconut water), lukewarm sponge bath, light clothing.\n\n"
                    + "**Safe OTC:** Paracetamol (Dolo 650) every 6 hours.\n\n"
                    + "**When to See Doctor:** Fever >103°F, lasting >3 days, severe body pain, breathing difficulty.\n\n"
                    + "⚠️ *This is not a medical diagnosis. Please consult a doctor.*";
        }

        if (lowerMsg.contains("cold") || lowerMsg.contains("cough") || lowerMsg.contains("khansi")) {
            return "🤧 **Cold & Cough Analysis**\n\n"
                    + "**Possible Causes:** Common cold, seasonal allergies, sinusitis.\n\n"
                    + "**Home Remedies:** Steam inhalation, salt water gargle, honey+ginger+tulsi tea, turmeric milk.\n\n"
                    + "**Safe OTC:** Cetirizine for allergies, dextromethorphan cough syrup.\n\n"
                    + "**When to See Doctor:** Cough >2 weeks, green mucus with fever, blood in sputum.\n\n"
                    + "⚠️ *This is not a medical diagnosis. Please consult a doctor.*";
        }

        return "👋 **Thanks for sharing!**\n\n"
                + "Based on what you've described, I recommend:\n\n"
                + "• Rest and stay hydrated (8-10 glasses of water)\n"
                + "• Monitor your symptoms\n"
                + "• Eat light, nutritious meals\n\n"
                + "If symptoms persist beyond 3 days or worsen, please see a doctor.\n\n"
                + "Could you share more specific details about what you're experiencing?\n\n"
                + "⚠️ *This is not a medical diagnosis. Please consult a doctor.*";
    }
}
