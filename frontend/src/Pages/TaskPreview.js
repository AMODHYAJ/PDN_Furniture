// src/components/TaskPreview.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TaskPreview.css'; // Import the CSS file
import ProgressNavBar from "../Components/ProgressNavBar";

const TaskPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    console.log('location.state in TaskPreview:', state); // LOG
    const { tasks: responseTasks, orderId: initialOrderId } = state || { tasks: { tasks: [] }, orderId: null };
    const initialTasks = responseTasks?.tasks;
    console.log('initialTasks in TaskPreview:', initialTasks); // LOG
    const [tasks, setTasks] = useState(initialTasks?.tasks || []);
    console.log('tasks state in TaskPreview:', tasks); // ADDED LOG
    const [totalEstimatedTime, setTotalEstimatedTime] = useState(responseTasks?.totalEstimatedTime || 0);
    const [riskLevel, setRiskLevel] = useState(responseTasks?.riskLevel || 'Medium');
    const [suggestedNewDeadline, setSuggestedNewDeadline] = useState(responseTasks?.suggestedNewDeadline);
    const orderId = initialOrderId;

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
        if (field === 'estimatedTime') {
            const newTotalTime = newTasks.reduce((sum, task) => sum + parseFloat(task.estimatedTime || 0), 0);
            setTotalEstimatedTime(newTotalTime);
        }
    };

    const handleSaveTasks = async () => {
        try {
            await api.post('/tasks/schedule', { orderId, priorityLevel: "Medium", tasks: { tasks }, totalEstimatedTime, riskLevel, suggestedNewDeadline });
            navigate('/ongoing');
        } catch (error) {
            console.error("Error saving tasks:", error);
        }
    };

    return (
        <><ProgressNavBar /><div className="task-preview-container">
            <h2>Task Preview for Order: {orderId}</h2>
            {console.log('tasks before map:', tasks)} {/* ADDED LOG */}
            {tasks.map((task, index) => (
                <div key={index}>
                    <label>Task Name:</label>
                    <input
                        type="text"
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)} />
                    <label>Assigned To:</label>
                    <input
                        type="text"
                        value={task.assignedTo || ''}
                        onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)} />
                    <label>Estimated Time (hours):</label>
                    <input
                        type="number"
                        value={task.estimatedTime}
                        onChange={(e) => handleTaskChange(index, 'estimatedTime', parseFloat(e.target.value))} />
                    <label>Due Date:</label>
                    <input
                        type="date"
                        value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                        onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value + 'T00:00:00Z')} />
                </div>
            ))}
            <p><strong>Total Estimated Time:</strong> {totalEstimatedTime} hours</p>
            <p><strong>Risk Level:</strong> {riskLevel}</p>
            {suggestedNewDeadline && <p className="suggested-deadline"><strong>Suggested New Deadline:</strong> {suggestedNewDeadline}</p>}
            <button onClick={handleSaveTasks}>Confirm and Save</button>
            {/* You could add a "Back" or "Edit Prompt" button here if needed */}
        </div></>
    );
};

export default TaskPreview;