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
