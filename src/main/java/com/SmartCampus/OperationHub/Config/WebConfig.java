package com.SmartCampus.OperationHub.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This tells Spring Boot: "When a URL asks for /uploads/something,
        // look inside the physical 'uploads/' folder in the project root."
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}