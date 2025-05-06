import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section with proper navbar integration */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>PDN PRODUCTS</h1>
          <p className="tagline">Crafting Timeless Elegance for Your Home</p>
          <p className="hero-description">
            Experience the perfect blend of luxury and comfort with our handcrafted furniture 
            collections, designed to elevate your living spaces.
          </p>
          <Link to="/products" className="cta-button">
            EXPLORE COLLECTIONS
          </Link>
        </div>
      </div>

      {/* Featured Collections Section */}
      <div className="featured-section">
        <h2>Our Signature Collections</h2>
        <div className="collections-grid">
          <div className="collection-card">
            <div className="collection-image living-room"></div>
            <h3>Living Room</h3>
            <p>Luxurious sofas and sectionals for sophisticated gatherings</p>
          </div>
          <div className="collection-card">
            <div className="collection-image dining"></div>
            <h3>Dining</h3>
            <p>Exquisite tables and chairs for memorable dining experiences</p>
          </div>
          <div className="collection-card">
            <div className="collection-image bedroom"></div>
            <h3>Bedroom</h3>
            <p>Opulent beds and dressers for your personal sanctuary</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <div className="about-content">
          <h2>Artisan Craftsmanship</h2>
          <p>
            Since 1985, PDN Products has been creating heirloom-quality furniture 
            using sustainable materials and traditional techniques passed down through 
            generations of master craftsmen.
          </p>
          <Link to="/about" className="secondary-button" onClick={() => window.scrollTo(0, 0)}>
            Our Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;