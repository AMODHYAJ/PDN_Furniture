import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to PDN Products</h1>
      <p>
        PDN Products offers stylish, high-quality furniture designed for comfort
        and durability.
      </p>

      <img
        src="http://localhost:5000/images/products/home.jpeg"
        alt="Home Banner"
        className="home-image"
      />
    </div>
  );
};

export default Home;
