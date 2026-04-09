package sync2.chatApp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;
import sync2.chatApp.entity.ChatMember;
import sync2.chatApp.entity.User;

public interface ChatMemberRepository extends JpaRepository<ChatMember, UUID> {
	@Query("SELECT cm.user FROM ChatMember cm WHERE cm.chat.id = :chatId AND cm.user.id <> :userId")
	List<User> findRecipient(@Param("chatId") UUID chatId, @Param("userId") UUID userId);

	@Modifying
	@Transactional
	@Query("DELETE FROM ChatMember cm WHERE cm.chat.id = :chatId AND cm.user.id IN :userIds")
	void deleteAllByChatIdAndUserIdIn(@Param("chatId") UUID chatId, @Param("userIds") List<UUID> userIds);

	@Query("SELECT cm FROM ChatMember cm JOIN FETCH cm.user WHERE cm.chat.id = :chatId")
	List<ChatMember> findAllByChatIdWithUser(@Param("chatId") UUID chatId);

	Optional<ChatMember> findByChatIdAndUserId(UUID chatId, UUID userId);
	
	long countByChatIdAndRole(UUID chatId, String role);
	
	long countByChatId(UUID chatId);
	
	Optional<ChatMember> findFirstByChatIdAndUserIdNot(UUID chatId, UUID userId);
	
	boolean existsByChatIdAndUserIdAndRole(UUID chatid, UUID userId, String role);

	boolean existsByChatIdAndUserId(UUID chatid, UUID userId);
}
