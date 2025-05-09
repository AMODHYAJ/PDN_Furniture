import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import Header from "./Header";
import "./ProductAnalytics.css";

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
        const response = await fetch(
          "http://localhost:5000/analytics/product-analytics"
        );
        if (!response.ok) throw new Error("Failed to fetch analytics data");
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

  // Generate distinct colors for each category
  const getCategoryColors = (count) => {
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#8AC24A",
      "#607D8B",
      "#E91E63",
      "#9C27B0",
    ];
    return colors.slice(0, count);
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const categoryLabels = analyticsData.categoryDistribution.map(
    (item) => item._id
  );
  const categoryValues = analyticsData.categoryDistribution.map(
    (item) => item.count
  );
  const categoryColors = getCategoryColors(categoryLabels.length);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4, // Set maximum Y-axis value based on your data
        ticks: {
          stepSize: 0.5, // Show increments of 0.5
        },
      },
    },
  };

  const barData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Product Count",
        data: categoryValues,
        backgroundColor: categoryColors,
        borderColor: categoryColors.map((color) => color.replace("0.6", "1")),
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryColors,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="product-analytics-page">
      <Header />
      <div className="product-analytics-container">
        <h1 className="product-analytics-header">Product Analytics</h1>

        <div className="product-summary-cards">
          <div className="product-summary-card">
            <h3>Total Products</h3>
            <p>{analyticsData.totalProducts}</p>
          </div>
          <div className="product-summary-card">
            <h3>Price Range</h3>
            <p className="product-price-range">
              LKR {analyticsData.priceRange.minPrice} - LKR{" "}
              {analyticsData.priceRange.maxPrice}
            </p>
          </div>
        </div>

        <div className="product-charts-grid">
          <div className="product-chart-wrapper">
            <h3>Product Categories Distribution</h3>
            <div className="product-bar-chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          <div className="product-chart-wrapper">
            <h3>Categories Breakdown</h3>
            <div className="product-pie-chart-container">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
);
};

export default ProductAnalytics;
