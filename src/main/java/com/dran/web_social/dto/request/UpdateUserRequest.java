package com.dran.web_social.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Update user request")
public class UpdateUserRequest {

    @NotBlank(message = "Tên người dùng không được để trống")
    @Schema(description = "Username", example = "johndoe", required = true)
    private String userName;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String firstName;

    private String lastName;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String phone;

    private String address;

    private String avatar;

    private String gender;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Ngày sinh phải có định dạng yyyy-MM-dd")
    private String birthDay;
}
