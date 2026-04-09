package sync2.chatApp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import sync2.chatApp.model.ConfirmResetPasswordRequest;
import sync2.chatApp.model.LoginUserRequest;
import sync2.chatApp.model.RequestResetPasswordCodeByCredentialRequest;
import sync2.chatApp.model.RegisterUserRequest;
import sync2.chatApp.model.ResetPasswordChallengeResponse;
import sync2.chatApp.model.UpdateUserRequest;
import sync2.chatApp.model.UserSearchResponse;
import sync2.chatApp.model.VerifyResetPasswordRequest;
import sync2.chatApp.model.WebResponse;
import sync2.chatApp.service.UserService;

@RestController
@AllArgsConstructor
public class UserController {
	private UserService userService;
	
	@PostMapping(path = "/auth/register")
	public WebResponse<String> register(@RequestBody RegisterUserRequest request){
		userService.register(request);
		return WebResponse.<String>builder().data("User registered successfully").build();
	}
	
	@PostMapping(path = "/auth/login")
	private WebResponse<String> login(@RequestBody LoginUserRequest request){
		String token = userService.login(request);
		return WebResponse.<String>builder().data(token).build();
	}

	@PostMapping(path = "/auth/reset-password/request")
	public WebResponse<ResetPasswordChallengeResponse> requestResetPasswordCode(@RequestBody RequestResetPasswordCodeByCredentialRequest request){
		ResetPasswordChallengeResponse response = userService.requestResetPasswordCodeByCredential(request);
		return WebResponse.<ResetPasswordChallengeResponse>builder().data(response).build();
	}

	@PostMapping(path = "/auth/reset-password/verify")
	public WebResponse<String> verifyResetPassword(@RequestBody VerifyResetPasswordRequest request){
		userService.verifyResetPassword(request);
		return WebResponse.<String>builder().data("Verification code valid").build();
	}

	@PostMapping(path = "/auth/reset-password/confirm")
	public WebResponse<String> confirmResetPassword(@RequestBody ConfirmResetPasswordRequest request){
		userService.confirmResetPassword(request);
		return WebResponse.<String>builder().data("Password reset successfully").build();
	}

	@GetMapping(path = "/api/users/search")
	public WebResponse<List<UserSearchResponse>> searchUsers(@RequestParam(name = "username") String username) {
		List<UserSearchResponse> response = userService.searchByUsername(username);
		return WebResponse.<List<UserSearchResponse>>builder().data(response).build();
	}
	
	@PatchMapping(path = "/user/update")
	private WebResponse<String> update(@RequestBody UpdateUserRequest request){
		userService.update(request);
		return WebResponse.<String>builder().data("User updated successfully").build();
	}
}
