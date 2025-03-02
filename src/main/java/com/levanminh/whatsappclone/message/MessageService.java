package com.levanminh.whatsappclone.message;

import com.levanminh.whatsappclone.chat.Chat;
import com.levanminh.whatsappclone.chat.ChatRepository;
import com.levanminh.whatsappclone.chat.ChatService;
import com.levanminh.whatsappclone.file.FileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    private final ChatRepository chatRepository;

    private MessageConverter messageConverter;

    private FileService fileService;

    public void saveMessage(MessageRequest messageRequest) {
        Chat chat = chatRepository.findChatBetweenTwoUsers(messageRequest.getSenderId(), messageRequest.getReceiverId())
            .orElseThrow(() -> new EntityNotFoundException("Chat not found"));
        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(messageRequest.getSenderId());
        message.setReceiverId(messageRequest.getReceiverId());
        message.setType(messageRequest.getMessageType());
        message.setState(MessageState.SENT);
        message.setContent(messageRequest.getContent());
        messageRepository.save(message);

    }

    public List<MessageResponse> getAllMessagesByChatId(String ChatId){
        return messageRepository.findMessagesByChatId(ChatId)
                .stream()
                .map(message -> messageConverter.toMessageResponse(message))
                .toList();
    }

    public void setMessageStateToSeen(String ChatId, Authentication authentication){

        Chat chat = chatRepository.findById(ChatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));
        final String PartnerId = getChatPartnerId(chat, authentication);

        messageRepository.setMessageStateToSeenByChatId(ChatId, MessageState.SEEN);
    }

    public void uploadMediaMessage(String chatId, MultipartFile file, Authentication authentication){
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        String partnerId = getChatPartnerId(chat, authentication);
        String currentUserId = getCurrentUserId(chat, authentication);

        final String filePath = fileService.saveFile(file, currentUserId);

        Message message = new Message();
        message.setChat(chat);
        message.setSenderId(currentUserId); // người dùng đang đăng nhập là sender
        message.setReceiverId(partnerId);
        message.setType(MessageType.IMAGE);
        message.setMediaFilePath(filePath);
        message.setState(MessageState.SENT);
        messageRepository.save(message);

    }

    public String getChatPartnerId(Chat chat, Authentication authentication){ // lấy id của đối phương
        if(chat.getSender().getId().equals(authentication.getName())){
            return chat.getRecipient().getId();
        }
        return chat.getSender().getId();
    }

    public String getCurrentUserId(Chat chat, Authentication authentication){ // lấy id bản thân, thật ra có thể sử dug trực tiếp authentication.getName() luoon nhưng tạo thêm cái method cho nó rõ nghĩa
        if(chat.getSender().getId().equals(authentication.getName())){
            return chat.getSender().getId();
        }
        return chat.getRecipient().getId();
    }

}

