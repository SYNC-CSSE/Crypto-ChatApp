package sync2.chatApp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ResetPasswordChallengeResponse {
	private String verificationId;
	private long expiresInSeconds;
	private String debugVerificationCode;
}
