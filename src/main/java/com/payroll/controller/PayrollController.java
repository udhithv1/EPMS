package com.payroll.controller;

import com.payroll.model.*;
import com.payroll.repository.EmployeeRepository;
import com.payroll.service.*;
import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PayrollController {
  private final EmployeeService employees; private final PayrollService payroll; private final AuditService audit; private final EmployeeRepository employeeRepo;
  public PayrollController(EmployeeService e, PayrollService p, AuditService a, EmployeeRepository r){employees=e;payroll=p;audit=a;employeeRepo=r;}
  @GetMapping("/auth/status") public Map<String,Object> status(Principal p){return Map.of("authenticated",p!=null,"username",p==null?"":p.getName());}
  @GetMapping("/employees") public List<Employee> employees(@RequestParam(required=false) String q){return employees.search(q);}
  @GetMapping("/employees/{id}") public Employee employee(@PathVariable Long id){return employees.get(id);}
  @PostMapping("/employees") public Employee create(@Valid @RequestBody Employee e,Principal p){return employees.create(e,p.getName());}
  @PutMapping("/employees/{id}") public Employee update(@PathVariable Long id,@Valid @RequestBody Employee e,Principal p){return employees.update(id,e,p.getName());}
  @DeleteMapping("/employees/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,Principal p){employees.delete(id,p.getName());}
  @GetMapping("/payroll") public List<Payroll> payroll(){return payroll.all();}
  @PostMapping("/payroll") public Payroll generate(@RequestParam Long employeeId,@RequestParam int month,@RequestParam int year,Principal p){return payroll.generate(employeeId,month,year,p.getName());}
  @GetMapping("/audit-logs") public List<AuditLog> logs(){return audit.all();}
  @GetMapping("/dashboard") public Map<String,Object> dashboard(){int m=LocalDate.now().getMonthValue(),y=LocalDate.now().getYear(); return Map.of("employees",employeeRepo.count(),"departments",employeeRepo.findAll().stream().map(Employee::getDepartment).distinct().count(),"payrollRecords",payroll.all().size(),"monthlyPayroll",payroll.all().stream().filter(x->x.getMonth()==m&&x.getYear()==y).map(Payroll::getNetSalary).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add));}
  @GetMapping("/payslips/{id}/pdf") public ResponseEntity<byte[]> pdf(@PathVariable Long id,Principal principal)throws Exception{
    Payroll p=payroll.get(id); ByteArrayOutputStream out=new ByteArrayOutputStream(); Document doc=new Document(); PdfWriter.getInstance(doc,out); doc.open();
    doc.add(new Paragraph("EMPLOYEE PAYSLIP",FontFactory.getFont(FontFactory.HELVETICA_BOLD,18))); doc.add(new Paragraph("Payroll Management System\n\n"));
    doc.add(new Paragraph("Employee: "+p.getEmployee().getFullName()+" ("+p.getEmployee().getEmployeeCode()+")")); doc.add(new Paragraph("Department: "+p.getEmployee().getDepartment()+" | Designation: "+p.getEmployee().getDesignation())); doc.add(new Paragraph("Period: "+p.getMonth()+"/"+p.getYear()+"\n\n"));
    PdfPTable table=new PdfPTable(2); table.addCell("Component"); table.addCell("Amount"); String[][] rows={{"Basic Salary",p.getBasicSalary().toString()},{"HRA",p.getHra().toString()},{"DA",p.getDa().toString()},{"TA",p.getTa().toString()},{"Gross Salary",p.getGrossSalary().toString()},{"PF",p.getPf().toString()},{"Tax",p.getTax().toString()},{"Net Salary",p.getNetSalary().toString()}}; for(String[] row:rows){table.addCell(row[0]);table.addCell(row[1]);} doc.add(table); doc.add(new Paragraph("\nGenerated: "+p.getGeneratedAt())); doc.close();
    audit.record(principal.getName(),"GENERATE","Payslip",id.toString(),"Generated PDF payslip"); return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=payslip-"+id+".pdf").body(out.toByteArray());
  }
}
