package sync2.chatApp.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import sync2.chatApp.model.AddGroupMemberRequest;
import sync2.chatApp.model.ChatResponse;
import sync2.chatApp.model.CreateGroupChatRequest;
import sync2.chatApp.model.CreatePrivateChatRequest;
import sync2.chatApp.model.ChatDetailResponse;
import sync2.chatApp.model.RemoveGroupMemberRequest;
import sync2.chatApp.model.UpdateGroupRequest;
import sync2.chatApp.model.UpdateMemberRoleRequest;
import sync2.chatApp.model.WebResponse;
import sync2.chatApp.service.ChatService;

@RestController
@AllArgsConstructor
public class ChatController {
	private final ChatService chatService;

	@GetMapping(path = "/api/chats")
	public WebResponse<List<ChatResponse>> getMyChats(@RequestParam(name = "name", required = false) String name) {
		List<ChatResponse> responses = chatService.getUserChats(name);
		return WebResponse.<List<ChatResponse>>builder().data(responses).build();
	}

	@PostMapping(path = "/api/chats/private")
	public WebResponse<ChatResponse> createPrivate(@RequestBody CreatePrivateChatRequest request) {
		ChatResponse response = chatService.createPrivateChat(request);
		return WebResponse.<ChatResponse>builder().data(response).build();
	}

	@PostMapping(path = "/api/chats/group")
	public WebResponse<ChatResponse> createGroup(@RequestBody CreateGroupChatRequest request) {
		ChatResponse response = chatService.createGroupChat(request);
		return WebResponse.<ChatResponse>builder().data(response).build();
	}

	@PatchMapping(path = "/api/chats/group/edit/{chatId}")
	public WebResponse<ChatResponse> updateGroup(@PathVariable("chatId") UUID chatId,
			@RequestBody UpdateGroupRequest request) {
		ChatResponse response = chatService.updateGroupName(chatId, request);
		return WebResponse.<ChatResponse>builder().data(response).build();
	}

	@PostMapping(path = "/api/chats/group/add/{chatId}")
	public WebResponse<String> addMember(@PathVariable("chatId") UUID chatId,
			@RequestBody AddGroupMemberRequest request) {
		chatService.addGroupMember(chatId, request);
		return WebResponse.<String>builder().data("Users added to group: " + chatId).build();
	}

	@DeleteMapping(path = "/api/chats/group/remove/{chatId}")
	public WebResponse<String> removeMembers(@PathVariable("chatId") UUID chatId,
			@RequestBody RemoveGroupMemberRequest request) {
		chatService.removeMembers(chatId, request);
		return WebResponse.<String>builder().data("Users removed to group: " + chatId).build();
	}

	@PatchMapping(path = "/api/chats/group/change-role/{chatId}")
	public WebResponse<String> updateRoles(@PathVariable("chatId") UUID chatId,
			@RequestBody UpdateMemberRoleRequest request) {
		chatService.updateMemberRoles(chatId, request);
		return WebResponse.<String>builder().data("OK").build();
	}

	@GetMapping(path = "/api/chats/detail/{chatId}")
	public WebResponse<ChatDetailResponse> getDetail(@PathVariable("chatId") UUID chatId) {
		ChatDetailResponse response = chatService.getChatDetail(chatId);
		return WebResponse.<ChatDetailResponse>builder().data(response).build();
	}
	
	@DeleteMapping(path = "/api/chats/group/leave/{chatId}")
	public WebResponse<String> leave(@PathVariable("chatId") UUID chatId) {
	    chatService.leaveGroup(chatId);
	    return WebResponse.<String>builder().data("OK").build();
	}
}
