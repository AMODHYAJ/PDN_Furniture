// src/components/Alerts.js
import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Use configured axios instance
import './Alerts.css'; // Import the CSS file
import ProgressNavBar from "../Components/ProgressNavBar";

const Alerts = () => {
    const [delayedTasks, setDelayedTasks] = useState([]);

    useEffect(() => {
        const fetchDelayedTasks = async () => {
            try {
                const response = await api.get('/tasks/delays');
                setDelayedTasks(response.data);
            } catch (error) {
                console.error("Error fetching delayed tasks:", error);
            }
        };

        fetchDelayedTasks();
    }, []);

    if (delayedTasks.length === 0) {
        return <div className="alerts-container">
            <p className="no-delayed-tasks">No delayed tasks.</p>
        </div>;
    }

    return (
        <><ProgressNavBar /><div className="alerts-container">
            <h2>Delayed Tasks</h2>
            <ul>
                {delayedTasks.map(order => (
                    <li key={order._id}>
                        <h3>Order ID: {order.orderId}</h3>
                        <ul>
                            {order.tasks.map(task => (
                                <li key={task._id}>
                                    <p><strong>Task Name:</strong> {task.taskName}</p>
                                    <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleString()}</p>
                                    <p><strong>Assigned To:</strong> {task.assignedTo?.name || "Not Assigned"}</p>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div></>
    );
};

export default Alerts;