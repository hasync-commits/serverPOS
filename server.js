const app = require('./app');
const connectDB = require('./config/db');
const { port, nodeEnv } = require('./config/env');

/* -------------------- START SERVER -------------------- */
const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on port ${port} (${nodeEnv})`);
  });
};

startServer();
