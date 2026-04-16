const app = require('./app');
const seedAdmin = require('../seedAdmin');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();