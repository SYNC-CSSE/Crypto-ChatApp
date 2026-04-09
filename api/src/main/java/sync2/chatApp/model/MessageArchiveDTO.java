package sync2.chatApp.model;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageArchiveDTO {
	private UUID id;
	private String sender;
	private String content;
	private String iv;
	private String type;
	private String timestamp;
}