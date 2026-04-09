package sync2.chatApp.config;

import java.util.Collections;
import java.util.UUID;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.AllArgsConstructor;
import sync2.chatApp.entity.User;
import sync2.chatApp.repository.UserRepository;
import sync2.chatApp.security.JwtUtil;

@Configuration
@EnableWebSocketMessageBroker
@AllArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

   @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
        .setAllowedOriginPatterns("*")
        .withSockJS();
    }

   @Override
   public void configureClientInboundChannel(ChannelRegistration registration) {
       registration.interceptors(new ChannelInterceptor() {
           @Override
           public Message<?> preSend(Message<?> message, MessageChannel channel) {
               StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

               if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                   String authHeader = accessor.getFirstNativeHeader("Authorization");

                   if (authHeader != null && authHeader.startsWith("Bearer ")) {
                       String token = authHeader.substring(7);
                       try {
                           String userIdString = jwtUtil.getUserId(token);
                           if (userIdString != null) {
                               User user = userRepository.findById(UUID.fromString(userIdString)).orElse(null);

                               if (user != null) {
                                   UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                           user, null, Collections.emptyList());
                                   
                                   accessor.setUser(auth); 
                                   
                                   SecurityContextHolder.getContext().setAuthentication(auth);
                               }
                           }
                       } catch (Exception e) {
                           throw new org.springframework.messaging.MessagingException("Unauthorized: " + e.getMessage());
                       }
                   }
               }
               return message;
           }
       });
   }
}