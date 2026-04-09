package sync2.chatApp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sync2.chatApp.entity.MessageBundle;

@Repository
public interface MessageBundleRepository extends JpaRepository<MessageBundle, Long> {

}
