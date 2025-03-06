package com.levanminh.realtimechatapp.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatResponse {
    private String id;
    private String chatName ;
    private long unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean isRecipientOnline; // recipient là đối phương trong cuộc trò chuyện, không nên để là isUserOnline
    private String senderId;
    private String recipientId;
}
