package com.dran.web_social.services;

import java.io.IOException;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

public interface CloudService {
    Map<String, String> uploadFile(MultipartFile file) throws IOException;

    void deleteFile(String publicId);
}
