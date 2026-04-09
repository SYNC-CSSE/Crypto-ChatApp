package sync2.chatApp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import sync2.chatApp.entity.Chat;

public interface ChatRepository extends JpaRepository<Chat, UUID> {
	@Query("""
			    SELECT DISTINCT c FROM Chat c
			    JOIN ChatMember cm ON c.id = cm.chat.id
			    WHERE cm.user.id = :userId
			    AND (:search IS NULL OR :search = '' OR
			         (c.type = 'GROUP' AND c.name ILIKE CONCAT('%', :search, '%')) OR
			         (c.type = 'PRIVATE' AND EXISTS (
			             SELECT 1 FROM ChatMember cm2
			             JOIN User u2 ON cm2.user.id = u2.id
			             WHERE cm2.chat.id = c.id
			             AND u2.id != :userId
			             AND u2.username ILIKE CONCAT('%', :search, '%')
			         ))
			    )
			""")
	List<Chat> searchUserChats(@Param("userId") UUID userId, @Param("search") String search);

	@Query("""
			    SELECT c FROM Chat c
			    WHERE c.type = 'PRIVATE'
			    AND (SELECT COUNT(cm) FROM ChatMember cm WHERE cm.chat = c) = 2
			    AND EXISTS (SELECT 1 FROM ChatMember cm1 WHERE cm1.chat = c AND cm1.user.id = :userId)
			    AND EXISTS (SELECT 1 FROM ChatMember cm2 WHERE cm2.chat = c AND cm2.user.id = :targetId)
			""")
	Optional<Chat> findExistingPrivateChat(@Param("userId") UUID userId, @Param("targetId") UUID targetId);
}
