package com.payroll.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }
  @Bean UserDetailsService users(PasswordEncoder encoder){
    String password=System.getenv().getOrDefault("PAYROLL_ADMIN_PASSWORD","admin123");
    return new InMemoryUserDetailsManager(User.withUsername("admin").password(encoder.encode(password)).roles("ADMIN").build());
  }
  @Bean SecurityFilterChain filter(HttpSecurity http)throws Exception{
    http.csrf(csrf->csrf.disable())
      .authorizeHttpRequests(auth->auth.requestMatchers("/","/index.html","/app.js","/styles.css","/error","/api/auth/status").permitAll().anyRequest().authenticated())
      .httpBasic(basic->{})
      .logout(logout->logout.logoutUrl("/api/auth/logout").logoutSuccessHandler((request,response,authentication)->response.setStatus(204)));
    return http.build();
  }
}
