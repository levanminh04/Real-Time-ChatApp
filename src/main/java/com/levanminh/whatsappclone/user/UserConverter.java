package com.levanminh.whatsappclone.user;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class UserConverter {
    public User fromTokenAttributes(Map<String, Object> attributes) {
        User user = new User();
        if(attributes.containsKey("sub")){
            user.setId(attributes.get("sub").toString());
        }

        if(attributes.containsKey("given_name")){
            user.setFirstName(attributes.get("given_name").toString());
        }
        else if(attributes.containsKey("nickname")){
            user.setFirstName(attributes.get("nickname").toString());
        }

        if(attributes.containsKey("family_name")){
            user.setLastName(attributes.get("family_name").toString());
        }
        if(attributes.containsKey("email")){
            user.setEmail(attributes.get("email").toString());
        }

        user.setLastSeen(LocalDateTime.now());         // mỗi lần user gửi request, cập nhật lastSeen để biết trạng thái online của user, tuy nhiên có hạn chế là Nếu người dùng mở ứng dụng mà không gửi request nào thì lastSeen sẽ không được cập nhật.
        return user;
    }

}
