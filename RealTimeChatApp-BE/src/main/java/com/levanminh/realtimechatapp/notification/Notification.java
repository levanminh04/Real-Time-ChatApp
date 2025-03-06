package com.levanminh.realtimechatapp.notification;

import com.levanminh.realtimechatapp.message.MessageType;
import lombok.*;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Notification {
    private String chatId;
    private String content;
    private String senderId;
    private String recipientId;
    private String chatName;
    private MessageType messageType;
    private NotificationType notificationType;
    private byte[] media;
}
