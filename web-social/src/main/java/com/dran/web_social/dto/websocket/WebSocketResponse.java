package com.dran.web_social.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketResponse<T> {
    private String type;
    private T data;
    private String message;
    private boolean success;
}