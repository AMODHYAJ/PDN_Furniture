import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

import Header from "./Header";
//import Footer from "./Footer";
import './ProductAnalytics.css';

const ProductAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        totalProducts: 0,
        categoryDistribution: [],
        priceRange: {},
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const response = await fetch('http://localhost:5000/analytics/product-analytics');

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                const data = await response.json();
                setAnalyticsData(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    // Check if data is still loading or if there's an error
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Prepare data for charts
    const categoryLabels = analyticsData.categoryDistribution.map(item => item._id);
    const categoryValues = analyticsData.categoryDistribution.map(item => item.count);

    // Bar chart data for category distribution
    const categoryData = {
        labels: categoryLabels,
        datasets: [
            {
                label: 'Product Categories',
                data: categoryValues,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    // Prepare data for Pie chart (Category Distribution - Optional)
    const pieCategoryData = {
        labels: categoryLabels,
        datasets: [
            {
                label: 'Product Categories',
                data: categoryValues,
                backgroundColor: categoryLabels.map(() => 'rgba(255, 159, 64, 0.6)'),
            },
        ],
    };

    return (
        <div>
            <Header />
            <div className="analytics-container">
                <h1>Product Analytics</h1>
                <div className="product-info">
                    <h3>Total Products: {analyticsData.totalProducts}</h3>
                    <h3>Price Range: LKR {analyticsData.priceRange.minPrice} - LKR {analyticsData.priceRange.maxPrice}</h3>
                </div>

                {/* Bar Chart for Product Category Distribution */}
                <div className="chart-container">
                    <h3>Product Categories Distribution</h3>
                    <Bar
                        data={categoryData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </div>

                {/* Optional Pie Chart for Product Category Distribution */}
                <div className="chart-container">
                    <h3>Product Categories (Pie Chart)</h3>
                    <Pie
                        data={pieCategoryData}
                        options={{
                            responsive: true,
                        }}
                    />
                </div>
            </div>
           {/*} <Footer />*/}
        </div>
    );
};

export default ProductAnalytics;