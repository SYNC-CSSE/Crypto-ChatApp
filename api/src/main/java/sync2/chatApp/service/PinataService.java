package sync2.chatApp.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import sync2.chatApp.entity.Message;
import sync2.chatApp.model.MessageArchiveDTO;

@Service
public class PinataService {

	@Value("${pinata.api.key}")
	private String apiKey;

	@Value("${pinata.api.secret}")
	private String apiSecret;

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	public String uploadBundle(List<Message> messages) throws Exception {
		List<MessageArchiveDTO> archiveList = messages.stream()
				.map(msg -> MessageArchiveDTO.builder().id(msg.getId()).sender(msg.getSender().getUsername())
						.content(msg.getContent()).iv(msg.getIv()).type(msg.getType())
						.timestamp(msg.getCreatedAt().toString()).build())
				.collect(Collectors.toList());

		String jsonContent = objectMapper.writeValueAsString(archiveList);

		HttpHeaders headers = new HttpHeaders();
		headers.set("pinata_api_key", apiKey);
		headers.set("pinata_secret_api_key", apiSecret);
		headers.setContentType(MediaType.MULTIPART_FORM_DATA);

		MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
		ByteArrayResource resource = new ByteArrayResource(jsonContent.getBytes(StandardCharsets.UTF_8)) {
			@Override
			public String getFilename() {
				return "bundle-" + System.currentTimeMillis() + ".json";
			}
		};
		body.add("file", resource);

		HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

		ResponseEntity<Map> response = restTemplate.postForEntity("https://api.pinata.cloud/pinning/pinFileToIPFS",
				requestEntity, Map.class);

		return response.getBody().get("IpfsHash").toString();
	}
}