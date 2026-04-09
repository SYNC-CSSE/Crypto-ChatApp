package sync2.chatApp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.AllArgsConstructor;
import sync2.chatApp.entity.Chat;
import sync2.chatApp.entity.ChatMember;
import sync2.chatApp.entity.User;
import sync2.chatApp.model.AddGroupMemberRequest;
import sync2.chatApp.model.ChatResponse;
import sync2.chatApp.model.CreateGroupChatRequest;
import sync2.chatApp.model.CreatePrivateChatRequest;
import sync2.chatApp.model.ChatDetailResponse;
import sync2.chatApp.model.RemoveGroupMemberRequest;
import sync2.chatApp.model.UpdateGroupRequest;
import sync2.chatApp.model.UpdateMemberRoleRequest;
import sync2.chatApp.repository.ChatMemberRepository;
import sync2.chatApp.repository.ChatRepository;
import sync2.chatApp.repository.UserRepository;

@Service
@AllArgsConstructor
public class ChatService {
	private final ChatRepository chatRepository;
	private final ChatMemberRepository chatMemberRepository;
	private final UserRepository userRepository;
	private Validator validator;

	public List<ChatResponse> getUserChats(String search) {
		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		String searchParam = (search == null || search.isBlank()) ? null : search;

		List<Chat> chats = chatRepository.searchUserChats(currentUser.getId(), searchParam);

		return chats.stream().map(chat -> {
			String displayName = chat.getName();

			if ("PRIVATE".equals(chat.getType())) {
				displayName = chatMemberRepository.findRecipient(chat.getId(), currentUser.getId()).stream().findFirst()
						.map(User::getUsername).orElse("Unknown User");
			}

			return ChatResponse.builder().id(chat.getId()).type(chat.getType()).name(displayName)
					.createdAt(chat.getCreatedAt()).build();
		}).collect(Collectors.toList());
	}

	@Transactional
	public ChatResponse createPrivateChat(CreatePrivateChatRequest request) {
		Set<ConstraintViolation<CreatePrivateChatRequest>> violations = validator.validate(request);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		UUID targetId = request.getTargetUserId();

		if (currentUser.getId().equals(targetId))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot chat with yourself");

		User targetUser = userRepository.findById(targetId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

		Optional<Chat> existingChat = chatRepository.findExistingPrivateChat(currentUser.getId(), targetId);

		if (existingChat.isPresent())
			return mapToResponse(existingChat.get(), targetUser.getUsername());

		Chat chat = new Chat();
		chat.setId(UUID.randomUUID());
		chat.setType("PRIVATE");
		chat.setCreatedBy(currentUser);
		chat.setCreatedAt(LocalDateTime.now());
		chatRepository.save(chat);

		createMember(chat, currentUser, "ADMIN");
		createMember(chat, targetUser, "MEMBER");

		return mapToResponse(chat, targetUser.getUsername());

	}

	@Transactional
	public ChatResponse createGroupChat(CreateGroupChatRequest request) {
		Set<ConstraintViolation<CreateGroupChatRequest>> violations = validator.validate(request);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Chat chat = new Chat();
		chat.setId(UUID.randomUUID());
		chat.setType("GROUP");
		chat.setName(request.getName());
		chat.setCreatedBy(currentUser);
		chat.setCreatedAt(LocalDateTime.now());
		chatRepository.save(chat);

		createMember(chat, currentUser, "ADMIN");

		for (UUID memberId : request.getMemberIds()) {
			if (memberId.equals(currentUser.getId()))
				continue;
			User memberUser = userRepository.findById(memberId).orElseThrow(
					() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + memberId));
			createMember(chat, memberUser, "MEMBER");
		}

		return mapToResponse(chat, chat.getName());

	}

	private void createMember(Chat chat, User user, String role) {
		ChatMember member = new ChatMember();
		member.setId(UUID.randomUUID());
		member.setChat(chat);
		member.setUser(user);
		member.setRole(role);
		member.setJoinedAt(LocalDateTime.now());
		chatMemberRepository.save(member);
	}

	private ChatResponse mapToResponse(Chat chat, String displayName) {
		return ChatResponse.builder().id(chat.getId()).type(chat.getType()).name(displayName)
				.createdAt(chat.getCreatedAt()).build();
	}

