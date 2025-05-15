package com.levanminh.realtimechatapp.cloudinary;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public Map uploadImage(MultipartFile multipartFile) throws IOException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IllegalArgumentException("No file provided");
        }
        if (!multipartFile.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        try{
            Map uploadParams = ObjectUtils.asMap(
                    "timestamp", System.currentTimeMillis() / 1000
            );
            Map result = cloudinary.uploader().upload(multipartFile.getBytes(), uploadParams);
            return result;
        }
        catch (IOException e){
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }
}
