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
