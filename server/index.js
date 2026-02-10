import 'dotenv/config';
import path from 'path';
import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router(path.join(process.cwd(), 'server', 'db.json'));
const middlewares = jsonServer.defaults({
  static: path.join(process.cwd(), 'public'),
});

const PORT = process.env.PORT || 4000;

server.use(middlewares);

server.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 400) + 200;

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
server.use((req, res, next) => {
  const fullUrl = req.url;
  const pathPart = fullUrl.split('?')[0];
  console.log(`\n[DEBUG] ${new Date().toISOString()} - ${req.method} ${fullUrl}`);
  console.log(`[DEBUG] Path: ${pathPart}`);
  next();
});


server.use((req, res, next) => {
  const fullUrl = req.url;
  const pathPart = fullUrl.split('?')[0];

  if (req.method === 'GET' && (pathPart === '/stats' || pathPart === '/api/stats' || pathPart === '/api//stats')) {
    console.log(`[DASHBOARD-API] Intercepted stats request!`);
    try {
      const period = req.query.period || '30d';
      const userTypeParam = (req.query.userType || '').toString();
      const userType = userTypeParam.trim().toLowerCase();

      console.log(`[DASHBOARD-API] Params -> period: ${period}, userType: ${userType}`);

      const db = router.db;
      const base = db.get('stats').find({ period }).value() || null;

      if (!userType || userType === 'all') {
        console.log('[DASHBOARD-API] Returning base stats (no filter)');
        res.setHeader('Cache-Control', 'no-store');
        return res.json(base ? [base] : []);
      }

      console.log(`[DASHBOARD-API] Calculating dynamic stats for segment: ${userType}`);

      const revenueEntries = db.get('revenue').filter((r) => r.period === period && String(r.userType).toLowerCase() === userType).value();
      const ordersEntries = db.get('orders').filter((o) => o.period === period && String(o.userType).toLowerCase() === userType).value();
      const usersEntry = db.get('users').find({ period }).value();

      const totalRevenue = (revenueEntries || []).reduce((sum, e) => {
        return sum + (Array.isArray(e.data) ? e.data.reduce((s, d) => s + (d.revenue || 0), 0) : 0);
      }, 0);

      const totalOrders = (ordersEntries || []).reduce((sum, e) => {
        return sum + (Array.isArray(e.data) ? e.data.reduce((s, d) => s + (d.orders || 0), 0) : 0);
      }, 0);

      const segmentLabel = userType === 'free' ? 'Free' : userType === 'premium' ? 'Premium' : userType === 'enterprise' ? 'Enterprise' : null;
      let totalUsers = 0;
      if (segmentLabel && usersEntry && Array.isArray(usersEntry.distribution)) {
        const seg = usersEntry.distribution.find((d) => d.segment === segmentLabel);
        totalUsers = seg ? seg.count : 0;
      }

      const baseRate = base?.kpis?.conversionRate?.value ?? 0;

      const rateMap = {
        'free': 2.1,
        'premium': 6.8,
        'enterprise': 12.4
      };

      const dynamicRate = rateMap[userType] || baseRate;


      const kpis = {
        totalRevenue: {
          value: totalRevenue,
          previousValue: base?.kpis?.totalRevenue?.previousValue ?? 0,
          changePercent: base?.kpis?.totalRevenue?.previousValue ? Math.round(((totalRevenue - base.kpis.totalRevenue.previousValue) / base.kpis.totalRevenue.previousValue) * 10) / 10 : 0,
          trend: totalRevenue >= (base?.kpis?.totalRevenue?.previousValue ?? 0) ? 'up' : 'down',
        },
        totalUsers: {
          value: totalUsers,
          previousValue: base?.kpis?.totalUsers?.previousValue ?? 0,
          changePercent: base?.kpis?.totalUsers?.previousValue ? Math.round(((totalUsers - base.kpis.totalUsers.previousValue) / base.kpis.totalUsers.previousValue) * 10) / 10 : 0,
          trend: totalUsers >= (base?.kpis?.totalUsers?.previousValue ?? 0) ? 'up' : 'down',
        },
        orders: {
          value: totalOrders,
          previousValue: base?.kpis?.orders?.previousValue ?? 0,
          changePercent: base?.kpis?.orders?.previousValue ? Math.round(((totalOrders - base.kpis.orders.previousValue) / base.kpis.orders.previousValue) * 10) / 10 : 0,
          trend: totalOrders >= (base?.kpis?.orders?.previousValue ?? 0) ? 'up' : 'down',
        },
        conversionRate: {
          value: dynamicRate,
          previousValue: base?.kpis?.conversionRate?.previousValue ?? 0,
          changePercent: base?.kpis?.conversionRate?.previousValue ? Math.round(((dynamicRate - base.kpis.conversionRate.previousValue) / base.kpis.conversionRate.previousValue) * 10) / 10 : 0,
          trend: dynamicRate >= (base?.kpis?.conversionRate?.previousValue ?? 0) ? 'up' : 'down',
        },
      };

      const result = {
        id: base?.id ?? `${period}-${userType}`,
        period,
        label: base?.label ?? `Filtered ${period}`,
        kpis,
      };

      res.setHeader('Cache-Control', 'no-store');
      return res.json([result]);
    } catch (err) {
      console.error('[DASHBOARD-API] ❌ ERROR:', err);
      return res.status(500).json({ error: 'Failed' });
    }
  }
  next();
});

server.use(middlewares);

server.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 400) + 200;

  if (process.env.SIMULATE_ERRORS === 'true' && Math.random() < 0.02) {
    return setTimeout(() => {
      res.status(500).json({ error: 'Internal Server Error' });
    }, delay);
  }
  setTimeout(next, delay);
});

server.use(jsonServer.rewriter({ '/api/*': '/$1' }));

server.use(jsonServer.bodyParser);

server.use(router);

server.listen(PORT, () => {
  console.log(`\n  🚀 JSON Server with Dynamic Stats running at http://localhost:${PORT}`);
  console.log(`  📊 Fixed Rates: Free=2.1, Premium=6.8, Enterprise=12.4`);
  console.log(`  📦 Endpoints:`);
  console.log(`     GET /api/stats        → KPI stats (filter: ?period=7d|30d|12m)`);
  console.log(`     GET /api/revenue      → Revenue data (filter: ?period=&userType=)`);
  console.log(`     GET /api/orders       → Orders data (filter: ?period=&userType=)`);
  console.log(`     GET /api/users        → User distribution (filter: ?period=)`);
  console.log(`     GET /api/traffic      → Traffic sources (filter: ?period=)`);
  console.log(`\n  Latency simulation: 200-600ms per request`);
  console.log(`  Error simulation: ${process.env.SIMULATE_ERRORS === 'true' ? 'ON (2%)' : 'OFF (set SIMULATE_ERRORS=true to enable)'}\n`);
});
