import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Alerts.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const Alerts = () => {
    const [delayedTasks, setDelayedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDelayedTasks = async () => {
            try {
                const response = await api.get('/tasks/delays');
                setDelayedTasks(response.data);
            } catch (error) {
                console.error("Error fetching delayed tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDelayedTasks();
    }, []);

    if (isLoading) {
        return (
            <><ProgressNavBar />
            <div className="alerts-container">
                <div className="loading-spinner"></div>
            </div></>
        );
    }

    if (delayedTasks.length === 0) {
        return (
            <><ProgressNavBar />
            <div className="alerts-container">
                <div className="no-alerts-message">
                    <i className="icon-check"></i>
                    <p>All tasks are on schedule</p>
                </div>
            </div></>
        );
    }

    return (
        <><ProgressNavBar />
        <div className="alerts-container">
            <div className="alerts-header">
                <h2>Delayed Tasks</h2>
                <div className="alert-count">{delayedTasks.length} delayed orders</div>
            </div>
            
            <div className="alert-cards-container">
                {delayedTasks.map(order => (
                    <div key={order._id} className="order-alert-card">
                        <div className="order-header">
                            <h3>Order #{order.orderId}</h3>
                            <span className="status-badge delayed">Delayed</span>
                        </div>
                        
                        <div className="task-list">
                            {order.tasks.map(task => (
                                <div key={task._id} className="task-item">
                                    <div className="task-info">
                                        <div className="task-name">
                                            <i className="icon-warning"></i>
                                            {task.taskName}
                                        </div>
                                        <div className="task-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Due:</span>
                                                <span className="detail-value overdue">
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Assigned:</span>
                                                <span className="detail-value">
                                                    {task.assignedTo?.name || "Unassigned"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="action-button">
                                        Take Action
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div></>
    );
};

export default Alerts;