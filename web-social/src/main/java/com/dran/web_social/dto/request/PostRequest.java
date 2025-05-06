package com.dran.web_social.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostRequest {
    @Size(min = 1, max = 5000, message = "Nội dung bài viết phải từ 1 đến 5000 ký tự")
    private String content;
}
