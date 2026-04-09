package sync2.chatApp.controller;

import java.security.Principal;
import java.util.UUID;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import lombok.AllArgsConstructor;
import sync2.chatApp.model.MessageResponse;
import sync2.chatApp.model.SendMessageRequest;
import sync2.chatApp.model.WebResponse;
import sync2.chatApp.service.MessageService;

@Controller
@AllArgsConstructor
public class ChatWebSocketController {

	private final MessageService messageService;

	@MessageMapping("/send-message/{chatId}")
	@SendTo("/topic/chat/{chatId}")
	public WebResponse<MessageResponse> broadcastMessage(@DestinationVariable String chatId,
			@Payload SendMessageRequest request, Principal principal) {
		MessageResponse response = messageService.sendMessage(UUID.fromString(chatId), request, principal);

		return WebResponse.<MessageResponse>builder().data(response).errors(null).build();
	}
}
