// src/components/PendingOrders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Use your configured axios instance
import './PendingOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const PendingOrders = () => {
    const [orders, setOrders] = useState([]);
    const [deadline, setDeadline] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [deadlineError, setDeadlineError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setSyncLoading(true);
                setError(null);
                
                // First sync with order system using the api instance
                await api.get('/tasks/sync-orders');
                
                // Then fetch pending orders using the api instance
                const response = await api.get('/tasks/orders');
                setOrders(response.data.filter(order => 
                    order.customerApproval === "Pending" && 
                    order.originalOrderStatus === "processing"
                ));
            } catch (error) {
                console.error("Error fetching orders:", error);
                setError("Failed to load pending orders");
            } finally {
                setSyncLoading(false);
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getTwoWeeksFromNow = () => {
        const now = new Date();
        const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return twoWeeks.toISOString().slice(0, 16); // Format for datetime-local input
    };

    const handleGenerateTasks = async (orderId) => {
        if (!deadline) {
            setDeadlineError('Please select a deadline.');
            return;
        }

        const selectedDeadline = new Date(deadline);
        const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        if (selectedDeadline < twoWeeksFromNow) {
            setDeadlineError('Deadline must be at least two weeks from now.');
            return;
        }

        try {
            const orderToProcess = orders.find(order => order.orderId === orderId);
            if (!orderToProcess) {
                throw new Error('Order not found');
            }

            // Use api instance for the POST request
            const response = await api.post('/tasks/preview-tasks', {
                orderId: orderId,
                orderData: orderToProcess,
                deadline: deadline,
            });

            navigate('/taskpreview', { 
                state: { 
                    tasks: response.data, 
                    orderId: orderId 
                } 
            });
        } catch (error) {
            console.error("Error generating tasks:", error);
            setDeadlineError(error.response?.data?.message || 'Failed to generate tasks');
        }
    };

    if (isLoading) return <div>Loading orders...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <ProgressNavBar />
            <div className="pending-orders-container">
                <h2>Pending Orders</h2>
                {syncLoading && <p>Syncing with order system...</p>}
                
                {orders.length === 0 ? (
                    <p>No pending orders requiring task generation.</p>
                ) : (
                    <ul className="orders-list">
                        {orders.map(order => (
                            <li key={order._id} className="order-item">
                                <div className="order-info">
                                    <strong>Order ID:</strong> {order.orderId}
                                    <div className="deadline-section">
                                        <label>Production Deadline:</label>
                                        <input
                                            type="datetime-local"
                                            value={selectedOrderId === order.orderId ? deadline : getTwoWeeksFromNow()}
                                            onChange={(e) => {
                                                setSelectedOrderId(order.orderId);
                                                setDeadline(e.target.value);
                                                setDeadlineError('');
                                            }}
                                            min={getTwoWeeksFromNow()}
                                        />
                                    </div>
                                    {selectedOrderId === order.orderId && deadlineError && (
                                        <p className="error-message">{deadlineError}</p>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleGenerateTasks(order.orderId)}
                                    className="generate-button"
                                >
                                    Generate Production Plan
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default PendingOrders;