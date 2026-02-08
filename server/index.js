import 'dotenv/config';
import path from 'path';
import jsonServer from 'json-server';

const jsonServer = jsonServer()
const path = path()

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, '..', 'public'),
});

const PORT = process.env.PORT || 4000;

// Default middlewares (CORS, logger, static, etc.)
server.use(middlewares);

// Custom: simulate network latency
server.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 400) + 200;
  console.log(`  ⏱  Simulated latency: ${delay}ms`);

  // Simulate occasional errors (2% chance) when env flag is set
  if (process.env.SIMULATE_ERRORS === 'true' && Math.random() < 0.02) {
    return setTimeout(() => {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Simulated server failure for testing error handling',
      });
    }, delay);
  }

  setTimeout(next, delay);
});

// Rewrite routes: /api/* → /*
server.use(
  jsonServer.rewriter({
    '/api/*': '/$1',
  })
);

// Body parser for POST/PUT/PATCH
server.use(jsonServer.bodyParser);

// Use the router
server.use(router);

server.listen(PORT, () => {
  console.log(`\n  🚀 JSON Server is running at http://localhost:${PORT}`);
  console.log(`  📦 Endpoints:`);
  console.log(`     GET /api/stats        → KPI stats (filter: ?period=7d|30d|12m)`);
  console.log(`     GET /api/revenue      → Revenue data (filter: ?period=&userType=)`);
  console.log(`     GET /api/orders       → Orders data (filter: ?period=&userType=)`);
  console.log(`     GET /api/users        → User distribution (filter: ?period=)`);
  console.log(`     GET /api/traffic      → Traffic sources (filter: ?period=)`);
  console.log(`\n  Latency simulation: 200-600ms per request`);
  console.log(`  Error simulation: ${process.env.SIMULATE_ERRORS === 'true' ? 'ON (2%)' : 'OFF (set SIMULATE_ERRORS=true to enable)'}\n`);
});
