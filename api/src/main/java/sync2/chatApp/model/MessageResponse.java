package sync2.chatApp.model;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
	private UUID id;
	private String sender;
	private String content;
	private String iv;
	private String type;
	private String time;

	private String status;
	private Long bundleId;
	private String ipfsCid;
	private String transactionHash;
}