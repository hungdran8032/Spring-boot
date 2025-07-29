package com.dran.web_social.services.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.dran.web_social.services.CloudService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudServiceImpl implements CloudService {
    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadFile(MultipartFile file) {
        try {
            String resourceType = "auto";
            String contentType = file.getContentType();

            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    resourceType = "image";
                } else if (contentType.startsWith("video/")) {
                    resourceType = "video";
                } else {
                    resourceType = "raw";
                }
            }

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("resource_type", resourceType));

            return Map.of(
                    "url", result.get("secure_url").toString(),
                    "public_id", result.get("public_id").toString());
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi upload file lên Cloudinary", e);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", "image"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
