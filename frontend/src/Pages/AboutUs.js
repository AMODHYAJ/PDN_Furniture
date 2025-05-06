import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Our Craftsmanship Legacy</h1>
          <p className="hero-subtitle">Since 1985, PDN Products has been defining luxury furniture</p>
        </div>
      </section>

      <section className="history-section">
        <div className="history-content">
          <div className="history-text">
            <h2>Artisan Heritage</h2>
            <p>
              Founded in a small workshop in 1985, PDN Products began with a simple vision: to create 
              furniture that stands the test of time. What started as a family passion project has grown 
              into a renowned atelier of fine furniture craftsmanship.
            </p>
            <p>
              Each piece in our collection carries the signature of the artisan who created it, 
              maintaining the human connection in an era of mass production.
            </p>
          </div>
          <div className="history-image">
            <img 
              src="http://localhost:5000/images/workshop.jpg" 
              alt="PDN Products Workshop" 
            />
          </div>
        </div>
      </section>

      <section className="craftsmanship-section">
        <h2>Our Craftsmanship Principles</h2>
        <div className="principles-grid">
          <div className="principle-card">
            <div className="principle-icon material-icon"></div>
            <h3>Material Integrity</h3>
            <p>
              We source only the finest sustainable hardwoods, metals, and fabrics, 
              ensuring each material meets our exacting standards.
            </p>
          </div>
          <div className="principle-card">
            <div className="principle-icon process-icon"></div>
            <h3>Time-Honored Techniques</h3>
            <p>
              Our artisans employ traditional joinery and finishing methods that 
              modern machinery cannot replicate.
            </p>
          </div>
          <div className="principle-card">
            <div className="principle-icon detail-icon"></div>
            <h3>Obsessive Detailing</h3>
            <p>
              Every curve, joint, and finish receives meticulous attention, with 
              some pieces requiring over 200 hours of handwork.
            </p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Master Artisans</h2>
        <div className="team-grid">
          <div className="team-member">
            <img 
              src="http://localhost:5000/images/artisan-1.jpg" 
              alt="Master Artisan" 
            />
            <h3>Rajiv Malhotra</h3>
            <p>Lead Woodworker, 32 years with PDN</p>
          </div>
          <div className="team-member">
            <img 
              src="http://localhost:5000/images/artisan-2.jpg" 
              alt="Master Artisan" 
            />
            <h3>Priya Sharma</h3>
            <p>Upholstery Specialist, 18 years with PDN</p>
          </div>
          <div className="team-member">
            <img 
              src="http://localhost:5000/images/artisan-3.jpeg" 
              alt="Master Artisan" 
            />
            <h3>Vikram Patel</h3>
            <p>Metalwork Expert, 25 years with PDN</p>
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="philosophy-content">
          <h2>Our Design Philosophy</h2>
          <blockquote>
            "True luxury lies in the harmony of form and function - creating pieces that are 
            as comfortable in a modern loft as they would be in a traditional manor."
          </blockquote>
          <p>- PDN Design Team</p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;