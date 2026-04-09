package sync2.chatApp.security;

import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import sync2.chatApp.entity.User;

@Component
public class JwtUtil {

	private final String SECRET = "secret-key-yang-panjang-minimal-32-char";
	private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());
	private final long expirationTime = 86400000; // 1 hari

	public String generateToken(User user) {
		return Jwts.builder().setSubject(user.getId().toString()).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expirationTime)).signWith(key).compact();
	}

	public String getUserId(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
	}
}