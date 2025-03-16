import "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    width: "100vw",
    position: "relative",
  },
  section: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxSizing: "border-box",
    padding: "40px 20px",
  },
  heroSection: {
    backgroundColor: "#007bff",
    color: "white",
    flexDirection: "column",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "100vh",
    width: "100vw",
    backgroundImage: `radial-gradient(white 0.2px, transparent 0.5px)`,
    backgroundSize: "10px 10px",
  },
  heroTitle: {
    fontSize: "40px",
    fontWeight: "bold",
    maxWidth: "800px",
  },
  heroText: {
    marginTop: "10px",
    fontSize: "18px",
    maxWidth: "600px",
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
  },
  featuresSection: {
    backgroundColor: "#ffffff",
  },
  title: {
    color: "#007bff",
  },
  text: {
    color: "black",
  },
  featureCard: {
    flex: "1 1 300px",
    minWidth: "250px",
    maxWidth: "350px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "10px",
    boxShadow: "0px 2px 4px #007bff",
    margin: "10px",
    boxSizing: "border-box",
  },
};

const HomePage = () => {
  const features = [
    { title: "Secure Transactions", description: "Our platform ensures safe and transparent bidding for all users." },
    { title: "Exclusive Items", description: "Get access to rare and unique collectibles you won't find elsewhere." },
    { title: "Fast Payouts", description: "Winning bidders receive their items quickly and securely." },
  ];

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <section style={{ ...styles.section, ...styles.heroSection }}>
          <h1 style={styles.heroTitle}>Welcome to the Auction Platform</h1>
          <p style={styles.heroText}>Bid on exclusive items and win amazing deals!</p>
          <button
            style={styles.heroButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#ffdb4d")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ffcc00")}
          >
            Start Bidding
          </button>
        </section>

        <section style={{ ...styles.section, ...styles.aboutSection }}>
          <div>
            <h2 style={styles.title}>About Us</h2>
            <p style={styles.text}>
              Our auction platform connects buyers and sellers in a seamless and transparent environment.
            </p>
          </div>
        </section>

        <section style={{ ...styles.section, ...styles.featuresSection }}>
          <div>
            <h2 style={styles.title}>Why Choose Us?</h2>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              {features.map((feature, index) => (
                <div key={index} style={styles.featureCard}>
                  <h3 style={styles.title}>{feature.title}</h3>
                  <p style={styles.text}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
