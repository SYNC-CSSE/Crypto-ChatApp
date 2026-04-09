package sync2.chatApp.model;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMemberRoleRequest {
    @NotEmpty(message = "Daftar perubahan role tidak boleh kosong")
    private List<MemberRoleUpdate> updates;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MemberRoleUpdate {
        @NotNull
        private UUID userId;
        
        @NotBlank
        private String role;
    }
}