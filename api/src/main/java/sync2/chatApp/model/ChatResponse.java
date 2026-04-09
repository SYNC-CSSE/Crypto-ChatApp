package sync2.chatApp.model;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ChatResponse {
	private UUID id;
	private String type;
	private String name;
	private LocalDateTime createdAt;
}
