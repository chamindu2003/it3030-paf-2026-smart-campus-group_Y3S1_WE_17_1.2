package com.SmartCampus.OperationHub.Utils;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration to register JWT Authentication Filter
 */
@Configuration
public class JwtFilterConfiguration {

    /**
     * Create JwtFilter bean
     *
     * @param jwtUtil the JWT utility for token operations
     * @return JwtFilter instance
     */
    @Bean
    public JwtFilter jwtFilter(JwtUtil jwtUtil) {
        JwtFilter filter = new JwtFilter();
        filter.setJwtUtil(jwtUtil);
        return filter;
    }

    /**
     * Register JWT Authentication Filter with Spring
     *
     * @param jwtFilter the JWT filter bean
     * @return FilterRegistrationBean configured with JwtFilter
     */
    @Bean
    public FilterRegistrationBean<JwtFilter> jwtFilterRegistration(JwtFilter jwtFilter) {
        FilterRegistrationBean<JwtFilter> registrationBean =
            new FilterRegistrationBean<>(jwtFilter);
        
        // Add URL patterns to filter
        registrationBean.addUrlPatterns("/api/*", "/api/**");
        
        // Set filter order (lower values run first)
        registrationBean.setOrder(1);
        
        return registrationBean;
    }
}

