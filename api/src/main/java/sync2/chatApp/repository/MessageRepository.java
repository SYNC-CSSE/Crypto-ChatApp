package sync2.chatApp.repository;


import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import sync2.chatApp.entity.Message;

public interface MessageRepository extends JpaRepository<Message, UUID>{
	List<Message> findByChatId(UUID chatId, Pageable pageable);
	List<Message> findByStatus(String status);
}
