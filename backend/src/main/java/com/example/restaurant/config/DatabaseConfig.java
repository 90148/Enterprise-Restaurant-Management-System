package com.example.restaurant.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    @Profile("prod")
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        String username = properties.getUsername();
        String password = properties.getPassword();
        String envDbUrl = System.getenv("DATABASE_URL");
        String driverClass = "org.postgresql.Driver";

        if (url == null || url.isEmpty() || url.contains("localhost:5432")) {
            if (envDbUrl != null && !envDbUrl.isEmpty()) {
                url = envDbUrl;
            } else {
                log.warn("No external DATABASE_URL found on Render. Falling back to embedded H2 database to ensure container boots successfully.");
                url = "jdbc:h2:mem:restaurant_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL";
                username = "sa";
                password = "";
                driverClass = "org.h2.Driver";
            }
        }

        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                log.info("Transforming Render DATABASE_URL into JDBC format...");
                String cleanUrl = url.replace("postgres://", "http://").replace("postgresql://", "http://");
                URI uri = new URI(cleanUrl);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    username = userInfo[0];
                    password = userInfo.length > 1 ? userInfo[1] : "";
                }

                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String host = uri.getHost();
                String path = uri.getPath();

                url = "jdbc:postgresql://" + host + ":" + port + path;
                log.info("Database URL successfully transformed for JDBC: jdbc:postgresql://{}:{}{}", host, port, path);
            } catch (Exception e) {
                log.warn("Failed to parse DATABASE_URL cleanly, attempting direct prefix replacement: {}", e.getMessage());
                if (url.startsWith("postgres://")) {
                    url = "jdbc:postgresql://" + url.substring("postgres://".length());
                } else if (url.startsWith("postgresql://")) {
                    url = "jdbc:" + url;
                }
            }
        }

        if (url != null && url.startsWith("jdbc:h2:")) {
            driverClass = "org.h2.Driver";
        } else {
            driverClass = "org.postgresql.Driver";
        }

        return properties.initializeDataSourceBuilder()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName(driverClass)
                .build();
    }
}
