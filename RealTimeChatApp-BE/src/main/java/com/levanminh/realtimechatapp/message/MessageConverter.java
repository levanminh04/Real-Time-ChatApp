package com.levanminh.realtimechatapp.message;

import com.levanminh.realtimechatapp.file.FileUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MessageConverter {
    public MessageResponse toMessageResponse(Message messages) {
        return MessageResponse.builder()
                .state(messages.getState())
                .type(messages.getType())
                .id(messages.getId())
                .senderId(messages.getSenderId())
                .content(messages.getContent())
                .createdAt(messages.getCreatedDate())
                .receiverId(messages.getReceiverId())
                .media(FileUtils.readFileFromLocation(messages.getMediaFilePath()))
                .build();
    }
}
