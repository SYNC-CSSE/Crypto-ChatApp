package sync2.chatApp.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.AllArgsConstructor;
import sync2.chatApp.model.ConfirmResetPasswordRequest;
import sync2.chatApp.entity.User;
import sync2.chatApp.model.LoginUserRequest;
import sync2.chatApp.model.RequestResetPasswordCodeByCredentialRequest;
import sync2.chatApp.model.RegisterUserRequest;
import sync2.chatApp.model.ResetPasswordChallengeResponse;
import sync2.chatApp.model.UpdateUserRequest;
import sync2.chatApp.model.UserSearchResponse;
import sync2.chatApp.model.VerifyResetPasswordRequest;
import sync2.chatApp.repository.UserRepository;
import sync2.chatApp.security.JwtUtil;

@Service
@AllArgsConstructor
public class UserService {
	private UserRepository userRepository;
	private Validator validator;
	private BCryptPasswordEncoder passwordEncoder;
	private JwtUtil jwtUtil;
	private final Map<String, ResetPasswordSession> resetPasswordSessions = new ConcurrentHashMap<>();
	private final SecureRandom secureRandom = new SecureRandom();
	private static final long RESET_CODE_TTL_MILLIS = 10 * 60 * 1000;
	private static final int MAX_VERIFY_ATTEMPTS = 5;

	private static class ResetPasswordSession {
		private UUID userId;
		private String code;
		private long expiresAt;
		private int attempts;
		private boolean verified;
	}

	public void register(RegisterUserRequest request) {
		Set<ConstraintViolation<RegisterUserRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty())
			throw new ConstraintViolationException(constraintViolations);

		if (userRepository.existsByUsername(request.getUsername()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already registered database");

		if (userRepository.existsByEmail(request.getEmail()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered in database");

		User user = new User();
		user.setUsername(request.getUsername());
		user.setEmail(request.getEmail());

		String hashedPassword = passwordEncoder.encode(request.getPassword());
		user.setPasswordHash(hashedPassword);

		userRepository.save(user);
	}

	public String login(LoginUserRequest request) {
		Set<ConstraintViolation<LoginUserRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty())
			throw new ConstraintViolationException(constraintViolations);

		User user = userRepository.findByUsername(request.getUsername()).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");

		return jwtUtil.generateToken(user);
	}

	@Transactional
	public ResetPasswordChallengeResponse requestResetPasswordCodeByCredential(RequestResetPasswordCodeByCredentialRequest request) {
		Set<ConstraintViolation<RequestResetPasswordCodeByCredentialRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty()) {
			throw new ConstraintViolationException(constraintViolations);
		}

		clearExpiredResetSessions();

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email or password");
		}

		String verificationId = UUID.randomUUID().toString();
		String verificationCode = String.format("%06d", secureRandom.nextInt(1_000_000));
		long expiresAt = System.currentTimeMillis() + RESET_CODE_TTL_MILLIS;

		ResetPasswordSession session = new ResetPasswordSession();
		session.userId = user.getId();
		session.code = verificationCode;
		session.expiresAt = expiresAt;
		session.attempts = 0;
		session.verified = false;

		resetPasswordSessions.put(verificationId, session);

		System.out.println("Password reset verification code for user " + user.getUsername() + ": " + verificationCode);

		return ResetPasswordChallengeResponse.builder().verificationId(verificationId).expiresInSeconds(RESET_CODE_TTL_MILLIS / 1000)
				.debugVerificationCode(verificationCode).build();
	}

	@Transactional
	public void verifyResetPassword(VerifyResetPasswordRequest request) {
		Set<ConstraintViolation<VerifyResetPasswordRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty()) {
			throw new ConstraintViolationException(constraintViolations);
		}

		ResetPasswordSession session = resetPasswordSessions.get(request.getVerificationId());
		if (session == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification session is invalid or expired");
		}

		if (session.expiresAt < System.currentTimeMillis()) {
			resetPasswordSessions.remove(request.getVerificationId());
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code expired");
		}

		session.attempts += 1;
		if (session.attempts > MAX_VERIFY_ATTEMPTS) {
			resetPasswordSessions.remove(request.getVerificationId());
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many verification attempts");
		}

		if (!session.code.equals(request.getVerificationCode())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
		}

		session.verified = true;
	}

	@Transactional
	public void confirmResetPassword(ConfirmResetPasswordRequest request) {
		Set<ConstraintViolation<ConfirmResetPasswordRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty()) {
			throw new ConstraintViolationException(constraintViolations);
		}

		ResetPasswordSession session = resetPasswordSessions.get(request.getVerificationId());
		if (session == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification session is invalid or expired");
		}

		if (session.expiresAt < System.currentTimeMillis()) {
			resetPasswordSessions.remove(request.getVerificationId());
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code expired");
		}

		if (!session.verified) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code not confirmed yet");
		}

		User user = userRepository.findById(session.userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
		resetPasswordSessions.remove(request.getVerificationId());
	}

	private void clearExpiredResetSessions() {
		long now = System.currentTimeMillis();
		resetPasswordSessions.entrySet().removeIf(entry -> entry.getValue().expiresAt < now);
	}

	public List<UserSearchResponse> searchByUsername(String username) {
		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		if (username == null || username.trim().isEmpty()) {
			return List.of();
		}

		String keyword = username.trim();

		return userRepository.findTop20ByUsernameContainingIgnoreCaseOrderByUsernameAsc(keyword).stream()
				.filter(user -> !user.getId().equals(currentUser.getId()))
				.map(user -> UserSearchResponse.builder().id(user.getId()).username(user.getUsername())
						.email(user.getEmail()).build())
				.collect(Collectors.toList());
	}

	@Transactional
	public void update(UpdateUserRequest request) {
		Set<ConstraintViolation<UpdateUserRequest>> constraintViolations = validator.validate(request);
		if (!constraintViolations.isEmpty())
			throw new ConstraintViolationException(constraintViolations);

		User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
	        if (request.getPrevPassword() == null || request.getPrevPassword().isBlank()) {
	            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
	                "Previous password is required to change password");
	        }

	        if (!passwordEncoder.matches(request.getPrevPassword(), user.getPasswordHash())) {
	            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Previous password does not match");
	        }

	        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
	    }

	    if (request.getUsername() != null && !request.getUsername().isBlank()) {
	        if (!request.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
	            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already taken");
	        }
	        user.setUsername(request.getUsername());
	    }

	    if (request.getEmail() != null && !request.getEmail().isBlank()) {
	        user.setEmail(request.getEmail());
	    }
	    
	    userRepository.save(user);
	}
}
