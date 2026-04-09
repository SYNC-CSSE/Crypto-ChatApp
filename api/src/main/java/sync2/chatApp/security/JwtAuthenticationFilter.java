package sync2.chatApp.security;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.AllArgsConstructor;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sync2.chatApp.entity.User;
import sync2.chatApp.repository.UserRepository;

@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                String userIdString = jwtUtil.getUserId(token); 
                
                if (userIdString != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    User user = userRepository.findById(UUID.fromString(userIdString)).orElse(null);

                    if (user != null) {
                        var auth = new UsernamePasswordAuthenticationToken(
                            user, 
                            null, 
                            Collections.emptyList()
                        );
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        
                        System.out.println("Authenticated User ID: " + user.getId());
                    }
                }
            } catch (Exception e) {
                System.out.println("JWT Validation Error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}