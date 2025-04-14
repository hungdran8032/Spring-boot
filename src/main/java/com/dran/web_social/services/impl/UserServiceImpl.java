package com.dran.web_social.services.impl;

import com.dran.web_social.dto.request.UpdateUserRequest;
import com.dran.web_social.dto.response.UserResponse;
import com.dran.web_social.mappers.UserMapper;
import com.dran.web_social.models.User;
import com.dran.web_social.repositories.UserRepository;
import com.dran.web_social.services.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
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
    public UserResponse updateUser(UpdateUserRequest req) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateUser'");
    }

}
