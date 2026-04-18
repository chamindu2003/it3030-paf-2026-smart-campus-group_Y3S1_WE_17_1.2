package com.SmartCampus.OperationHub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OperationHubApplication {

	public static void main(String[] args) {

		SpringApplication.run(OperationHubApplication.class, args);
	}

}
