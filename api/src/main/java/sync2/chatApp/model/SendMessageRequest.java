package sync2.chatApp.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class SendMessageRequest {
	@NotBlank
	private String content;
	private String iv;
	private String type = "TEXT";
}
