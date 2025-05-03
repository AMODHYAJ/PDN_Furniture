import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Use configured axios instance
import './EmployeeForm.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState({
        name: '',
        address: '',
        phone: '',
        role: 'Carpenter',
        status: 'Active',
        image: null
    });
    const [previewImage, setPreviewImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        name: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        if (id) {
            const fetchEmployee = async () => {
                try {
                    const response = await api.get(`/employees/${id}`);
                    setEmployee(response.data);
                    if (response.data.image) {
                        setPreviewImage(response.data.image);
                    }
                } catch (err) {
                    console.error('Error fetching employee:', err);
                }
            };
            fetchEmployee();
        }
    }, [id]);

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.length < 2) {
                    error = 'Name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    error = 'Name can only contain letters and spaces';
                }
                break;
            case 'address':
                if (!value.trim()) {
                    error = 'Address is required';
                } else if (value.length < 5) {
                    error = 'Address must be at least 5 characters';
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    error = 'Phone number is required';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Phone number can only contain digits';
                } else if (value.length < 10) {
                    error = 'Phone number must be at least 10 digits';
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validate the field
        const error = validateField(name, value);
        
        // Update errors state
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        // Update employee state
        setEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEmployee(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: validateField('name', employee.name),
            address: validateField('address', employee.address),
            phone: validateField('phone', employee.phone)
        };
        
        setErrors(newErrors);
        
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', employee.name);
        formData.append('address', employee.address);
        formData.append('phone', employee.phone);
        formData.append('role', employee.role);
        formData.append('status', employee.status);
        if (employee.image instanceof File) {
            formData.append('image', employee.image);
        }

        try {
            if (id) {
                await api.put(`/employees/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Employee updated successfully!');
            } else {
                await api.post('/employees', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Employee added successfully!');
            }
            navigate('/employees');
        } catch (err) {
            console.error('Error saving employee:', err);
            alert('Failed to save employee');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <><ProgressNavBar /><div className="employee-form-container">
            <h2>{id ? 'Edit Employee' : 'Add New Employee'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={employee.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label>Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={employee.address}
                        onChange={handleChange}
                        className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label>Phone:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={employee.phone}
                        onChange={handleChange}
                        className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label>Role:</label>
                    <select
                        name="role"
                        value={employee.role}
                        onChange={handleChange}
                    >
                        <option value="Carpenter">Carpenter</option>
                        <option value="Assembler">Assembler</option>
                        <option value="Polisher">Polisher</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Supervisor">Supervisor</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Status:</label>
                    <select
                        name="status"
                        value={employee.status}
                        onChange={handleChange}
                    >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange} />
                    {previewImage && (
                        <div className="image-preview">
                            <img src={previewImage} alt="Preview" />
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Employee'}
                </button>
            </form>
        </div></>
    );
};

export default EmployeeForm;