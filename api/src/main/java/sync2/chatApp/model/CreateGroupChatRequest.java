package sync2.chatApp.model;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CreateGroupChatRequest {
	@NotBlank
	@Size(max = 100)
	private String name;
	
	@NotEmpty(message = "Choose at least 1 member")
	private List<UUID> memberIds;
}
