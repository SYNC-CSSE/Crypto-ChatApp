package sync2.chatApp.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import sync2.chatApp.model.MessageResponse;
import sync2.chatApp.model.SendMessageRequest;
import sync2.chatApp.model.WebResponse;

import sync2.chatApp.service.MessageService;

@RestController
@AllArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping(path = "/api/chats/messages/{chatId}")
	public WebResponse<List<MessageResponse>> getMessages(@PathVariable("chatId") UUID chatId) {
		List<MessageResponse> response = messageService.getChatMessages(chatId, 10);
		return WebResponse.<List<MessageResponse>>builder().data(response).build();
	}
    
    @PostMapping("/api/chats/messages/{chatId}")
    public WebResponse<MessageResponse> sendMessage(
            @PathVariable UUID chatId,
            @RequestBody SendMessageRequest request,
            Principal principal
    ) {
        MessageResponse response = messageService.sendMessage(chatId, request, principal);

        return WebResponse.<MessageResponse>builder()
                .data(response)
                .build();
    }
}
