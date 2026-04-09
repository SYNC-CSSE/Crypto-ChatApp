package sync2.chatApp.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "chat_id")
	private Chat chat;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sender_id")
	private User sender;

	@Column(columnDefinition = "TEXT")
	private String content;

	private String iv;

	private String type;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

//    
	@Column(length = 20, nullable = false, columnDefinition = "varchar(20) default 'PENDING'")
	private String status = "PENDING";

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bundle_id")
	private MessageBundle bundle;

	@Column(name = "message_hash")
	private String messageHash;
}