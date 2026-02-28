package com.dran.web_social.models;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import com.dran.web_social.utils.FriendshipStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "friendships")
@IdClass(FriendShip.FriendShipId.class)
public class FriendShip {

    @Id
    @Column(name = "requester_id")
    private Long requesterId;

    @Id
    @Column(name = "addressee_id")
    private Long addresseeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", insertable = false, updatable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addressee_id", insertable = false, updatable = false)
    private User addressee;

    @Column(name = "create_at")
    @CreationTimestamp
    private Date createAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FriendshipStatus status;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendShipId implements Serializable {
        private Long requesterId;
        private Long addresseeId;
    }
}
