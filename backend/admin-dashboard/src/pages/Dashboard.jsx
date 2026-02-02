import DailyAnalytics from "./DailyAnalytics";

export default function Dashboard() {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={{ color: "white" }}>🍽 Mess Admin</h2>
        <nav>
          <p style={styles.navItem}>📊 Daily Analytics</p>
          <p style={styles.navItem}>🏢 Floor Stats</p>
          <p style={styles.navItem}>⏱ Slot Usage</p>
          <p style={styles.navItem}>🚫 No-Shows</p>
        </nav>
      </aside>

      <main style={styles.main}>
        <h1 style={styles.header}>Dashboard</h1>
        <DailyAnalytics />
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif"
  },
  sidebar: {
    width: "220px",
    background: "#1e293b",
    padding: "20px"
  },
  navItem: {
    color: "#cbd5e1",
    margin: "15px 0",
    cursor: "pointer"
  },
  main: {
    flex: 1,
    padding: "30px",
    background: "#f1f5f9"
  },
  header: {
    marginBottom: "20px"
  }
};
