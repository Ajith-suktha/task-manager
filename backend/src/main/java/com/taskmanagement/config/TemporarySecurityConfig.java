package com.taskmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY (Phase 0): Spring Security denies everything by default, so this opens only the
 * health check and API docs. Replaced by real authentication in Phase 1 (slice 1.4).
 */
@Configuration
class TemporarySecurityConfig {

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(auth -> auth
				.requestMatchers("/actuator/health/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
				.anyRequest().denyAll());
		return http.build();
	}
}
