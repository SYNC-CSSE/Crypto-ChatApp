package sync2.chatApp.model;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoginUserRequest {
	@Size(max = 50)
	@NotBlank
	private String username;
	
	@NotBlank
	private String password;
}
