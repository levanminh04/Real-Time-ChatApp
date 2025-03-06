package com.levanminh.realtimechatapp.chat;


import com.levanminh.realtimechatapp.common.StringResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
@Tag(name = "Chat")
@SecurityRequirement(name = "keycloak")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<StringResponse> createChat(@RequestParam(name = "sender-id") String senderId,
                                                     @RequestParam(name = "receiver-id") String receiverId) {
        final String ChatId = chatService.getChat(senderId, receiverId);
        StringResponse response = StringResponse.builder()
                                    .response(ChatId)
                                    .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getAllChats(Authentication authentication) {
           return ResponseEntity.ok(chatService.getChatsByReceiverId(authentication));
    }
}
