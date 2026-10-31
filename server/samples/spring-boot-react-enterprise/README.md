# Enterprise Management Hub

A production-grade enterprise management application built with Spring Boot 3, Spring Security, JWT, PostgreSQL, and React.

## Features
- **Authentication**: JWT token-based authentication with BCrypt password encryption and role-based access control (`ROLE_ADMIN`, `ROLE_USER`).
- **Employee Management**: Comprehensive CRUD operations, search with custom JPQL queries, and pagination.
- **Department Relations**: Entity relationships with `@ManyToOne` and `@OneToMany` mapping.
- **Database Migrations**: Version-controlled Flyway schema migrations (`V1__init_schema.sql`).
- **Exception Handling**: Global centralized exception advice handling validation and not-found scenarios.
