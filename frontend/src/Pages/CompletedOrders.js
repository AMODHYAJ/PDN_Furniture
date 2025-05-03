// src/components/CompletedOrders.js
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import api from '../utils/api'; // Use configured axios instance
import './CompletedOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";

// PDF Document Component
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

// PDF Styles
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
                
                // Use the api instance instead of axios directly
                const response = await api.get('/tasks/orders');
                setOrders(response.data.filter(order => order.progress === 100));
            } catch (error) {
                console.error("Error fetching completed orders:", error);
                setError("Failed to load completed orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="completed-orders-container">
            <ProgressNavBar />
            <div className="loading-message">Loading completed orders...</div>
        </div>
    );

    if (error) return (
        <div className="completed-orders-container">
            <ProgressNavBar />
            <div className="error-message">{error}</div>
        </div>
    );

    return (
        <>
            <ProgressNavBar />
            <div className="completed-orders-container">
                <h2>Completed Orders</h2>

                {selectedOrder ? (
                    <div className="report-preview">
                        <h3>Production Report Preview - Order #{selectedOrder.orderId}</h3>

                        <div className="report-content">
                            <h4>Tasks Summary</h4>
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
                                            <td>{task.status}</td>
                                            <td>{task.estimatedTime}</td>
                                            <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="report-summary">
                                <p><strong>Total Time:</strong> {selectedOrder.totalEstimatedTime} hours</p>
                                <p><strong>Priority:</strong> {selectedOrder.priorityLevel}</p>
                                <p><strong>Risk Level:</strong> {selectedOrder.riskLevel}</p>
                            </div>

                            <div className="report-actions">
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="back-button"
                                >
                                    Back to List
                                </button>

                                <PDFDownloadLink
                                    document={<ProductionReportPDF order={selectedOrder} />}
                                    fileName={`production_report_${selectedOrder.orderId}.pdf`}
                                    className="pdf-download-button"
                                >
                                    {({ loading }) => (loading ? 'Generating PDF...' : 'Export PDF')}
                                </PDFDownloadLink>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.length === 0 ? (
                            <p className="no-orders-message">No completed orders found</p>
                        ) : (
                            <ul>
                                {orders.map(order => (
                                    <li key={order._id} className="order-item">
                                        <div className="order-details">
                                            <p><span className="detail-label">Order ID:</span> {order.orderId}</p>
                                            <p><span className="detail-label">Priority:</span> {order.priorityLevel}</p>
                                            {order.totalEstimatedTime && (
                                                <p><span className="detail-label">Total Time:</span> {order.totalEstimatedTime} hours</p>
                                            )}
                                            <button
                                                className="report-button"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                Production Report
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default CompletedOrders;