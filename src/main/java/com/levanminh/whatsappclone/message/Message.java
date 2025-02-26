package com.levanminh.whatsappclone.message;

import com.levanminh.whatsappclone.chat.Chat;
import com.levanminh.whatsappclone.common.BaseAuditingEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.awt.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message extends BaseAuditingEntity {
    @Id
    @SequenceGenerator(name = "msg_seq", sequenceName = "msg_seq", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "msg_seq")
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    private MessageState state;

    @ManyToOne
    @JoinColumn(name="chat_id")
    private Chat chat;

    @Column(name="sender_id", nullable=false)
    private String sender_id;

    @Column(name="receiver_id", nullable=false)
    private String receiverId;

    private String mediaFilePath;

}
