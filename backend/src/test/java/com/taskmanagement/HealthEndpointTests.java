package com.taskmanagement;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class HealthEndpointTests {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	JdbcTemplate jdbc;

	@Test
	void healthIsUpWithoutAuthentication() throws Exception {
		mockMvc.perform(get("/actuator/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"));
	}

	@Test
	void otherEndpointsAreDeniedForNow() throws Exception {
		mockMvc.perform(get("/api/anything")).andExpect(status().isForbidden());
	}

	@Test
	void flywayAppliedBaselineMigration() {
		Integer applied = jdbc.queryForObject(
				"SELECT COUNT(*) FROM flyway_schema_history WHERE version = '1' AND success = 1", Integer.class);
		assertThat(applied).isEqualTo(1);
	}
}
