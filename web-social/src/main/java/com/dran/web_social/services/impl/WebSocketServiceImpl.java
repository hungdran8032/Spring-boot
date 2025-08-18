package com.dran.web_social.services.impl;

import com.dran.web_social.dto.response.CommentResponse;
import com.dran.web_social.dto.websocket.CommentMessage;
import com.dran.web_social.dto.websocket.WebSocketResponse;
import com.dran.web_social.services.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketServiceImpl implements WebSocketService {

        private final SimpMessagingTemplate messagingTemplate;

        @Override
        public void notifyCommentCreated(Long postId, CommentResponse comment, String username) {

                CommentMessage message = CommentMessage.builder()
                                .type("CREATE")
                                .postId(postId)
                                .comment(comment)
                                .username(username)
                                .build();

                WebSocketResponse<CommentMessage> response = WebSocketResponse.<CommentMessage>builder()
                                .type("COMMENT_CREATED")
                                .data(message)
                                .success(true)
                                .message("Comment created successfully")
                                .build();

                String destination = "/topic/post/" + postId + "/comments";
                messagingTemplate.convertAndSend(destination, response);
        }

        @Override
        public void notifyCommentUpdated(Long postId, CommentResponse comment, String username) {
                CommentMessage message = CommentMessage.builder()
                                .type("UPDATE")
                                .postId(postId)
                                .comment(comment)
                                .username(username)
                                .build();

                WebSocketResponse<CommentMessage> response = WebSocketResponse.<CommentMessage>builder()
                                .type("COMMENT_UPDATED")
                                .data(message)
                                .success(true)
                                .message("Comment updated successfully")
                                .build();

                messagingTemplate.convertAndSend("/topic/post/" + postId + "/comments", response);
        }

        @Override
        public void notifyCommentDeleted(Long postId, Long commentId, String username) {
                CommentMessage message = CommentMessage.builder()
                                .type("DELETE")
                                .postId(postId)
                                .username(username)
                                .build();

                WebSocketResponse<CommentMessage> response = WebSocketResponse.<CommentMessage>builder()
                                .type("COMMENT_DELETED")
                                .data(message)
                                .success(true)
                                .message("Comment deleted successfully")
                                .build();

                messagingTemplate.convertAndSend("/topic/post/" + postId + "/comments", response);
        }
}