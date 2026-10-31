import fs from 'fs';
import path from 'path';

export function initializeSampleRepositories(samplesDir) {
  if (!fs.existsSync(samplesDir)) {
    fs.mkdirSync(samplesDir, { recursive: true });
  }

  // 1. Spring Boot + React Enterprise Application
  const springBootDir = path.join(samplesDir, 'spring-boot-react-enterprise');
  if (!fs.existsSync(springBootDir)) {
    initSpringBootSample(springBootDir);
  }

  // 2. Node.js + Express + Prisma SaaS
  const nodeDir = path.join(samplesDir, 'node-express-prisma-saas');
  if (!fs.existsSync(nodeDir)) {
    initNodePrismaSample(nodeDir);
  }

  // 3. Python FastAPI + Celery AI Service
  const fastapiDir = path.join(samplesDir, 'fastapi-vue-ai-service');
  if (!fs.existsSync(fastapiDir)) {
    initFastApiSample(fastapiDir);
  }
}

function writeSampleFile(dir, relPath, content) {
  const fullPath = path.join(dir, relPath);
  const parent = path.dirname(fullPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

function initSpringBootSample(baseDir) {
  // pom.xml
  writeSampleFile(baseDir, 'backend/pom.xml', `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.repomind.enterprise</groupId>
    <artifactId>enterprise-management-hub</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>Enterprise Management Hub</name>
    <description>Enterprise Employee and Department Management System with Spring Security and JWT</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.3</jjwt.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`);

  // application.yml
  writeSampleFile(baseDir, 'backend/src/main/resources/application.yml', `
server:
  port: 8080
  servlet:
    context-path: /api/v1

spring:
  application:
    name: enterprise-management-hub
  datasource:
    url: jdbc:postgresql://localhost:5432/enterprise_db
    username: postgres
    password: \${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  jwt:
    secret: 9a6747f3b64f8d551b2f3a9e48b97d12fe89413b8b1a4aa672a912e564d3992b
    expiration-ms: 86400000
`);

  // Flyway Migration
  writeSampleFile(baseDir, 'backend/src/main/resources/db/migration/V1__init_schema.sql', `
-- Database initialization migration
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    salary NUMERIC(12, 2) NOT NULL CHECK (salary > 0),
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_employee_department ON employees(department_id);
`);

  // Application Entry Point
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/EnterpriseApplication.java', `
package com.repomind.enterprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EnterpriseApplication {
    public static void main(String[] args) {
        SpringApplication.run(EnterpriseApplication.class, args);
    }
}
`);

  // Entity: User
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/entity/User.java', `
package com.repomind.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 30)
    private String role; // ROLE_ADMIN, ROLE_USER

    @Column(nullable = false)
    private boolean enabled = true;
}
`);

  // Entity: Department
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/entity/Department.java', `
package com.repomind.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Employee> employees = new ArrayList<>();
}
`);

  // Entity: Employee
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/entity/Employee.java', `
package com.repomind.enterprise.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(length = 20)
    private String status = "ACTIVE";
}
`);

  // DTOs
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/dto/LoginRequestDTO.java', `
package com.repomind.enterprise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Password cannot be empty")
    private String password;
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/dto/RegisterRequestDTO.java', `
package com.repomind.enterprise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    @NotBlank(message = "Username is mandatory")
    @Size(min = 4, max = 50)
    private String username;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Must be a valid email format")
    private String email;

    private String role = "ROLE_USER";
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/dto/EmployeeRequestDTO.java', `
package com.repomind.enterprise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeRequestDTO {
    @NotBlank(message = "First name is mandatory")
    private String firstName;

    @NotBlank(message = "Last name is mandatory")
    private String lastName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Valid email is required")
    private String email;

    @NotNull(message = "Salary cannot be null")
    @Positive(message = "Salary must be positive")
    private BigDecimal salary;

    @NotNull(message = "Department ID is mandatory")
    private Long departmentId;

    private LocalDate hireDate;
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/dto/AuthResponseDTO.java', `
package com.repomind.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private String token;
    private String type = "Bearer";
    private String username;
    private String role;
}
`);

  // Repositories
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/repository/UserRepository.java', `
package com.repomind.enterprise.repository;

