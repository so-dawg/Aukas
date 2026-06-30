const data = require("../../tests/data-test.json");

const TOKEN_SECRET = "mock-secret-key";

function findUserByEmail(email) {
  return data.users.find((u) => u.email === email);
}

function findUserById(id) {
  return data.users.find((u) => u.id === Number(id));
}

function generateToken(user) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
    }),
  ).toString("base64url");
  const signature = Buffer.from(
    `${header}.${payload}.${TOKEN_SECRET}`,
  ).toString("base64url");
  return `${header}.${payload}.${signature}`;
}

function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return payload;
  } catch {
    return null;
  }
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// Shared helpers
function paginate(arr, page = 1, limit = 12) {
  const start = (page - 1) * limit;
  return {
    items: arr.slice(start, start + limit),
    total: arr.length,
    page,
    totalPages: Math.ceil(arr.length / limit),
  };
}

function applyFilters(arr, query) {
  let filtered = [...arr];
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.title.toLowerCase().includes(s) ||
        o.organization?.org_name?.toLowerCase().includes(s) ||
        o.description.toLowerCase().includes(s),
    );
  }
  if (query.type) {
    const types = query.type.split(",");
    filtered = filtered.filter((o) => types.includes(o.type));
  }
  if (query.category_id) {
    filtered = filtered.filter(
      (o) => o.category_id === Number(query.category_id),
    );
  }
  if (query.status) {
    filtered = filtered.filter((o) => o.status === query.status);
  }
  return filtered;
}

const mockRouter = require("express").Router();

// ── Health ──
mockRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", db: "mock" });
});

// ── Auth ──
mockRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = generateToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

mockRouter.post("/auth/register", (req, res) => {
  const { email, password, full_name, role, profile = {} } = req.body;
  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const newUser = {
    id: data.users.length + 1,
    full_name,
    email,
    password,
    role,
    profile,
    avatar_url: null,
    bio: "",
    created_at: new Date().toISOString(),
  };
  data.users.push(newUser);
  const token = generateToken(newUser);
  res.status(201).json({ token, user: sanitizeUser(newUser) });
});

mockRouter.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const decoded = decodeToken(authHeader.split(" ")[1]);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const user = findUserById(decoded.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: sanitizeUser(user) });
});

// ── Opportunities ──
mockRouter.get("/opportunities", (req, res) => {
  const filtered = applyFilters(data.opportunities, req.query);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const result = paginate(filtered, page, limit);
  res.json({
    data: result.items,
    meta: { page: result.page, limit, total: result.total },
  });
});

mockRouter.get("/opportunities/:id", (req, res) => {
  const opp = data.opportunities.find((o) => o.id === Number(req.params.id));
  if (!opp) return res.status(404).json({ error: "Opportunity not found" });
  res.json({ data: opp });
});

// ── Categories ──
mockRouter.get("/categories", (_req, res) => {
  res.json({ categories: data.categories });
});

// ── Bookmarks ──
function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const decoded = decodeToken(authHeader.split(" ")[1]);
  return decoded ? decoded.id : null;
}

mockRouter.get("/bookmarks", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const userBookmarks = data.bookmarks.filter((b) => b.user_id === userId);
  res.json({
    data: userBookmarks,
    meta: { page: 1, limit: userBookmarks.length, total: userBookmarks.length },
  });
});

mockRouter.post("/bookmarks", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const { opportunity_id } = req.body;
  if (!opportunity_id)
    return res.status(400).json({ error: "opportunity_id is required" });
  const exists = data.bookmarks.find(
    (b) => b.user_id === userId && b.opportunity_id === opportunity_id,
  );
  if (exists) return res.status(409).json({ error: "Already bookmarked" });
  const bookmark = {
    id: data.bookmarks.length + 1,
    user_id: userId,
    opportunity_id,
    created_at: new Date().toISOString(),
  };
  data.bookmarks.push(bookmark);
  res.status(201).json({ data: bookmark });
});

mockRouter.delete("/bookmarks/:opportunity_id", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const idx = data.bookmarks.findIndex(
    (b) =>
      b.opportunity_id === Number(req.params.opportunity_id) &&
      b.user_id === userId,
  );
  if (idx === -1) return res.status(404).json({ error: "Bookmark not found" });
  data.bookmarks.splice(idx, 1);
  res.status(204).end();
});

// ── Search ──
mockRouter.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q) return res.json({ results: [] });
  const results = data.opportunities.filter(
    (o) =>
      o.title.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.organization?.org_name?.toLowerCase().includes(q),
  );
  res.json({ results });
});

// ── Users ──
mockRouter.get("/users/me", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const user = findUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitizeUser(user) });
});

mockRouter.put("/users/me", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const user = data.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { full_name, bio, avatar_url } = req.body;
  if (full_name) user.full_name = full_name;
  if (bio !== undefined) user.bio = bio;
  if (avatar_url !== undefined) user.avatar_url = avatar_url;
  res.json({ user: sanitizeUser(user) });
});

// ── Applications ──
mockRouter.get("/applications", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const userApps = data.applications.filter((a) => a.user_id === userId);
  res.json({ applications: userApps });
});

mockRouter.post("/applications", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const { opportunity_id, cover_letter } = req.body;
  if (!opportunity_id)
    return res.status(400).json({ error: "opportunity_id is required" });
  const application = {
    id: data.applications.length + 1,
    user_id: userId,
    opportunity_id,
    cover_letter: cover_letter || "",
    status: "pending",
    created_at: new Date().toISOString(),
  };
  data.applications.push(application);
  res.status(201).json({ application });
});

// ── Organizations ──
mockRouter.get("/organizations/:id/opportunities", (req, res) => {
  const orgOpps = data.opportunities.filter(
    (o) => o.organization?.user_id === Number(req.params.id),
  );
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const result = paginate(orgOpps, page, limit);
  res.json({
    data: result.items,
    meta: { page: result.page, limit, total: result.total },
  });
});

// ── Admin ──
mockRouter.get("/admin/opportunities", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const user = findUserById(userId);
  if (!user || user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  const filtered = applyFilters(data.opportunities, req.query);
  res.json({ data: filtered });
});

mockRouter.put("/admin/opportunities/:id/status", (req, res) => {
  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  const user = findUserById(userId);
  if (!user || user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  const opp = data.opportunities.find((o) => o.id === Number(req.params.id));
  if (!opp) return res.status(404).json({ error: "Opportunity not found" });
  const { status } = req.body;
  if (!["active", "closed", "draft"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  opp.status = status;
  res.json({ data: opp });
});

module.exports = mockRouter;
