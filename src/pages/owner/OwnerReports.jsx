import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const OwnerReports = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOwnerOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (filteredOrders) => {
    const orders = Array.isArray(filteredOrders) ? filteredOrders : [];
    
    const totalRevenue = orders.reduce((sum, order) => {
      const amount = order?.total_amount;
      const numericAmount = amount ? parseFloat(amount) : 0;
      return sum + (isNaN(numericAmount) ? 0 : numericAmount);
    }, 0);

    return {
      total_orders: orders.length,
      total_revenue: totalRevenue,
      pending: orders.filter(o => o?.status === 'pending').length,
      completed: orders.filter(o => o?.status === 'delivered').length,
      in_progress: orders.filter(o => o?.status === 'in_progress').length,
      confirmed: orders.filter(o => o?.status === 'confirmed').length,
      ready: orders.filter(o => o?.status === 'ready').length,
      cancelled: orders.filter(o => o?.status === 'cancelled').length
    };
  };

  const getFilteredOrders = () => {
    const selectedDate = new Date(date);
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      
      if (reportType === 'daily') {
        return orderDate.toDateString() === selectedDate.toDateString();
      } else if (reportType === 'weekly') {
        const weekAgo = new Date(selectedDate);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo && orderDate <= selectedDate;
      } else if (reportType === 'monthly') {
        return orderDate.getMonth() === selectedDate.getMonth() &&
               orderDate.getFullYear() === selectedDate.getFullYear();
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const stats = calculateStats(filteredOrders);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return 'LKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-red-100', text: 'text-red-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
      ready: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ready' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  // PDF Download Function - FIXED for jspdf@4.2.0
  const downloadPDF = () => {
    try {
      console.log('📥 Generating PDF...');
      const doc = new jsPDF();
      
      // Add logo and title
      doc.setFontSize(22);
      doc.setTextColor(43, 238, 108);
      doc.text('Cleanzy Mart', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`${reportType.toUpperCase()} REPORT`, 105, 30, { align: 'center' });
      
      // Report date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const reportDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Date: ${reportDate}`, 105, 38, { align: 'center' });
      
      // Statistics section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary Statistics', 14, 50);
      
      const statsData = [
        ['Total Orders', stats.total_orders.toString()],
        ['Total Revenue', formatCurrency(stats.total_revenue)],
        ['Pending', stats.pending.toString()],
        ['In Progress', stats.in_progress.toString()],
        ['Completed', stats.completed.toString()],
        ['Confirmed', stats.confirmed.toString()],
        ['Ready', stats.ready.toString()],
        ['Cancelled', stats.cancelled.toString()]
      ];
      
      // Use autoTable function
      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Value']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [43, 238, 108], textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { left: 14, right: 14 },
      });

      // Orders table
      const tableColumn = ["Order ID", "Customer", "Service", "Amount", "Status", "Date"];
      const tableRows = filteredOrders.map(order => [
        order.order_number || 'N/A',
        order.customer_name || 'N/A',
        order.service_name || 'N/A',
        formatCurrency(order.total_amount),
        order.status || 'N/A',
        apiUtils.formatDate(order.created_at)
      ]);

      // Get the last Y position
      const lastY = doc.lastAutoTable?.finalY || 55;

      doc.text('Order Details', 14, lastY + 10);
      
      autoTable(doc, {
        startY: lastY + 15,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [43, 238, 108], textColor: [0, 0, 0] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 }
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `cleanzy-mart-${reportType}-report-${date}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully!');
      console.log('✅ PDF saved as:', fileName);
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      toast.error('Failed to generate PDF: ' + error.message);
    }
  };

  // Print function
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cleanzy Mart - ${reportType.toUpperCase()} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2bee6c; padding-bottom: 20px; }
            .logo { color: #2bee6c; font-size: 32px; font-weight: bold; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
            .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .stat-label { color: #666; font-size: 14px; margin-bottom: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2bee6c; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background: #2bee6c; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2bee6c; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Print Report</button>
          </div>
          
          <div class="header">
            <div class="logo">Cleanzy Mart</div>
            <h1 style="margin-top: 20px;">${reportType.toUpperCase()} REPORT</h1>
            <p style="color: #666;">${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">${stats.total_orders}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">${formatCurrency(stats.total_revenue)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pending</div>
              <div class="stat-value" style="color: #ef4444;">${stats.pending}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Completed</div>
              <div class="stat-value" style="color: #10b981;">${stats.completed}</div>
            </div>
          </div>
          
          <h2 style="margin-top: 40px;">Order Details</h2>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.order_number}</td>
                  <td>${order.customer_name || 'N/A'}</td>
                  <td>${order.service_name || 'N/A'}</td>
                  <td><strong>${formatCurrency(order.total_amount)}</strong></td>
                  <td>${order.status || 'N/A'}</td>
                  <td>${apiUtils.formatDate(order.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bee6c]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/owner-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <span>🖨️</span> Print
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-[#2bee6c] text-white rounded-lg hover:bg-[#25d45f] flex items-center gap-2"
          >
            <span>📥</span> Download PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
        >
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
        </select>
        
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2bee6c]/50"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{stats.total_orders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-[#2bee6c]">{formatCurrency(stats.total_revenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold">Order Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.order_number}</td>
                  <td className="px-6 py-4">{order.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4">{order.service_name || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-[#2bee6c]">{formatCurrency(order.total_amount)}</td>
                  <td className="px-6 py-4">{order.status || 'N/A'}</td>
                  <td className="px-6 py-4">{apiUtils.formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerReports;