import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Define responsive stylesheet
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  main: {
    flexGrow: 1,
    paddingTop: "60px",
    width: "100vw",
    position: "relative",
  },
  heroSection: {
    backgroundColor: "#007bff",
    color: "white",
    textAlign: "center",
    padding: "80px 20px",
    width: "100vw",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: "40px",
    fontWeight: "bold",
    maxWidth: "800px",
    margin: 0,
    padding: "0 10px",
    width: "100%",
  },
  heroText: {
    marginTop: "10px",
    fontSize: "18px",
    maxWidth: "600px",
    padding: "0 10px",
  },
  heroButton: {
    marginTop: "20px",
    backgroundColor: "#ffcc00",
    color: "#333",
    padding: "12px 24px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  aboutSection: {
    backgroundColor: "#f8f9fa",
    padding: "60px 20px",
    textAlign: "center",
    margin: "40px 0", // Changed from margin: "40px auto"
    width: "100%", // Changed from width: "calc(100% - 40px)"
    boxSizing: "border-box",
  },
  aboutContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    padding: "40px 20px",
    backgroundColor: "#f8f9fa",
  },
  sectionTitle: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#007bff",
    margin: 0,
  },
  aboutText: {
    marginTop: "10px",
    color: "#333",
    fontSize: "18px",
    maxWidth: "900px",
    margin: "10px auto",
  },
  featuresSection: {
    padding: "60px 0", // Changed from padding: "60px 20px"
    backgroundColor: "#ffffff",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  featuresContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginTop: "20px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px", // Increased from "0 10px" for consistent spacing
    boxSizing: "border-box",
  },
  featureCard: {
    flex: "1 1 300px",
    minWidth: "250px",
    maxWidth: "350px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
    margin: "10px",
    boxSizing: "border-box",
  },
  featureTitle: {
    color: "#007bff",
    fontSize: "20px",
    margin: "0 0 10px 0",
  },
  featureText: {
    fontSize: "16px",
    color: "#333",
    margin: 0,
  },
};

// Media query styles for responsive design
const mediaStyles = `
  @media (max-width: 992px) {
    .heroTitle {
      font-size: 36px;
    }
    .heroText {
      font-size: 16px;
    }
    .sectionTitle {
      font-size: 24px;
    }
    .aboutText {
      font-size: 16px;
    }
    .featureCard {
      flex: 1 1 45%;
      min-width: 200px;
    }
  }
  
  @media (max-width: 768px) {
    .heroSection {
      padding: 60px 15px;
    }
    .heroTitle {
      font-size: 30px;
    }
    .heroButton {
      padding: 10px 20px;
      font-size: 16px;
    }
    .aboutContent {
      padding: 30px 15px;
    }
    .aboutSection {
      padding: 40px 15px;
      margin: 30px 0;
    }
    .featuresSection {
      padding: 40px 0;
    }
    .featuresContainer {
      padding: 0 15px;
    }
    .featureCard {
      flex: 1 1 100%;
      max-width: 400px;
    }
  }
  
  @media (max-width: 480px) {
    .heroSection {
      padding: 40px 15px;
    }
    .heroTitle {
      font-size: 24px;
    }
    .heroText {
      font-size: 14px;
    }
    .heroButton {
      padding: 8px 16px;
      font-size: 14px;
    }
    .aboutContent {
      padding: 20px 15px;
    }
    .aboutSection {
      padding: 30px 15px;
      margin: 20px 0;
    }
    .sectionTitle {
      font-size: 20px;
    }
    .aboutText {
      font-size: 14px;
    }
    .featuresSection {
      padding: 30px 0;
    }
    .featuresContainer {
      padding: 0 10px;
    }
    .featureTitle {
      font-size: 18px;
    }
    .featureText {
      font-size: 14px;
    }
  }
`;

const HomePage = () => {
  const features = [
    {
      title: "Secure Transactions",
      description:
        "Our platform ensures safe and transparent bidding for all users.",
    },
    {
      title: "Exclusive Items",
      description:
        "Get access to rare and unique collectibles you won't find elsewhere.",
    },
    {
      title: "Fast Payouts",
      description: "Winning bidders receive their items quickly and securely.",
    },
  ];

  return (
    <>
      {/* Add responsive CSS using styled component approach */}
      <style>{mediaStyles}</style>

      <div style={styles.container}>
        <Navbar />
        <main style={styles.main}>
          {/* Hero Section */}
          <section style={styles.heroSection}>
            <h1 style={styles.heroTitle} className="heroTitle">
              Welcome to the Auction Platform
            </h1>
            <p style={styles.heroText} className="heroText">
              Bid on exclusive items and win amazing deals!
            </p>
            <button
              style={styles.heroButton}
              className="heroButton"
              onMouseOver={(e) => (e.target.style.backgroundColor = "#ffdb4d")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ffcc00")}
            >
              Start Bidding
            </button>
          </section>

          {/* About Us Section */}
          <section style={styles.aboutSection} className="aboutSection">
            <div style={styles.aboutContent}>
              <h2 style={styles.sectionTitle} className="sectionTitle">
                About Us
              </h2>
              <p style={styles.aboutText} className="aboutText">
                Our auction platform connects buyers and sellers in a seamless
                and transparent environment. Whether you are looking for rare
                collectibles or unique items, we have got you covered!
              </p>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section style={styles.featuresSection} className="featuresSection">
            <div style={styles.featuresContainer}>
              <h2 style={styles.sectionTitle} className="sectionTitle">
                Why Choose Us?
              </h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  width: "100%",
                  margin: "20px 0 0 0",
                }}
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    style={styles.featureCard}
                    className="featureCard"
                  >
                    <h3 style={styles.featureTitle} className="featureTitle">
                      {feature.title}
                    </h3>
                    <p style={styles.featureText} className="featureText">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
