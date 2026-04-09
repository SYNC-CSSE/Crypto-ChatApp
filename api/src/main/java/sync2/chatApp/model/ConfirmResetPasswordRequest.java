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
public class ConfirmResetPasswordRequest {
	@NotBlank
	private String verificationId;

	@NotBlank
	@Size(min = 8)
	private String newPassword;
}
