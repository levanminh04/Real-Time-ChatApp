package com.levanminh.realtimechatapp.user;

import java.util.List;

public interface UserRepositoryCustom {
    List<User> searchUsersByKeywordExceptSelf(String keyword, String UserId);
}
