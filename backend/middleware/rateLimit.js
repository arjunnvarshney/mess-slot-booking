// Per-process limiter. Use a shared store before running multiple API instances.
module.exports = function rateLimit({
  limit = 15,
  windowMs = 15 * 60000,
  keyFor = (req) => req.ip,
} = {}) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of clients)
      if (value.reset <= now) clients.delete(key);
    const key = keyFor(req);
    const entry = clients.get(key) || { count: 0, reset: now + windowMs };
    entry.count++;
    clients.set(key, entry);
    if (entry.count > limit) {
      res.set("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res
        .status(429)
        .json({ error: "Too many attempts. Please try again later" });
    }
    next();
  };
};
