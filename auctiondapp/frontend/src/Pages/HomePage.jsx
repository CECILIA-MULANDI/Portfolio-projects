import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <main style={{ flexGrow: 1, paddingTop: "60px", width: "100%" }}>
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: "#007bff",
            color: "white",
            textAlign: "center",
            padding: "80px 20px",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{ fontSize: "40px", fontWeight: "bold", maxWidth: "800px" }}
          >
            Welcome to the Auction Platform
          </h1>
          <p style={{ marginTop: "10px", fontSize: "18px", maxWidth: "600px" }}>
            Bid on exclusive items and win amazing deals!
          </p>
          <button
            style={{
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
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#ffdb4d")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ffcc00")}
          >
            Start Bidding
          </button>
        </section>

        {/* About Us Section */}
        <section
          style={{
            backgroundColor: "#f8f9fa",
            padding: "60px 20px",
            textAlign: "center",
            margin: "40px 10px",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            maxWidth: "100vw", // Ensures responsiveness
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#007bff" }}>
            About Us
          </h2>
          <p style={{ marginTop: "10px", color: "#333", fontSize: "18px" }}>
            Our auction platform connects buyers and sellers in a seamless and
            transparent environment. Whether you are looking for rare
            collectibles or unique items, we have got you covered!
          </p>
        </section>

        {/* Why Choose Us Section */}
        <section
          style={{
            padding: "60px 20px",
            backgroundColor: "#ffffff",
            textAlign: "center",
            // maxWidth: "1000px",
            width: "100vw",
            margin: "auto",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#007bff" }}>
            Why Choose Us?
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                flex: "1",
                minWidth: "250px",
                maxWidth: "300px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#007bff" }}>Secure Transactions</h3>
              <p style={{ fontSize: "16px", color: "#333" }}>
                Our platform ensures safe and transparent bidding for all users.
              </p>
            </div>
            <div
              style={{
                flex: "1",
                minWidth: "250px",
                maxWidth: "300px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#007bff" }}>Exclusive Items</h3>
              <p style={{ fontSize: "16px", color: "#333" }}>
                Get access to rare and unique collectibles you won’t find
                elsewhere.
              </p>
            </div>
            <div
              style={{
                flex: "1",
                minWidth: "250px",
                maxWidth: "300px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#007bff" }}>Fast Payouts</h3>
              <p style={{ fontSize: "16px", color: "#333" }}>
                Winning bidders receive their items quickly and securely.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
