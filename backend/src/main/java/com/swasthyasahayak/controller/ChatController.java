package com.swasthyasahayak.controller;

import com.swasthyasahayak.dto.ChatRequest;
import com.swasthyasahayak.dto.ChatResponse;
import com.swasthyasahayak.model.ChatSession;
import com.swasthyasahayak.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * POST /api/chat — Send a message and get AI response.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        String userId = authentication.getPrincipal().toString();
        ChatResponse response = chatService.processMessage(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/history — Get all chat sessions for the authenticated user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatSession>> getHistory(Authentication authentication) {
        String userId = authentication.getPrincipal().toString();
        List<ChatSession> sessions = chatService.getUserHistory(userId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * GET /api/history/{sessionId} — Get a single chat session.
     */
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ChatSession> getSession(@PathVariable String sessionId) {
        ChatSession session = chatService.getSession(sessionId);
        return ResponseEntity.ok(session);
    }

    /**
     * DELETE /api/history/{sessionId} — Delete a chat session.
     */
    @DeleteMapping("/history/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId) {
        chatService.deleteSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
    }

    /**
     * Global exception handler.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }
}
