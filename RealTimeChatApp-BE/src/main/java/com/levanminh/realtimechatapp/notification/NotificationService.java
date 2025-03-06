package com.levanminh.realtimechatapp.notification;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessage(String userId, Notification notification) {
        log.info("Sending WS notification to {} with payload {}", userId, notification);
        messagingTemplate.convertAndSendToUser(userId, "/chat", notification);
    }

}
