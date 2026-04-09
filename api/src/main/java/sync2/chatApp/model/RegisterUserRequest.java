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
public class RegisterUserRequest {
	@NotBlank
	@Size(max = 50)
	private String username;
	
	@NotBlank
	@Size(max = 100)
	private String email;
	
	
	@NotBlank
	private String password;
}
