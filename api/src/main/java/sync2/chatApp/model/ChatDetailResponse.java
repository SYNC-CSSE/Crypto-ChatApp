package sync2.chatApp.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ChatDetailResponse {
    private UUID id;
    private String type;
    private String name;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<MemberResponse> members;

    @Data
    @Builder
    public static class MemberResponse {
        private UUID id;
        private String username;
        private String email;
        private String role;
        private LocalDateTime joinedAt;
    }
}