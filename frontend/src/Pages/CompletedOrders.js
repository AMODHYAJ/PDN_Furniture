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
  page: { padding: 30 },
  header: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
  subHeader: { fontSize: 16, marginBottom: 20 },
  section: { marginBottom: 10 },
  table: { display: 'flex', width: '100%', marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeader: { width: '25%', fontWeight: 'bold', padding: 5 },
  tableCell: { width: '25%', padding: 5 },
  summary: { marginTop: 20 }
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
        <div className="completed-orders-container">
            <ProgressNavBar />
            <div className="loading-spinner">
                <div className="spinner"></div>
                Loading completed orders...
            </div>
        </div>
    );

    if (error) return (
        <div className="completed-orders-container">
            <ProgressNavBar />
            <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
            </div>
        </div>
    );

    return (
        <>
            <ProgressNavBar />
            <div className="completed-orders-container">
                <div className="header-section">
                    <h2>Completed Orders</h2>
                    <div className="stats-summary">
                        <span className="stat-item">
                            <span className="stat-value">{orders.length}</span>
                            <span className="stat-label">Total Orders</span>
                        </span>
                    </div>
                </div>

                {selectedOrder ? (
                    <div className="report-preview-container">
                        <div className="report-header">
                            <h3>Production Report - Order #{selectedOrder.orderId}</h3>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="back-button"
                            >
                                ← Back to List
                            </button>
                        </div>

                        <div className="report-content">
                            <div className="report-summary-card">
                                <div className="summary-item">
                                    <span className="summary-label">Total Time</span>
                                    <span className="summary-value">{selectedOrder.totalEstimatedTime} hours</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Priority</span>
                                    <span className="summary-value">{selectedOrder.priorityLevel}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Risk Level</span>
                                    <span className="summary-value">{selectedOrder.riskLevel}</span>
                                </div>
                            </div>

                            <div className="tasks-table-container">
                                <table className="tasks-table">
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
                                                    <span className={`status-badge ${task.status.toLowerCase()}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td>{task.estimatedTime}</td>
                                                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="report-actions">
                                <PDFDownloadLink
                                    document={<ProductionReportPDF order={selectedOrder} />}
                                    fileName={`production_report_${selectedOrder.orderId}.pdf`}
                                    className="pdf-download-button"
                                >
                                    {({ loading }) => (
                                        loading ? 'Generating PDF...' : 'Export PDF Report'
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="orders-list-container">
                        {orders.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <h3>No Completed Orders</h3>
                                <p>All completed orders will appear here</p>
                            </div>
                        ) : (
                            <div className="orders-grid">
                                {orders.map(order => (
                                    <div key={order._id} className="order-card">
                                        <div className="card-header">
                                            <span className="order-id">Order #{order.orderId}</span>
                                            <span className={`priority-badge ${order.priorityLevel.toLowerCase()}`}>
                                                {order.priorityLevel}
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            <div className="order-meta">
                                                <div className="meta-item">
                                                    <span className="meta-label">Total Time</span>
                                                    <span className="meta-value">{order.totalEstimatedTime} hours</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <button
                                                className="view-report-button"
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