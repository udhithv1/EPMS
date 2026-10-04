package com.payroll.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name="employees", uniqueConstraints=@UniqueConstraint(name="uk_employee_code", columnNames="employee_code"))
public class Employee {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @NotBlank @Pattern(regexp="[A-Z0-9-]{3,20}") @Column(name="employee_code", nullable=false, unique=true) private String employeeCode;
  @NotBlank @Size(min=2,max=120) @Column(nullable=false) private String fullName;
  @NotBlank @Email @Column(nullable=false) private String email;
  @NotBlank @Pattern(regexp="[0-9+()\\- ]{7,20}") @Column(nullable=false) private String phone;
  @NotBlank @Column(nullable=false) private String department;
  @NotBlank @Column(nullable=false) private String designation;
  @NotNull @DecimalMin("1.00") @Column(nullable=false, precision=12,scale=2) private BigDecimal basicSalary;
  @NotNull @Column(nullable=false) private LocalDate joiningDate;
  @Column(nullable=false) private boolean active=true;
  public Employee() {}
  public Employee(String code,String name,String email,String phone,String dept,String desig,BigDecimal salary,LocalDate date){this.employeeCode=code;this.fullName=name;this.email=email;this.phone=phone;this.department=dept;this.designation=desig;this.basicSalary=salary;this.joiningDate=date;}
  public Long getId(){return id;} public String getEmployeeCode(){return employeeCode;} public void setEmployeeCode(String v){employeeCode=v;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;} public String getDepartment(){return department;} public void setDepartment(String v){department=v;} public String getDesignation(){return designation;} public void setDesignation(String v){designation=v;} public BigDecimal getBasicSalary(){return basicSalary;} public void setBasicSalary(BigDecimal v){basicSalary=v;} public LocalDate getJoiningDate(){return joiningDate;} public void setJoiningDate(LocalDate v){joiningDate=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}