import com.repomind.enterprise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/repository/EmployeeRepository.java', `
package com.repomind.enterprise.repository;

import com.repomind.enterprise.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Employee> searchEmployees(@Param("query") String query, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.department.id = :deptId")
    Page<Employee> findByDepartmentId(@Param("deptId") Long deptId, Pageable pageable);
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/repository/DepartmentRepository.java', `
package com.repomind.enterprise.repository;

import com.repomind.enterprise.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    Optional<Department> findByCode(String code);
}
`);

  // Security Configuration & JWT
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/config/SecurityConfig.java', `
package com.repomind.enterprise.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/public/**").permitAll()
                .requestMatchers("/employees/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/config/JwtAuthenticationFilter.java', `
package com.repomind.enterprise.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/config/JwtService.java', `
package com.repomind.enterprise.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("\${app.jwt.secret}")
    private String secretKey;

    @Value("\${app.jwt.expiration-ms}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
`);

  // Services
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/service/AuthService.java', `
package com.repomind.enterprise.service;

import com.repomind.enterprise.config.JwtService;
import com.repomind.enterprise.dto.AuthResponseDTO;
import com.repomind.enterprise.dto.LoginRequestDTO;
import com.repomind.enterprise.dto.RegisterRequestDTO;
import com.repomind.enterprise.entity.User;
import com.repomind.enterprise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : "ROLE_USER")
                .enabled(true)
                .build();

        userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );

        String token = jwtService.generateToken(userDetails);
        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );

        String token = jwtService.generateToken(userDetails);
        return AuthResponseDTO.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/service/EmployeeService.java', `
package com.repomind.enterprise.service;

import com.repomind.enterprise.dto.EmployeeRequestDTO;
import com.repomind.enterprise.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    Page<Employee> getAllEmployees(Pageable pageable);
    Employee getEmployeeById(Long id);
    Employee createEmployee(EmployeeRequestDTO dto);
    Employee updateEmployee(Long id, EmployeeRequestDTO dto);
    void deleteEmployee(Long id);
    Page<Employee> searchEmployees(String query, Pageable pageable);
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/service/EmployeeServiceImpl.java', `
package com.repomind.enterprise.service;

import com.repomind.enterprise.dto.EmployeeRequestDTO;
import com.repomind.enterprise.entity.Department;
import com.repomind.enterprise.entity.Employee;
import com.repomind.enterprise.repository.DepartmentRepository;
import com.repomind.enterprise.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    @Override
    @Transactional
    public Employee createEmployee(EmployeeRequestDTO dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Employee with email " + dto.getEmail() + " already exists");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + dto.getDepartmentId()));

        Employee employee = Employee.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .salary(dto.getSalary())
                .department(department)
                .hireDate(dto.getHireDate() != null ? dto.getHireDate() : LocalDate.now())
                .status("ACTIVE")
                .build();

        return employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public Employee updateEmployee(Long id, EmployeeRequestDTO dto) {
        Employee existing = getEmployeeById(id);

        if (!existing.getEmail().equals(dto.getEmail()) && employeeRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email is already taken by another employee");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + dto.getDepartmentId()));

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setSalary(dto.getSalary());
        existing.setDepartment(department);

        return employeeRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Employee> searchEmployees(String query, Pageable pageable) {
        return employeeRepository.searchEmployees(query, pageable);
    }
}
`);

  // Controllers
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/controller/AuthController.java', `
package com.repomind.enterprise.controller;

import com.repomind.enterprise.dto.AuthResponseDTO;
import com.repomind.enterprise.dto.LoginRequestDTO;
import com.repomind.enterprise.dto.RegisterRequestDTO;
import com.repomind.enterprise.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
`);

  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/controller/EmployeeController.java', `
package com.repomind.enterprise.controller;

import com.repomind.enterprise.dto.EmployeeRequestDTO;
import com.repomind.enterprise.entity.Employee;
import com.repomind.enterprise.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<Page<Employee>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(employeeService.getAllEmployees(PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Employee>> searchEmployees(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.searchEmployees(query, PageRequest.of(page, size)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody EmployeeRequestDTO dto) {
        return new ResponseEntity<>(employeeService.createEmployee(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequestDTO dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
`);

  // Global Exception Handler
  writeSampleFile(baseDir, 'backend/src/main/java/com/repomind/enterprise/exception/GlobalExceptionHandler.java', `
package com.repomind.enterprise.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.NOT_FOUND.value());
        error.put("error", "Not Found");
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> error = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(f -> fieldErrors.put(f.getField(), f.getDefaultMessage()));
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Validation Failed");
        error.put("fieldErrors", fieldErrors);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
`);

  // Unit Test
  writeSampleFile(baseDir, 'backend/src/test/java/com/repomind/enterprise/service/EmployeeServiceTest.java', `
package com.repomind.enterprise.service;

import com.repomind.enterprise.dto.EmployeeRequestDTO;
import com.repomind.enterprise.entity.Department;
import com.repomind.enterprise.entity.Employee;
import com.repomind.enterprise.repository.DepartmentRepository;
import com.repomind.enterprise.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Department department;
    private Employee employee;

    @BeforeEach
    void setUp() {
        department = Department.builder().id(1L).name("Engineering").code("ENG").build();
        employee = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@enterprise.com")
                .salary(new BigDecimal("95000.00"))
                .department(department)
                .hireDate(LocalDate.now())
                .status("ACTIVE")
                .build();
    }

    @Test
    void testGetEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        Employee found = employeeService.getEmployeeById(1L);
        assertNotNull(found);
        assertEquals("john.doe@enterprise.com", found.getEmail());
        verify(employeeRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateEmployee_Success() {
        EmployeeRequestDTO dto = new EmployeeRequestDTO();
        dto.setFirstName("Jane");
        dto.setLastName("Smith");
        dto.setEmail("jane.smith@enterprise.com");
        dto.setSalary(new BigDecimal("88000.00"));
        dto.setDepartmentId(1L);

        when(employeeRepository.existsByEmail("jane.smith@enterprise.com")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        Employee created = employeeService.createEmployee(dto);
        assertNotNull(created);
        verify(employeeRepository).save(any(Employee.class));
    }
}
`);

  // Frontend files
  writeSampleFile(baseDir, 'frontend/package.json', `
{
  "name": "enterprise-portal-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1"
  }
}
`);

  writeSampleFile(baseDir, 'frontend/src/services/api.js', `
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const employeeApi = {
  getAll: (page = 0, size = 10) => api.get(\`/employees?page=\${page}&size=\${size}\`),
  getById: (id) => api.get(\`/employees/\${id}\`),
  create: (employee) => api.post('/employees', employee),
  update: (id, employee) => api.put(\`/employees/\${id}\`, employee),
  delete: (id) => api.delete(\`/employees/\${id}\`),
  search: (query) => api.get(\`/employees/search?query=\${query}\`)
};

export default api;
`);

  writeSampleFile(baseDir, 'frontend/src/pages/Login.jsx', `
import React, { useState } from 'react';
import { authApi } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('user_role', response.data.role);
      if (onLoginSuccess) onLoginSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Enterprise Hub Login</h2>
        {error && <div className="error-banner">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
`);

  writeSampleFile(baseDir, 'frontend/src/pages/Dashboard.jsx', `
import React, { useEffect, useState } from 'react';
import { employeeApi } from '../services/api';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = search 
        ? await employeeApi.search(search)
        : await employeeApi.getAll(page, 10);
      setEmployees(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      await employeeApi.delete(id);
      fetchEmployees();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Enterprise Directory</h1>
        <input 
          placeholder="Search by name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </header>
      {loading ? <p>Loading directory...</p> : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Salary</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.firstName} {emp.lastName}</td>
                <td>{emp.email}</td>
                <td>\${emp.salary}</td>
                <td>
                  <button onClick={() => handleDelete(emp.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
`);

  // Deployment files
  writeSampleFile(baseDir, 'Dockerfile', `
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`);

  writeSampleFile(baseDir, 'docker-compose.yml', `
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: enterprise_db
    environment:
      POSTGRES_DB: enterprise_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: enterprise_backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/enterprise_db
      DB_PASSWORD: postgrespassword
    depends_on:
      - postgres

volumes:
  pgdata:
`);

  writeSampleFile(baseDir, 'README.md', `
# Enterprise Management Hub

A production-grade enterprise management application built with Spring Boot 3, Spring Security, JWT, PostgreSQL, and React.

## Features
- **Authentication**: JWT token-based authentication with BCrypt password encryption and role-based access control (\`ROLE_ADMIN\`, \`ROLE_USER\`).
- **Employee Management**: Comprehensive CRUD operations, search with custom JPQL queries, and pagination.
- **Department Relations**: Entity relationships with \`@ManyToOne\` and \`@OneToMany\` mapping.
- **Database Migrations**: Version-controlled Flyway schema migrations (\`V1__init_schema.sql\`).
- **Exception Handling**: Global centralized exception advice handling validation and not-found scenarios.
`);
}

function initNodePrismaSample(baseDir) {
  writeSampleFile(baseDir, 'package.json', `
{
  "name": "saas-subscription-platform",
  "version": "1.0.0",
  "description": "Multi-tenant Node.js + Express + Prisma + Stripe SaaS billing platform",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --detectOpenHandles"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "stripe": "^14.10.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.4",
    "jest": "^29.7.0",
    "prisma": "^5.7.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
`);

  writeSampleFile(baseDir, 'prisma/schema.prisma', `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  name          String
  role          String         @default("USER") // USER, ADMIN
  subscriptions Subscription[]
  payments      Payment[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Subscription {
  id                   String   @id @default(uuid())
  userId               String
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeSubscriptionId String   @unique
  planTier             String   // STARTER, PRO, ENTERPRISE
  status               String   // ACTIVE, PAST_DUE, CANCELED
  currentPeriodEnd     DateTime
  createdAt            DateTime @default(now())
}

model Payment {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  amountCents     Int
  currency        String   @default("usd")
  stripePaymentId String   @unique
  status          String   // SUCCEEDED, FAILED
  createdAt       DateTime @default(now())
}
`);

  writeSampleFile(baseDir, 'src/server.ts', `
import express from 'express';
import cors from 'cors';
import { authRouter } from './controllers/auth.controller';
import { subscriptionRouter } from './controllers/subscription.controller';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`SaaS Platform server listening on port \${PORT}\`);
});

export default app;
`);

  writeSampleFile(baseDir, 'src/middlewares/auth.middleware.ts', `
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'saas-secret-key') as any;
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
`);

  writeSampleFile(baseDir, 'src/services/cache.service.ts', `
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  static async del(key: string): Promise<void> {
    await redis.del(key);
  }
}
`);

  writeSampleFile(baseDir, 'src/services/payment.service.ts', `
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});
const prisma = new PrismaClient();

export class PaymentService {
  static async createCheckoutSession(userId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });
    return session;
  }

  static async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripePaymentId = invoice.payment_intent as string;
      const amount = invoice.amount_paid;
      // Record payment into database
      console.log(\`Recorded payment \${stripePaymentId} of \${amount} cents\`);
    }
  }
}
`);

  writeSampleFile(baseDir, 'src/controllers/auth.controller.ts', `
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'saas-secret-key',
    { expiresIn: '7d' }
  );

  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'saas-secret-key',
    { expiresIn: '7d' }
  );

  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

export const authRouter = router;
`);

  writeSampleFile(baseDir, 'src/controllers/subscription.controller.ts', `
import { Router, Response } from 'express';
import { authenticateJwt, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { PaymentService } from '../services/payment.service';
import { CacheService } from '../services/cache.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/status', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const cacheKey = \`sub:status:\${userId}\`;

  const cached = await CacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  });

  const result = { active: !!subscription, plan: subscription?.planTier || 'FREE' };
  await CacheService.set(cacheKey, result, 300);
  return res.json(result);
});

router.post('/create-checkout', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const { priceId } = req.body;
  const session = await PaymentService.createCheckoutSession(
    req.user!.userId,
    priceId,
    'http://localhost:3000/success',
    'http://localhost:3000/cancel'
  );
  return res.json({ checkoutUrl: session.url });
});

export const subscriptionRouter = router;
`);

  writeSampleFile(baseDir, 'src/middlewares/errorHandler.ts', `
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    statusCode: status
  });
};
`);

  writeSampleFile(baseDir, 'tests/auth.test.ts', `
import bcrypt from 'bcryptjs';

describe('Auth Security Module', () => {
  test('Password hashing produces secure hash different from plaintext', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toEqual(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});
`);

  writeSampleFile(baseDir, 'README.md', `
# SaaS Subscription & Billing Platform

A modern TypeScript + Node.js + Express backend service utilizing Prisma ORM, Stripe API, Redis caching, and JWT authentication.
`);
}

function initFastApiSample(baseDir) {
  writeSampleFile(baseDir, 'requirements.txt', `
fastapi>=0.104.1
uvicorn>=0.24.0
sqlalchemy>=2.0.23
alembic>=1.13.0
pydantic>=2.5.2
pyjwt>=2.8.0
passlib[bcrypt]>=1.7.4
celery>=5.3.6
redis>=5.0.1
pytest>=7.4.3
httpx>=0.25.2
`);

  writeSampleFile(baseDir, 'app/main.py', `
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, analytics

app = FastAPI(
    title="AI Analytics Platform API",
    description="Asynchronous machine learning and dataset analytics microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Analytics"}
`);

  writeSampleFile(baseDir, 'app/core/security.py', `
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "fastapi-secret-key-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
`);

  writeSampleFile(baseDir, 'app/db/models.py', `
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Integer, default=1)
    datasets = relationship("Dataset", back_populates="owner")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)
    row_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="datasets")
    jobs = relationship("AnalysisJob", back_populates="dataset")

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    status = Column(String(30), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    score = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    dataset = relationship("Dataset", back_populates="jobs")
`);

  writeSampleFile(baseDir, 'app/tasks/celery_app.py', `
from celery import Celery
import os
import time

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("analytics_worker", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task
def process_dataset_ml_task(dataset_id: int):
    # Simulate heavy machine learning computation
    time.sleep(2)
    return {
        "dataset_id": dataset_id,
        "status": "COMPLETED",
        "accuracy": 0.942,
        "anomalies_detected": 3
    }
`);

  writeSampleFile(baseDir, 'app/api/v1/endpoints/analytics.py', `
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.tasks.celery_app import process_dataset_ml_task

router = APIRouter()

class JobResponse(BaseModel):
    job_id: str
    status: str
    dataset_id: int

@router.post("/trigger", response_model=JobResponse)
def trigger_analysis(dataset_id: int):
    task = process_dataset_ml_task.delay(dataset_id)
    return JobResponse(
        job_id=str(task.id),
        status="QUEUED",
        dataset_id=dataset_id
    )

@router.get("/status/{job_id}")
def check_job_status(job_id: str):
    from celery.result import AsyncResult
    from app.tasks.celery_app import celery_app
    res = AsyncResult(job_id, app=celery_app)
    return {
        "job_id": job_id,
        "status": res.status,
        "result": res.result if res.ready() else None
    }
`);

  writeSampleFile(baseDir, 'app/api/v1/endpoints/auth.py', `
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
def register(user_in: UserRegister):
    hashed = get_password_hash(user_in.password)
    token = create_access_token({"sub": user_in.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin):
    token = create_access_token({"sub": user_in.email})
    return {"access_token": token, "token_type": "bearer"}
`);

  writeSampleFile(baseDir, 'tests/test_analytics.py', `
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
`);

  writeSampleFile(baseDir, 'README.md', `
# Python AI Analytics Service

A Python FastAPI microservice utilizing Celery background tasks, SQLAlchemy ORM models, and JWT token authentication.
`);
}
