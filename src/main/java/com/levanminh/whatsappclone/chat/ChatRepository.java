package com.levanminh.whatsappclone.chat;

import com.levanminh.whatsappclone.user.UserConstants;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends CrudRepository<Chat, String> {

    @Query(name = ChatConstants.FIND_ALL_CHATS_BY_USERID)
    List<Chat> findAllChatsByUser(@Param("userId") String userId);

    @Query(name = ChatConstants.FIND_CHAT_BETWEEN_TWO_USERS)
    Optional<Chat> findChatBetweenTwoUsers(@Param("userId") String senderId,@Param("otherUserId") String receiverId);
}
