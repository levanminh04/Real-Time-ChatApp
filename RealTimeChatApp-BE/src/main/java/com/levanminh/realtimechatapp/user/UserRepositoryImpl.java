package com.levanminh.realtimechatapp.user;

import java.util.List;

public class UserRepositoryImpl implements UserRepositoryCustom{
    @Override
    public List<User> searchUsersByKeywordExceptSelf(String keyword) {
        StringBuilder sb = new StringBuilder("SELECT * FROM user WHERE 1 == 1");
        return List.of();
    }
}
