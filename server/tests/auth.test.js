const request = require("supertest");
const app = require("../server");
const db = require("./setup");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

describe("Auth", () => {
  const valid = { name: "Test Client", email: "client@test.com", password: "secret123", role: "client" };

  test("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("client@test.com");
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.role).toBe("client");
  });

  test("rejects registration with a short password (validation, 400)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validation/i);
  });

  test("rejects duplicate email (409)", async () => {
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(res.status).toBe(409);
  });

  test("logs in with correct credentials and rejects wrong ones", async () => {
    await request(app).post("/api/auth/register").send(valid);

    const ok = await request(app)
      .post("/api/auth/login")
      .send({ email: valid.email, password: valid.password });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeDefined();

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: valid.email, password: "wrongpass" });
    expect(bad.status).toBe(401);
  });

  test("GET /api/auth/me requires a token (401 without, 200 with)", async () => {
    const reg = await request(app).post("/api/auth/register").send(valid);

    const noToken = await request(app).get("/api/auth/me");
    expect(noToken.status).toBe(401);

    const withToken = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(withToken.status).toBe(200);
    expect(withToken.body.email).toBe(valid.email);
  });
});
