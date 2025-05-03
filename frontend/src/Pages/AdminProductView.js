import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './AdminProductView.css'; // Assuming you have a separate CSS file for this component

const AdminProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/products/${id}`);
                const discountResponse = await axios.get("http://localhost:5000/api/discount");

                const productDiscount = discountResponse.data.find(discount => discount.productId === id);
                const productData = response.data.product;

                // Attach the discount if available
                setProduct({ ...productData, discount: productDiscount || null });
            } catch (err) {
                setError("Error fetching product details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="admin-product-view">
            <h1>Product Details</h1>
            <h2>{product.name}</h2>
            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} width="150" />
            <div className="product-details">
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Price:</strong> Rs.{product.price}</p>
                <p><strong>Description:</strong> {product.description}</p>

                {/* Show Discount if Available */}
                {product.discount ? (
                    <p className="discount-info">
                        <strong>Discount:</strong> {product.discount.discountPercentage}% off
                        <br />
                        (Valid: {new Date(product.discount.startDate).toLocaleDateString()} - {new Date(product.discount.endDate).toLocaleDateString()})
                    </p>
                ) : (
                    <p className="no-discount">No active discount</p>
                )}

                <p className={product.availability ? "available" : "not-available"}>
                    {product.availability ? "Available for Customization" : "Not Available"}
                </p>

                <button onClick={() => navigate(`/edit-product/${product._id}`)} className="update-button">Update Product</button>
                <button onClick={() => navigate("/")} className="back-button">
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
};

export default AdminProductView;