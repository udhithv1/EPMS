# Employee Payroll Management System

A complete academic Java 21 / Spring Boot 3 application for HR employee management and payroll processing.

## Features

- HTTP Basic authentication with a BCrypt-hashed development admin account.
- Responsive dashboard, employee CRUD, search, validation, duplicate ID protection, and delete confirmation.
- Centralized salary calculator: HRA 20%, DA 10%, TA 5%, PF 12%; tax is 5% below ₹50,000 gross and 10% otherwise.
- Duplicate-safe monthly payroll generation, net/gross calculations, payslip PDF download, and audit trail.
- JPA persistence with H2 file database by default and MySQL-compatible configuration.
- JUnit/Mockito tests for salary calculation and employee behavior.

## Run locally

Prerequisites: Java 21 and Maven 3.9+.

```bash
mvn spring-boot:run
```

Open `http://localhost:8080` and sign in with `admin` / `admin123`. For Windows PowerShell use the same Maven command from the project directory. Override the development password with `PAYROLL_ADMIN_PASSWORD`.

## MySQL configuration

Create a database named `payroll_db`, then run with:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:mysql://localhost:3306/payroll_db --spring.datasource.username=root --spring.datasource.password=YOUR_PASSWORD --spring.jpa.hibernate.ddl-auto=update"
```

`src/main/resources/schema.sql` contains the core employee schema. Hibernate creates the remaining tables and indexes from the entities.

## API summary

All endpoints except `/api/auth/status` require Basic Auth.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/employees?q=` | Employee list/search |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/payroll` | Payroll records |
| POST | `/api/payroll?employeeId=1&month=9&year=2026` | Generate payroll |
| GET | `/api/payslips/{id}/pdf` | Download PDF payslip |
| GET | `/api/audit-logs` | Audit log list |

## Project structure

`model` contains JPA entities, `repository` contains persistence interfaces, `service` contains business rules, `controller` contains REST endpoints, `config` contains security and seed configuration, and `src/main/resources/static` contains the frontend.

## Tests

```bash
mvn test
```

The app intentionally defaults to H2 so it is demonstrable immediately; use the MySQL command above for a production-like database. Sample data uses fictional `.test` email addresses.
