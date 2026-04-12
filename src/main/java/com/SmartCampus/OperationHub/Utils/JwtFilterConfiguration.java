package com.SmartCampus.OperationHub.Utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration to register JWT Authentication Filter
 */
@Configuration
public class JwtFilterConfiguration {

    @Autowired
    private JwtFilter jwtFilter;

    /**
     * Register JWT Authentication Filter with Spring
     *
     * @return FilterRegistrationBean configured with JwtAuthenticationFilter
     */
    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilter() {
        FilterRegistrationBean<JwtFilter> registrationBean =
            new FilterRegistrationBean<>(jwtFilter);
        
        // Add URL patterns to filter
        registrationBean.addUrlPatterns("/api/*", "/api/**");
        
        // Set filter order (lower values run first)
        registrationBean.setOrder(1);
        
        return registrationBean;
    }
}

