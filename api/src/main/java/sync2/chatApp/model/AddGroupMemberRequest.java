package sync2.chatApp.model;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AddGroupMemberRequest {
	@NotEmpty(message = "Cannot be null")
	private List<UUID> userIds;
}
