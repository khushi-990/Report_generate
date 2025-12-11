'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import axios from 'axios';

interface Material {
  id: string;
  material: string;
  tests: string[];
  quantities: number[];
  rates: number[];
  ratesWithST: number[];
}

interface FormData {
  _id?: string;
  clientCode: string;
  jobNo: string;
  date: string;
  reportDate: string;
  clientName: string;
  address: string;
  gstNo: string;
  city: string;
  contactName: string;
  contactNo: string;
  nameOfWork: string;
  materials: Material[];
  discount: number;
  sgst: number;
  cgst: number;
  reportNo: string;
  client: string;
  refNo: string;
  userDownloadedPdf?: boolean;
}

export default function ReportForm() {
  const [rows, setRows] = useState<FormData[]>([
    {
      clientCode: '',
      jobNo: '',
      date: '',
      reportDate: '',
      clientName: '',
      address: '',
      gstNo: '',
      city: '',
      contactName: '',
      contactNo: '',
      nameOfWork: '',
      materials: [{ id: '1', material: '', tests: [], quantities: [], rates: [], ratesWithST: [] }],
      discount: 20,
      sgst: 9,
      cgst: 9,
      reportNo: '',
      client: '',
      refNo: '',
      userDownloadedPdf: false,
    },
  ]);

  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [configLoaded, setConfigLoaded] = useState(false);
  const prevTotalPagesRef = useRef(1);
  const [viewPdfId, setViewPdfId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      await fetchPaginationConfig();
      setConfigLoaded(true);
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (configLoaded) {
      fetchReports();
    }
  }, [sortBy, sortOrder, configLoaded]);

  useEffect(() => {
    if (configLoaded && pageSize > 0) {
      const calculatedPages = rows.length > 0 ? Math.ceil(rows.length / pageSize) : 1;
      setTotalPages((prevPages) => {
        if (prevPages !== calculatedPages) {
          return calculatedPages;
        }
        return prevPages;
      });
    }
  }, [rows.length, pageSize, configLoaded]);

  useEffect(() => {
    if (configLoaded && totalPages > 0) {
      const prevTotalPages = prevTotalPagesRef.current;
      if (prevTotalPages > 0 && prevTotalPages !== totalPages) {
        prevTotalPagesRef.current = totalPages;
        setCurrentPage((prevCurrentPage) => {
          if (prevCurrentPage > totalPages && totalPages > 0) {
            return totalPages;
          }
          return prevCurrentPage;
        });
      } else if (prevTotalPages === 0) {
        prevTotalPagesRef.current = totalPages;
      }
    }
  }, [totalPages, configLoaded]);

  const fetchPaginationConfig = async () => {
    try {
      const response = await axios.get('http://localhost:3001/config/pagination');
      if (response.data && response.data.pageSize !== undefined) {
        const newPageSize = Number(response.data.pageSize);
        if (newPageSize > 0 && newPageSize !== pageSize) {
          setPageSize(newPageSize);
          if (!configLoaded) {
            setCurrentPage(Number(response.data.currentPage) || 1);
          } else {
            setCurrentPage((prevCurrentPage) => {
              const newTotalPages = Math.ceil(rows.length / newPageSize);
              if (prevCurrentPage > newTotalPages && newTotalPages > 0) {
                return newTotalPages;
              }
              return prevCurrentPage;
            });
          }
        } else if (!configLoaded && response.data.currentPage !== undefined) {
          setCurrentPage(Number(response.data.currentPage) || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching pagination config:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      const response = await axios.get(`http://localhost:3001/pdf/reports?${params.toString()}`);
      if (response.data && response.data.length > 0) {
        setRows((prevRows) => {
          const newRows = response.data;
          if (prevRows.length !== newRows.length) {
            const newTotalPages = Math.ceil(newRows.length / pageSize);
            setCurrentPage((prevCurrentPage) => {
              if (prevCurrentPage > newTotalPages && newTotalPages > 0) {
                return newTotalPages;
              }
              return prevCurrentPage;
            });
          }
          return newRows;
        });
      } else {
        setRows([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const toggleEditMode = (rowIndex: number) => {
    setEditMode((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const isRowEditable = (row: FormData, rowIndex: number) => {
    if (!row.userDownloadedPdf) return true;
    return editMode[rowIndex] === true;
  };

  const addRow = () => {
    setRows([
      {
        clientCode: '',
        jobNo: '',
        date: '',
        reportDate: '',
        clientName: '',
        address: '',
        gstNo: '',
        city: '',
        contactName: '',
        contactNo: '',
        nameOfWork: '',
        materials: [{ id: Date.now().toString(), material: '', tests: [], quantities: [], rates: [], ratesWithST: [] }],
        discount: 20,
        sgst: 9,
        cgst: 9,
        reportNo: '',
        client: '',
        refNo: '',
        userDownloadedPdf: false,
      },
      ...rows,
    ]);
    setCurrentPage(1);
  };

  const updateRow = (index: number, field: keyof FormData, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const updateMaterial = (rowIndex: number, materialIndex: number, field: string, value: any) => {
    const newRows = [...rows];
    if (field === 'material') {
      newRows[rowIndex].materials[materialIndex].material = value;
    }
    setRows(newRows);
  };

  const addMaterial = (rowIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex].materials.push({
      id: Date.now().toString(),
      material: '',
      tests: [],
      quantities: [],
      rates: [],
      ratesWithST: [],
    });
    setRows(newRows);
  };

  const removeMaterial = (rowIndex: number, materialIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex].materials.splice(materialIndex, 1);
    setRows(newRows);
  };

  const addTest = (rowIndex: number, materialIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex].materials[materialIndex].tests.push('');
    newRows[rowIndex].materials[materialIndex].quantities.push(1);
    newRows[rowIndex].materials[materialIndex].rates.push(0);
    newRows[rowIndex].materials[materialIndex].ratesWithST.push(0);
    setRows(newRows);
  };

  const updateTest = (rowIndex: number, materialIndex: number, testIndex: number, field: string, value: any) => {
    const newRows = [...rows];
    if (field === 'test') {
      newRows[rowIndex].materials[materialIndex].tests[testIndex] = value;
    } else if (field === 'qty') {
      newRows[rowIndex].materials[materialIndex].quantities[testIndex] = parseFloat(value) || 0;
    } else if (field === 'rate') {
      newRows[rowIndex].materials[materialIndex].rates[testIndex] = parseFloat(value) || 0;
    } else if (field === 'rateWithST') {
      newRows[rowIndex].materials[materialIndex].ratesWithST[testIndex] = parseFloat(value) || 0;
    }
    setRows(newRows);
  };

  const removeTest = (rowIndex: number, materialIndex: number, testIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex].materials[materialIndex].tests.splice(testIndex, 1);
    newRows[rowIndex].materials[materialIndex].quantities.splice(testIndex, 1);
    newRows[rowIndex].materials[materialIndex].rates.splice(testIndex, 1);
    newRows[rowIndex].materials[materialIndex].ratesWithST.splice(testIndex, 1);
    setRows(newRows);
  };

  const handleRowComplete = async (rowIndex: number) => {
    const row = rows[rowIndex];
    const confirmed = window.confirm('Are you sure you want to generate the report for this row?');
    
    if (confirmed) {
      await generatePdfForRow(row, rowIndex);
    }
  };

  const generatePdfForRow = async (rowData: FormData, rowIndex: number) => {
    try {
      const payload = {
        ...rowData,
        date: rowData.date || new Date().toISOString().split('T')[0],
        reportDate: rowData.reportDate || new Date().toISOString().split('T')[0],
      };

      const response = await axios.post('http://localhost:3001/pdf/generate', payload, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${rowData.jobNo || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      await fetchReports();
      setEditMode((prev) => {
        const newMode = { ...prev };
        delete newMode[rowIndex];
        return newMode;
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRowExpansion = (rowIndex: number) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  const getPaginatedRows = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return rows.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRow(null);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return '⇅';
    }
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleDeleteClick = (reportId: string) => {
    setDeleteConfirmId(reportId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      await axios.delete(`http://localhost:3001/pdf/reports/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmId) {
        setDeleteConfirmId(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [deleteConfirmId]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ padding: '20px', overflowX: 'auto' }}>
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={addRow}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
        >
          Add New Row
        </button>
      </div>

      <div style={{ border: '1px solid #d0d0d0', overflow: 'auto', backgroundColor: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #d0d0d0' }}>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '50px' }}>#</th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('clientCode')}
              >
                Client Code {getSortIcon('clientCode')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('jobNo')}
              >
                Job No {getSortIcon('jobNo')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('date')}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('reportDate')}
              >
                Report Date {getSortIcon('reportDate')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '150px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('clientName')}
              >
                Client Name {getSortIcon('clientName')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '150px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('address')}
              >
                Address {getSortIcon('address')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('gstNo')}
              >
                GST No {getSortIcon('gstNo')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('city')}
              >
                City {getSortIcon('city')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '120px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('contactName')}
              >
                Contact Name {getSortIcon('contactName')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('contactNo')}
              >
                Contact No {getSortIcon('contactNo')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '150px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('nameOfWork')}
              >
                Name of Work {getSortIcon('nameOfWork')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '100px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('reportNo')}
              >
                Report No {getSortIcon('reportNo')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '80px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('discount')}
              >
                Discount % {getSortIcon('discount')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '80px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('sgst')}
              >
                SGST % {getSortIcon('sgst')}
              </th>
              <th 
                style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '80px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('cgst')}
              >
                CGST % {getSortIcon('cgst')}
              </th>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'left', fontWeight: 'bold', minWidth: '120px' }}>Materials</th>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'center', fontWeight: 'bold', minWidth: '80px' }}>Edit</th>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'center', fontWeight: 'bold', minWidth: '100px' }}>Complete</th>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'center', fontWeight: 'bold', minWidth: '80px' }}>View PDF</th>
              <th style={{ border: '1px solid #d0d0d0', padding: '8px', textAlign: 'center', fontWeight: 'bold', minWidth: '80px' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedRows().map((row, localIndex) => {
              const rowIndex = (currentPage - 1) * pageSize + localIndex;
              const editable = isRowEditable(row, rowIndex);
              return (
                <React.Fragment key={row._id || rowIndex}>
                <tr style={{ backgroundColor: localIndex % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>{rowIndex + 1}</td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.clientCode}
                onChange={(e) => updateRow(rowIndex, 'clientCode', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.jobNo}
                onChange={(e) => updateRow(rowIndex, 'jobNo', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="date"
                value={row.date}
                onChange={(e) => updateRow(rowIndex, 'date', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="date"
                value={row.reportDate}
                onChange={(e) => updateRow(rowIndex, 'reportDate', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.clientName}
                onChange={(e) => updateRow(rowIndex, 'clientName', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.address}
                onChange={(e) => updateRow(rowIndex, 'address', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.gstNo}
                onChange={(e) => updateRow(rowIndex, 'gstNo', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.city}
                onChange={(e) => updateRow(rowIndex, 'city', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.contactName}
                onChange={(e) => updateRow(rowIndex, 'contactName', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.contactNo}
                onChange={(e) => updateRow(rowIndex, 'contactNo', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.nameOfWork}
                onChange={(e) => updateRow(rowIndex, 'nameOfWork', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="text"
                value={row.reportNo}
                onChange={(e) => updateRow(rowIndex, 'reportNo', e.target.value)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="number"
                value={row.discount}
                onChange={(e) => updateRow(rowIndex, 'discount', parseFloat(e.target.value) || 0)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="number"
                value={row.sgst}
                onChange={(e) => updateRow(rowIndex, 'sgst', parseFloat(e.target.value) || 0)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
              />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '0' }}>
              <input
                type="number"
                value={row.cgst}
                onChange={(e) => updateRow(rowIndex, 'cgst', parseFloat(e.target.value) || 0)}
                      readOnly={!editable}
                      style={{ width: '100%', border: 'none', padding: '6px', outline: 'none', backgroundColor: editable ? 'transparent' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleRowExpansion(rowIndex)}
                      style={{ padding: '4px 8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      {expandedRow === rowIndex ? 'Hide' : 'Edit'}
                    </button>
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>
                    {row.userDownloadedPdf && !editMode[rowIndex] ? (
                      <button
                        onClick={() => toggleEditMode(rowIndex)}
                        style={{ padding: '6px 12px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Edit
                      </button>
                    ) : row.userDownloadedPdf && editMode[rowIndex] ? (
                      <button
                        onClick={() => toggleEditMode(rowIndex)}
                        style={{ padding: '6px 12px', backgroundColor: '#9E9E9E', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRowComplete(rowIndex)}
                      disabled={row.userDownloadedPdf && !editMode[rowIndex]}
                      style={{ padding: '6px 12px', backgroundColor: row.userDownloadedPdf && !editMode[rowIndex] ? '#cccccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: row.userDownloadedPdf && !editMode[rowIndex] ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Complete
                    </button>
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>
                    {row.userDownloadedPdf && row._id ? (
                      <button
                        onClick={() => setViewPdfId(row._id!)}
                        style={{ padding: '6px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
                        title="View PDF"
                      >
                        <span style={{ fontSize: '14px' }}>👁️</span> View
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #d0d0d0', padding: '6px', textAlign: 'center' }}>
                    {row._id ? (
                      <button
                        onClick={() => handleDeleteClick(row._id!)}
                        style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        title="Delete"
                      >
                        Delete
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                </tr>
                {expandedRow === rowIndex && (
                  <tr>
                    <td colSpan={21} style={{ border: '1px solid #d0d0d0', padding: '15px', backgroundColor: '#fafafa' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Materials:</h4>
            {row.materials.map((material, materialIndex) => (
                          <div key={material.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', marginRight: '5px' }}>Material:</label>
                    <input
                      type="text"
                      value={material.material}
                                  onChange={(e) => updateMaterial(rowIndex, materialIndex, 'material', e.target.value)}
                                  readOnly={!editable}
                                  style={{ width: '200px', padding: '4px', border: '1px solid #ccc', borderRadius: '3px', backgroundColor: editable ? 'white' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                    />
                  </div>
                              {editable && (
                  <button
                    onClick={() => removeMaterial(rowIndex, materialIndex)}
                                  style={{ padding: '4px 8px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Remove
                  </button>
                              )}
                </div>
                
                <div style={{ marginTop: '10px' }}>
                              {editable && (
                  <button
                    onClick={() => addTest(rowIndex, materialIndex)}
                                  style={{ padding: '4px 8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginBottom: '10px', fontSize: '12px' }}
                  >
                    Add Test
                  </button>
                              )}
                  
                  {material.tests.map((test, testIndex) => (
                                <div key={testIndex} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Test Name"
                        value={test}
                        onChange={(e) => updateTest(rowIndex, materialIndex, testIndex, 'test', e.target.value)}
                                    readOnly={!editable}
                                    style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', backgroundColor: editable ? 'white' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={material.quantities[testIndex] || ''}
                        onChange={(e) => updateTest(rowIndex, materialIndex, testIndex, 'qty', e.target.value)}
                                    readOnly={!editable}
                                    style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', backgroundColor: editable ? 'white' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={material.rates[testIndex] || ''}
                        onChange={(e) => updateTest(rowIndex, materialIndex, testIndex, 'rate', e.target.value)}
                                    readOnly={!editable}
                                    style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', backgroundColor: editable ? 'white' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                      />
                      <input
                        type="number"
                        placeholder="Rate (inc. ST)"
                        value={material.ratesWithST[testIndex] || ''}
                        onChange={(e) => updateTest(rowIndex, materialIndex, testIndex, 'rateWithST', e.target.value)}
                                    readOnly={!editable}
                                    style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', backgroundColor: editable ? 'white' : '#f5f5f5', cursor: editable ? 'text' : 'not-allowed' }}
                      />
                                  {editable && (
                      <button
                        onClick={() => removeTest(rowIndex, materialIndex, testIndex)}
                                      style={{ padding: '4px 8px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                                  )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
                        {editable && (
            <button
              onClick={() => addMaterial(rowIndex)}
                            style={{ padding: '6px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
            >
              Add Material
            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {viewPdfId && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setViewPdfId(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                width: '90%',
                height: '90%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>PDF Preview</h3>
                <button
                  onClick={() => setViewPdfId(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Close
                </button>
              </div>
              <iframe
                src={`http://localhost:3001/pdf/view/${viewPdfId}`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="PDF Preview"
              />
            </div>
          </div>
        )}

        {deleteConfirmId && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={handleDeleteCancel}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                Confirm Delete
              </h3>
              <p style={{ margin: '0 0 30px 0', fontSize: '14px', color: '#666' }}>
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={handleDeleteCancel}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, rows.length)} of {rows.length} entries
          </div>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === 1 ? '#cccccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === 1 ? '#cccccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
            >
              Previous
            </button>
            
            {getPageNumbers().map((page) => (
          <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentPage === page ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: currentPage === page ? 'bold' : 'normal',
                }}
              >
                {page}
          </button>
      ))}

        <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === totalPages ? '#cccccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
        >
              Next
        </button>
        <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                backgroundColor: currentPage === totalPages ? '#cccccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px',
              }}
        >
              Last
        </button>
      </div>
        </div>
      )}
    </div>
  );
}
