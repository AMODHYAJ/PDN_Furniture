import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import api from '../utils/api';
import './CompletedOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const ProductionReportPDF = ({ order }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Production Report</Text>
        <Text style={styles.subHeader}>Order ID: {order.orderId}</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Task Name</Text>
            <Text style={styles.tableHeader}>Status</Text>
            <Text style={styles.tableHeader}>Time (hrs)</Text>
            <Text style={styles.tableHeader}>Due Date</Text>
          </View>
          
          {order.tasks?.map((task, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{task.taskName}</Text>
              <Text style={styles.tableCell}>{task.status}</Text>
              <Text style={styles.tableCell}>{task.estimatedTime}</Text>
              <Text style={styles.tableCell}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.summary}>
          <Text>Total Estimated Time: {order.totalEstimatedTime} hours</Text>
          <Text>Priority: {order.priorityLevel}</Text>
          <Text>Risk Level: {order.riskLevel}</Text>
          <Text>Completion Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: { 
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: { 
    fontSize: 24, 
    marginBottom: 10, 
    fontWeight: 'bold',
    color: '#3a3a3a',
    fontFamily: 'Times-Bold'
  },
  subHeader: { 
    fontSize: 16, 
    marginBottom: 20,
    color: '#555'
  },
  section: { marginBottom: 10 },
  table: { 
    display: 'flex', 
    width: '100%', 
    marginBottom: 20,
    border: '1px solid #e0d6c2'
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e0d6c2',
    padding: 8
  },
  tableHeader: { 
    width: '25%', 
    fontWeight: 'bold', 
    padding: 5,
    color: '#3a3a3a'
  },
  tableCell: { 
    width: '25%', 
    padding: 5,
    color: '#555'
  },
  summary: { 
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f7f3',
    border: '1px solid #e0d6c2'
  }
});

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/tasks/orders');
        setOrders(response.data.filter(order => order.progress === 100));
      } catch (error) {
        console.error("Error fetching completed orders:", error);
        setError("Failed to load completed orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="luxury-loading">
      <div className="luxury-spinner"></div>
      Loading completed orders...
    </div>
  );
  
  if (error) return (
    <div className="luxury-error-message">
      <span className="luxury-error-icon">⚠️</span>
      Error: {error}
    </div>
  );

  return (
    <>
      <ProgressNavBar />
      <div className="luxury-completed-orders">
        <div className="luxury-header">
          <h1 className="luxury-title">Completed Production</h1>
          <div className="luxury-divider"></div>
          <div className="luxury-stats-summary">
            <span className="luxury-stat-item">
              <span className="luxury-stat-value">{orders.length}</span>
              <span className="luxury-stat-label">Total Orders</span>
            </span>
          </div>
        </div>

        {selectedOrder ? (
          <div className="luxury-report-container">
            <div className="luxury-report-header">
              <h2>Production Report - Order #{selectedOrder.orderId}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="luxury-back-btn"
              >
                ← Back to List
              </button>
            </div>

            <div className="luxury-report-content">
              <div className="luxury-summary-cards">
                <div className="luxury-summary-card">
                  <span className="luxury-summary-label">Total Time</span>
                  <span className="luxury-summary-value">
                    {selectedOrder.totalEstimatedTime} hours
                  </span>
                </div>
                <div className="luxury-summary-card">
                  <span className="luxury-summary-label">Priority</span>
                  <span className="luxury-summary-value">
                    {selectedOrder.priorityLevel}
                  </span>
                </div>
                <div className="luxury-summary-card">
                  <span className="luxury-summary-label">Risk Level</span>
                  <span className="luxury-summary-value">
                    {selectedOrder.riskLevel}
                  </span>
                </div>
              </div>

              <div className="luxury-tasks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Status</th>
                      <th>Time (hrs)</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.tasks?.map((task, index) => (
                      <tr key={index}>
                        <td>{task.taskName}</td>
                        <td>
                          <span className={`luxury-status-badge ${task.status.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </td>
                        <td>{task.estimatedTime}</td>
                        <td>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="luxury-report-actions">
                <PDFDownloadLink
                  document={<ProductionReportPDF order={selectedOrder} />}
                  fileName={`production_report_${selectedOrder.orderId}.pdf`}
                  className="luxury-pdf-btn"
                >
                  {({ loading }) => (
                    loading ? 'Generating PDF...' : 'Export PDF Report'
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="luxury-orders-container">
            {orders.length === 0 ? (
              <div className="luxury-empty-state">
                <div className="luxury-empty-icon">🎉</div>
                <h3>No Completed Orders</h3>
                <p>All completed orders will appear here</p>
              </div>
            ) : (
              <div className="luxury-orders-grid">
                {orders.map(order => (
                  <div key={order._id} className="luxury-order-card">
                    <div className="luxury-card-header">
                      <span className="luxury-order-id">Order #{order.orderId}</span>
                      <span className={`luxury-priority-badge ${order.priorityLevel.toLowerCase()}`}>
                        {order.priorityLevel}
                      </span>
                    </div>
                    <div className="luxury-card-body">
                      <div className="luxury-meta-item">
                        <span className="luxury-meta-label">Total Time</span>
                        <span className="luxury-meta-value">
                          {order.totalEstimatedTime} hours
                        </span>
                      </div>
                    </div>
                    <div className="luxury-card-footer">
                      <button
                        className="luxury-view-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Production Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CompletedOrders;