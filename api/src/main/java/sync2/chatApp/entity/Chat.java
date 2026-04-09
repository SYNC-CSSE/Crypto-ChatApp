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
@Table(name = "chats")
public class Chat {
	@Id
	private UUID id;
	
	@Column(length = 10, updatable = false)
	private String type;
	public void setType(String type) {
		if(type == null || (!type.equals("PRIVATE") && !type.equals("GROUP"))) {
			throw new IllegalArgumentException("Type PRIVATE or GROUP!");
		}
		this.type = type;
	}
	
	private String name;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "created_by")
	private User createdBy;
	
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
}
