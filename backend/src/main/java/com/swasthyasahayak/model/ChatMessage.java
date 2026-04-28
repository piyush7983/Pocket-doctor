package com.swasthyasahayak.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Embedded document representing a single chat message.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private String id;
    private String role;       // "user" or "assistant"
    private String content;
    private Instant timestamp;
}
