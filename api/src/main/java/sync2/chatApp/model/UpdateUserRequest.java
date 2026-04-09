package sync2.chatApp.model;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UpdateUserRequest {
	@Size(max = 50)
	private String username;
	
	@Size(max = 100)
	private String email;
	
	private String prevPassword;
	
	private String newPassword;
}
