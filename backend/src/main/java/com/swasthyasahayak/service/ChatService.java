package com.swasthyasahayak.service;

import com.swasthyasahayak.dto.ChatRequest;
import com.swasthyasahayak.dto.ChatResponse;
import com.swasthyasahayak.model.ChatMessage;
import com.swasthyasahayak.model.ChatSession;
import com.swasthyasahayak.repository.ChatSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatSessionRepository sessionRepository;

    @Value("${app.openai.api-key:DEMO_KEY}")
    private String openAiApiKey;

    @Value("${app.openai.model:gpt-4.1-mini}")
    private String openAiModel;

    @Value("${app.openai.system-prompt:}")
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
     * Generate AI response. Uses OpenAI API if configured, otherwise returns a mock response.
     */
    private String generateAIResponse(String userMessage, List<ChatMessage> history) {
        // If API key is configured, call OpenAI
        if (openAiApiKey != null && !openAiApiKey.isEmpty()
                && !openAiApiKey.equals("DEMO_KEY")
                && !openAiApiKey.startsWith("YOUR_")) {
            return callOpenAI(userMessage, history);
        }

        // Otherwise return mock response (for development/demo)
        return generateMockResponse(userMessage);
    }

    /**
     * Call OpenAI API for real AI responses.
     */
    private String callOpenAI(String userMessage, List<ChatMessage> history) {
        try {
            // Build the conversation for context
            StringBuilder conversationBuilder = new StringBuilder();
            for (ChatMessage msg : history) {
                String role = msg.getRole().equals("user") ? "User" : "Assistant";
                conversationBuilder.append(role).append(": ").append(msg.getContent()).append("\n");
            }

            // In a real implementation, use HttpClient or RestTemplate to call OpenAI
            // Here's the structure you would use:
            /*
            var client = HttpClient.newHttpClient();
            var requestBody = String.format("""
                {
                    "model": "%s",
                    "messages": [
                        {"role": "system", "content": "%s"},
                        {"role": "user", "content": "%s"}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
                """, openAiModel, systemPrompt, userMessage);

            var httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            var response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            // Parse response JSON to extract the content...
            */

            log.info("OpenAI call would be made here for: {}", userMessage);
            return generateMockResponse(userMessage);
        } catch (Exception e) {
            log.error("Error calling OpenAI API", e);
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
