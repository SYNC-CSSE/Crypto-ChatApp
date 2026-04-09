package sync2.chatApp.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseSchemaPatchConfig {

    @Bean
    ApplicationRunner ensureMessageSchemaPatched(JdbcTemplate jdbcTemplate) {
        return args -> {
            // Ensure columns introduced by message archiving exist for old databases.
            jdbcTemplate.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(20)");
            jdbcTemplate.execute("UPDATE messages SET status = 'PENDING' WHERE status IS NULL");
            jdbcTemplate.execute("ALTER TABLE messages ALTER COLUMN status SET DEFAULT 'PENDING'");
            jdbcTemplate.execute("ALTER TABLE messages ALTER COLUMN status SET NOT NULL");

            jdbcTemplate.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_hash VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS bundle_id BIGINT");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS message_bundles ("
                    + "id BIGSERIAL PRIMARY KEY,"
                    + "ipfs_cid VARCHAR(255) NOT NULL,"
                    + "transaction_hash VARCHAR(255),"
                    + "bundle_hash VARCHAR(255),"
                    + "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
                    + ")");

                jdbcTemplate.execute("DO $$ "
                    + "BEGIN "
                    + "IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_messages_bundle') THEN "
                    + "ALTER TABLE messages ADD CONSTRAINT fk_messages_bundle "
                    + "FOREIGN KEY (bundle_id) REFERENCES message_bundles(id); "
                    + "END IF; "
                    + "END $$;");
        };
    }
}
