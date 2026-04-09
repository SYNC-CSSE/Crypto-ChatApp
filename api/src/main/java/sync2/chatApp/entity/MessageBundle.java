package sync2.chatApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "message_bundles")
public class MessageBundle {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "ipfs_cid", nullable = false)
	private String ipfsCid;

	@Column(name = "transaction_hash")
	private String transactionHash;

	@Column(name = "bundle_hash")
	private String bundleHash;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@OneToMany(mappedBy = "bundle", fetch = FetchType.LAZY)
	private List<Message> messages;
}