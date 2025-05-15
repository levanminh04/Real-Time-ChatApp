package com.levanminh.realtimechatapp.user;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class UserRepositoryImpl implements UserRepositoryCustom{


    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<User> searchUsersByKeywordExceptSelf(String keyword, String UserId) {
        keyword = keyword.trim().replaceAll("\\s+", " ").toLowerCase();
        List<User> result = new ArrayList<>();

        StringBuilder sql = new StringBuilder("SELECT * FROM users u WHERE LOWER(CONCAT(u.first_name, ' ', u.last_name)) = :keyword AND u.id != :UserId ");
        Query query = entityManager.createNativeQuery(sql.toString(), User.class);
        query.setParameter("keyword", keyword);
        query.setParameter("UserId", UserId);
        List<User> res1 = query.getResultList();

        result.addAll(res1);

        String[] words = keyword.toLowerCase().split(" ");

        sql = new StringBuilder("SELECT * FROM users u WHERE LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE CONCAT('%', :pattern, '%') AND u.id != :UserId");

        Set<User> userList = new LinkedHashSet<>(); // sử dụng list để loại bỏ các user trùng lặp, nhưng phải implements equals() và hashCode(). mới so sánh được với kiểu object
        for(String word: words){
            Query query1 = entityManager.createNativeQuery(sql.toString(), User.class);
            query1.setParameter("pattern", word);
            query1.setParameter("UserId", UserId);
            userList.addAll(query1.getResultList());
        }

        userList.removeAll(res1);
        result.addAll(userList);

        return result;
    }
}
