import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './TaskPreview.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const TaskPreview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const { tasks: responseTasks, orderId: initialOrderId } = state || { tasks: { tasks: [] }, orderId: null };
    const initialTasks = responseTasks?.tasks;
    const [tasks, setTasks] = useState(initialTasks?.tasks || []);
    const [totalEstimatedTime, setTotalEstimatedTime] = useState(responseTasks?.totalEstimatedTime || 0);
    const [riskLevel, setRiskLevel] = useState(responseTasks?.riskLevel || 'Medium');
    const [suggestedNewDeadline, setSuggestedNewDeadline] = useState(responseTasks?.suggestedNewDeadline);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const orderId = initialOrderId;

    // Fetch employees when component mounts
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoadingEmployees(true);
            try {
                const response = await api.get('/employees');
                setEmployees(response.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleTaskChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
        if (field === 'estimatedTime') {
            const newTotalTime = newTasks.reduce((sum, task) => sum + parseFloat(task.estimatedTime || 0), 0);
            setTotalEstimatedTime(newTotalTime);
        }
    };

    const validateTasks = () => {
        // Check if all tasks have assigned employees
        const hasUnassignedTasks = tasks.some(task => !task.assignedTo);
        if (hasUnassignedTasks) {
            alert("Please assign employees to all tasks before saving.");
            return false;
        }
        return true;
    };

    const handleSaveTasks = async () => {
        if (!validateTasks()) return;
        
        try {
            await api.post('/tasks/schedule', { 
                orderId, 
                priorityLevel: "Medium", 
                tasks: { tasks }, 
                totalEstimatedTime, 
                riskLevel, 
                suggestedNewDeadline 
            });
            navigate('/ongoing');
        } catch (error) {
            console.error("Error saving tasks:", error);
            alert(error.response?.data?.error || "Failed to save tasks");
        }
    };

    return (
        <>
            <ProgressNavBar />
            <div className="luxury-task-preview-container">
                <h2>Task Preview for Order: {orderId}</h2>
                
                {tasks.map((task, index) => (
                    <div key={index} className="task-preview-item">
                        <div className="form-group">
                            <label>Task Name:</label>
                            <input
                                type="text"
                                value={task.taskName}
                                onChange={(e) => handleTaskChange(index, 'taskName', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Assigned To:</label>
                            <select
                                value={task.assignedTo || ''}
                                onChange={(e) => handleTaskChange(index, 'assignedTo', e.target.value)}
                                required
                            >
                                <option value="">Select Employee</option>
                                {loadingEmployees ? (
                                    <option>Loading employees...</option>
                                ) : (
                                    employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.name} ({emp.role})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Estimated Time (hours):</label>
                            <input
                                type="number"
                                value={task.estimatedTime}
                                onChange={(e) => handleTaskChange(index, 'estimatedTime', parseFloat(e.target.value))}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={task.dueDate ? task.dueDate.substring(0, 10) : ''}
                                onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value + 'T00:00:00Z')}
                                required
                            />
                        </div>
                    </div>
                ))}
                
                <div className="summary-section">
                    <p><strong>Total Estimated Time:</strong> {totalEstimatedTime} hours</p>
                    <p><strong>Risk Level:</strong> {riskLevel}</p>
                    
                    {suggestedNewDeadline && (
                        <p className="luxury-suggested-deadline">
                            <strong>Suggested New Deadline:</strong> {suggestedNewDeadline}
                        </p>
                    )}
                </div>
                
                <button 
                    onClick={handleSaveTasks}
                    className="luxury-confirm-btn"
                    disabled={loadingEmployees}
                >
                    Confirm and Save
                </button>
            </div>
        </>
    );
};

export default TaskPreview;