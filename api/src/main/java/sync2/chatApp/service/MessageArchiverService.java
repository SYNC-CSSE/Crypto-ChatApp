package sync2.chatApp.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import sync2.chatApp.entity.Message;
import sync2.chatApp.entity.MessageBundle;
import sync2.chatApp.repository.MessageBundleRepository;
import sync2.chatApp.repository.MessageRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageArchiverService {

	private final MessageRepository messageRepository;
	private final MessageBundleRepository bundleRepository;
	private final PinataService pinataService;
	private final Web3jService web3jService;

	@Scheduled(fixedRate = 60000)
	@Transactional
	public void processPendingMessages() {
		List<Message> pendingMessages = messageRepository.findByStatus("PENDING");

		if (pendingMessages.isEmpty()) {
			return;
		}

		log.info("Memulai proses pengarsipan untuk {} pesan...", pendingMessages.size());

		try {
			String cid = pinataService.uploadBundle(pendingMessages);

			String bundleHash = generateSha256(cid);

			String txHash = web3jService.storeBundleOnChain(cid, bundleHash);

			MessageBundle bundle = new MessageBundle();
			bundle.setIpfsCid(cid);
			bundle.setTransactionHash(txHash);
			bundle.setBundleHash(bundleHash);
			bundle = bundleRepository.save(bundle);

			for (Message msg : pendingMessages) {
				msg.setStatus("VERIFIED");
				msg.setBundle(bundle);
			}
			messageRepository.saveAll(pendingMessages);

			log.info("Success! {} message archived. CID: {}, Tx: {}", pendingMessages.size(), cid, txHash);

		} catch (Exception e) {
			log.error("Failed archiving bundle: {}", e.getMessage(), e);

		}
	}

	private String generateSha256(String input) throws Exception {
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
		return HexFormat.of().formatHex(hash);
	}
}