	@Transactional
	public ChatResponse updateGroupName(UUID chatId, UpdateGroupRequest request) {
		Set<ConstraintViolation<UpdateGroupRequest>> violations = validator.validate(request);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

		if (!"GROUP".equals(chat.getType()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only group name is updateable");

		boolean isAdmin = chatMemberRepository.existsByChatIdAndUserIdAndRole(chatId, currentUser.getId(), "ADMIN");
		if (!isAdmin)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Only admin allowed to change group name");

		chat.setName(request.getName());
		chatRepository.save(chat);

		return mapToResponse(chat, chat.getName());
	}

	@Transactional
	public void addGroupMember(UUID chatId, AddGroupMemberRequest request) {
		Set<ConstraintViolation<AddGroupMemberRequest>> violations = validator.validate(request);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

		if (!"GROUP".equals(chat.getType()))
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only for group type chat");

		boolean isAdmin = chatMemberRepository.existsByChatIdAndUserIdAndRole(chatId, currentUser.getId(), "ADMIN");
		if (!isAdmin)
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Only admin allowed to add member");

		for (UUID targetUserId : request.getUserIds()) {
			if (targetUserId.equals(currentUser.getId()))
				continue;

			User targetUser = userRepository.findById(targetUserId).orElseThrow(
					() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + targetUserId));

			if (chatMemberRepository.existsByChatIdAndUserId(chatId, targetUserId))
				continue;

			createMember(chat, targetUser, "MEMBER");
		}
	}

	@Transactional
	public void removeMembers(UUID chatId, RemoveGroupMemberRequest request) {
		Set<ConstraintViolation<RemoveGroupMemberRequest>> violations = validator.validate(request);
		if (!violations.isEmpty())
			throw new ConstraintViolationException(violations);

		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

		if (!"GROUP".equals(chat.getType())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only for group type chat");
		}

		boolean isAdmin = chatMemberRepository.existsByChatIdAndUserIdAndRole(chatId, currentUser.getId(), "ADMIN");
		if (!isAdmin) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin allowed to remove member");
		}

		if (request.getUserIds().contains(currentUser.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin cannot self remove");
		}

		chatMemberRepository.deleteAllByChatIdAndUserIdIn(chatId, request.getUserIds());
	}

	@Transactional
	public void updateMemberRoles(UUID chatId, UpdateMemberRoleRequest request) {
		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

		if (!"GROUP".equals(chat.getType())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Member update only available in group type chat");
		}

		boolean isCurrentUserAdmin = chatMemberRepository.existsByChatIdAndUserIdAndRole(chatId, currentUser.getId(),
				"ADMIN");
		if (!isCurrentUserAdmin) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin allowed to change member role");
		}

		for (UpdateMemberRoleRequest.MemberRoleUpdate update : request.getUpdates()) {
			ChatMember member = chatMemberRepository.findByChatIdAndUserId(chatId, update.getUserId()).orElseThrow(
					() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found: " + update.getUserId()));

			String newRole = update.getRole().toUpperCase();
			if (!List.of("ADMIN", "MEMBER").contains(newRole)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not valid: " + newRole);
			}

			member.setRole(newRole);
			chatMemberRepository.save(member);
		}
	}

	@Transactional
	public ChatDetailResponse getChatDetail(UUID chatId) {
		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		Chat chat = chatRepository.findById(chatId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));

		boolean isMember = chatMemberRepository.existsByChatIdAndUserId(chatId, currentUser.getId());
		if (!isMember) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not member of this chat");
		}

		List<ChatMember> allMembers = chatMemberRepository.findAllByChatIdWithUser(chatId);

		List<ChatDetailResponse.MemberResponse> memberResponses;

		if ("PRIVATE".equals(chat.getType())) {
			memberResponses = allMembers.stream().filter(cm -> !cm.getUser().getId().equals(currentUser.getId()))
					.map(this::mapToMemberResponse).collect(Collectors.toList());
		} else {
			memberResponses = allMembers.stream().map(this::mapToMemberResponse).collect(Collectors.toList());
		}

		return ChatDetailResponse.builder().id(chat.getId()).type(chat.getType())
				.name(chat.getType().equals("PRIVATE") ? "Private Chat" : chat.getName())
				.createdBy(chat.getCreatedBy() != null ? chat.getCreatedBy().getUsername() : "System")
				.createdAt(chat.getCreatedAt()).members(memberResponses).build();
	}

	private ChatDetailResponse.MemberResponse mapToMemberResponse(ChatMember cm) {
		return ChatDetailResponse.MemberResponse.builder().id(cm.getUser().getId()).username(cm.getUser().getUsername())
				.email(cm.getUser().getEmail()).role(cm.getRole()).joinedAt(cm.getJoinedAt()).build();
	}

	@Transactional
	public void leaveGroup(UUID chatId) {
		User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		ChatMember member = chatMemberRepository.findByChatIdAndUserId(chatId, currentUser.getId()).orElseThrow(
				() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not member of this group"));

		Chat chat = member.getChat();
		if (!"GROUP".equals(chat.getType())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leave only available in group type chat");
		}

		if ("ADMIN".equals(member.getRole())) {
			long adminCount = chatMemberRepository.countByChatIdAndRole(chatId, "ADMIN");
			long totalMember = chatMemberRepository.countByChatId(chatId);

			if (adminCount == 1 && totalMember > 1) {
				ChatMember nextAdmin = chatMemberRepository.findFirstByChatIdAndUserIdNot(chatId, currentUser.getId())
						.orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
								"Fail transfer admin role to new member"));

				nextAdmin.setRole("ADMIN");
				chatMemberRepository.save(nextAdmin);
			}
		}

		chatMemberRepository.delete(member);

		if (chatMemberRepository.countByChatId(chatId) == 0) {
			chatRepository.delete(chat);
		}
	}
}
