import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./ProgressOrderDetails.css";
import ProgressNavBar from "../Components/ProgressNavBar";
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet"></link>

const ProgressOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch employees first
        const empResponse = await api.get('/employees');
        setEmployees(empResponse.data);

        // Then fetch the order with fresh data
        const orderResponse = await api.get(`/tasks/orders`);
        const selectedOrder = orderResponse.data.find((o) => o._id === id);
        setOrder(selectedOrder);

        if (selectedOrder && selectedOrder.tasks) {
          const initialStatus = {};
          selectedOrder.tasks.forEach((task) => {
            initialStatus[task._id] = task.status;
          });
          setTaskStatus(initialStatus);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, refreshTrigger]);

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Not Assigned";
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? `${employee.name} (${employee.role})` : "Unknown Employee";
  };

  useEffect(() => {
    if (order && order.tasks) {
      const changed = order.tasks.some(
        (task) => task.status !== taskStatus[task._id]
      );
      setIsStatusChanged(changed);
    }
  }, [taskStatus, order]);

  const handleStatusChange = (taskId, newStatus) => {
    const currentTask = order?.tasks?.find((task) => task._id === taskId);
    const currentStatus = taskStatus[taskId];

    if (currentStatus === "Completed") return;
    if (currentStatus === "In Progress" && newStatus === "Pending") return;

    setTaskStatus((prev) => ({ ...prev, [taskId]: newStatus }));
  };

  const applyStatusChanges = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatesToSend = Object.keys(taskStatus).filter((taskId) => {
        const originalTask = order?.tasks?.find((task) => task._id === taskId);
        return originalTask && originalTask.status !== taskStatus[taskId];
      });

      if (updatesToSend.length > 0) {
        for (const taskId of updatesToSend) {
          const newStatus = taskStatus[taskId];
          try {
            await api.put("/tasks/update-task-progress", {
              taskId: taskId,
              status: newStatus,
            });
          } catch (updateError) {
            console.error(`Error updating task ${taskId}:`, updateError);
            setError("Failed to update some or all task statuses.");
            setLoading(false);
            return;
          }
        }
        
        // Trigger refresh after all updates
        setRefreshTrigger(prev => !prev);
        setIsStatusChanged(false);
        alert("Task status updated successfully!");
      } else {
        alert("No changes to apply.");
      }
    } catch (error) {
      console.error("Error in applyStatusChanges:", error);
      setError("Failed to update task statuses.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="order-details-loading">
      <div className="loading-spinner"></div>
      Loading order details...
    </div>
  );
  
  if (error) return (
    <div className="order-details-error">
      <span className="error-icon">⚠️</span>
      {error}
    </div>
  );
  
  if (!order) return (
    <div className="order-details-error">
      Order not found
    </div>
  );

  return (
    <>
      <ProgressNavBar />
      <div className="order-details-container">
        <div className="order-header">
          <h1 className="order-title">Order #{order.orderId}</h1>
          <div className="order-meta">
            <div className="meta-item">
              <span className="meta-label">Priority:</span>
              <span className={`priority-badge ${order.priorityLevel.toLowerCase()}`}>
                {order.priorityLevel}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Progress:</span>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
                <span className="progress-percent">{order.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tasks-section">
          <h2 className="section-title">Production Tasks</h2>
          
          <div className="tasks-table">
            <div className="table-header">
              <div className="table-column">Task</div>
              <div className="table-column">Assigned To</div>
              <div className="table-column">Status</div>
              <div className="table-column">Update</div>
            </div>
            
            {order.tasks?.map((task) => (
              <div key={task._id} className="table-row">
                <div className="table-column">
                  <span className="task-name">{task.taskName}</span>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                </div>
                <div className="table-column">
                  <span className="employee-info">
                    {getEmployeeName(task.assignedTo)}
                  </span>
                </div>
                <div className="table-column">
                  <span className={`status-badge ${taskStatus[task._id].toLowerCase().replace(' ', '-')}`}>
                    {taskStatus[task._id]}
                  </span>
                </div>
                <div className="table-column">
                  <select
                    value={taskStatus[task._id]}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={task.status === "Completed"}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={applyStatusChanges}
            disabled={!isStatusChanged || loading}
            className="save-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProgressOrderDetails;