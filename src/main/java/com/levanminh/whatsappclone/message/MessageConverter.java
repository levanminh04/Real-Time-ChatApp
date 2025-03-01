package com.levanminh.whatsappclone.message;

import java.time.LocalDateTime;
import java.util.List;

public class MessageConverter {
    public MessageResponse toMessageResponse(Message messages) {
        return MessageResponse.builder()
                .state(messages.getState())
                .type(messages.getType())
                .id(messages.getId())
                .senderId(messages.getSenderId())
                .content(messages.getContent())
                .createdAt(LocalDateTime.now())
                .receiverId(messages.getReceiverId())
                //.media()
                .build();
    }
}
