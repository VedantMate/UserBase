const app = require('./app');
const { env } = require('./config/env');
const { connectDb } = require('./services/db');
const { seedInitialAdmin } = require('./services/bootstrap');

const PORT = env.port;

async function startServer() {
  try {
    await connectDb();
    await seedInitialAdmin();

    app.listen(PORT, () => {
      console.log(`\nUser Management API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('[StartupError]', error);
    process.exit(1);
  }
}

startServer();
