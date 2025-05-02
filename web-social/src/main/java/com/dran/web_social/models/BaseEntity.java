package com.dran.web_social.models;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.RequiredArgsConstructor;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@SuperBuilder
@RequiredArgsConstructor
@Getter
public abstract class BaseEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "create_at")
    @CreationTimestamp
    private Date createAt;

    @Column(name = "update_at")
    @UpdateTimestamp
    private Date updateAt;
}
