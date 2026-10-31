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
                <td>${emp.salary}</td>
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
