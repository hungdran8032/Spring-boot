package com.dran.web_social.services.impl;

import com.dran.web_social.dto.request.UpdateUserRequest;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.mappers.UserMapper;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.UserService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có id: " + id));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getUserByUserName(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có tài khoản: " + userName));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));
        return userMapper.userToUserResponse(user);
    }

    @Override
    public void checkUserNameExists(String userName) {
        if (userRepository.existsByUserName(userName)) {
            throw new RuntimeException("Người dùng này đã có rồi!");
        }
    }

    @Override
    public void checkEmailExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email này đã được đăng ký có rồi!");
        }
    }

    @Override
    @Transactional
    public UserResponse updateUser(UpdateUserRequest req) {
        // Get current user
        User user = userRepository.findByUserName(req.getUserName())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy người dùng có tài khoản: " + req.getUserName()));

        // Update user information
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            // Check if email is already used by another user
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new RuntimeException("Email này đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(req.getEmail());
        }

        if (req.getFirstName() != null) {
            user.setFirstName(req.getFirstName());
        }

        if (req.getLastName() != null) {
            user.setLastName(req.getLastName());
        }

        if (req.getPhone() != null) {
            user.setPhone(req.getPhone());
        }

        if (req.getAddress() != null) {
            user.setAddress(req.getAddress());
        }

        if (req.getAvatar() != null) {
            user.setAvatar(req.getAvatar());
        }

        if (req.getGender() != null) {
            user.setGender(req.getGender());
        }

        if (req.getBirthDay() != null) {
            try {
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date birthDay = dateFormat.parse(req.getBirthDay());
                user.setBirthDay(birthDay);
            } catch (ParseException e) {
                throw new RuntimeException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd");
            }
        }

        // Save updated user
        User updatedUser = userRepository.save(user);
        log.info("User profile updated successfully: {}", updatedUser.getUsername());

        return userMapper.userToUserResponse(updatedUser);
    }

}
