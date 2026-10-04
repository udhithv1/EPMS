package com.payroll.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="payroll", uniqueConstraints=@UniqueConstraint(name="uk_employee_period", columnNames={"employee_id","pay_month","pay_year"}))
public class Payroll {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional=false,fetch=FetchType.EAGER) @JoinColumn(name="employee_id") private Employee employee;
  @Column(name="pay_month",nullable=false) private int month; @Column(name="pay_year",nullable=false) private int year;
  @Column(precision=12,scale=2) private BigDecimal basicSalary,hra,da,ta,grossSalary,pf,tax,netSalary;
  private LocalDateTime generatedAt;
  public Payroll(){} public Long getId(){return id;} public Employee getEmployee(){return employee;} public void setEmployee(Employee v){employee=v;} public int getMonth(){return month;} public void setMonth(int v){month=v;} public int getYear(){return year;} public void setYear(int v){year=v;} public BigDecimal getBasicSalary(){return basicSalary;} public void setBasicSalary(BigDecimal v){basicSalary=v;} public BigDecimal getHra(){return hra;} public void setHra(BigDecimal v){hra=v;} public BigDecimal getDa(){return da;} public void setDa(BigDecimal v){da=v;} public BigDecimal getTa(){return ta;} public void setTa(BigDecimal v){ta=v;} public BigDecimal getGrossSalary(){return grossSalary;} public void setGrossSalary(BigDecimal v){grossSalary=v;} public BigDecimal getPf(){return pf;} public void setPf(BigDecimal v){pf=v;} public BigDecimal getTax(){return tax;} public void setTax(BigDecimal v){tax=v;} public BigDecimal getNetSalary(){return netSalary;} public void setNetSalary(BigDecimal v){netSalary=v;} public LocalDateTime getGeneratedAt(){return generatedAt;} public void setGeneratedAt(LocalDateTime v){generatedAt=v;}
}