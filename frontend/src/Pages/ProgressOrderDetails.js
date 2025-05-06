import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import "./ProgressOrderDetails.css";
import ProgressNavBar from "../Components/ProgressNavBar";

const ProgressOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/tasks/orders`);
        const selectedOrder = response.data.find((o) => o._id === id);
        setOrder(selectedOrder);

        if (selectedOrder && selectedOrder.tasks) {
          const initialStatus = {};
          selectedOrder.tasks.forEach((task) => {
            initialStatus[task._id] = task.status;
          });
          setTaskStatus(initialStatus);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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
            const response = await api.put("/tasks/update-task-progress", {
              taskId: taskId,
              status: newStatus,
            });
            setOrder((prevOrder) => {
              if (!prevOrder || !prevOrder.tasks) return prevOrder;
              const updatedTasks = prevOrder.tasks.map((task) =>
                task._id === taskId ? { ...task, status: newStatus } : task
              );
              return { ...prevOrder, tasks: updatedTasks };
            });
          } catch (updateError) {
            console.error(`Error updating task ${taskId}:`, updateError);
            setError("Failed to update some or all task statuses.");
            setLoading(false);
            return;
          }
        }
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

  useEffect(() => {
    if (order && order.tasks) {
      const allCompleted = order.tasks.every(
        (task) => task.status === "Completed"
      );
      if (allCompleted) {
        console.log("All tasks completed - order will be marked as shipped");
      }
    }
  }, [order]);

  if (loading) return <div className="luxury-order-details-container">Loading...</div>;
  if (error) return <div className="luxury-order-details-container">Error: {error}</div>;
  if (!order) return <div className="luxury-order-details-container">Order not found.</div>;

  return (
    <>
      <ProgressNavBar />
      <div className="luxury-order-details-container">
        <h2>Order Details: {order.orderId}</h2>
        <p>
          <strong>Order ID:</strong> {order.orderId}
        </p>
        <p>
          <strong>Priority:</strong> {order.priorityLevel}
        </p>
        <p>
          <strong>Progress:</strong> {order.progress}%
        </p>

        <h3>Tasks:</h3>
        <ul>
          {order.tasks?.map((task) => (
            <li key={task._id}>
              <p>
                <strong>Task Name:</strong> {task.taskName}
              </p>
              <p>
                <strong>Assigned To:</strong>{" "}
                {task.assignedTo?.name || "Not Assigned"}
              </p>
              <p>
                <strong>Status:</strong> {taskStatus[task._id]}
              </p>
              <select
                value={taskStatus[task._id]}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                disabled={task.status === "Completed"}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </li>
          ))}
        </ul>

        <div className="luxury-actions">
          <button
            onClick={applyStatusChanges}
            disabled={!isStatusChanged || loading}
            className="luxury-save-btn"
          >
            {loading ? "Saving..." : "Apply Changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProgressOrderDetails;