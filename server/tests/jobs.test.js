const request = require("supertest");
const app = require("../server");
const db = require("./setup");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

async function makeUser(role, email) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: `${role} user`, email, password: "secret123", role });
  return res.body;
}

const sampleJob = {
  title: "Build a landing page",
  description: "Need a responsive marketing landing page built in React with clean code.",
  category: "Programming & Tech",
  budget: 800,
  deadline: "2026-12-01",
};

describe("Jobs CRUD", () => {
  test("a client can create a job (201) and read it back", async () => {
    const { token } = await makeUser("client", "c1@test.com");
    const create = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleJob);
    expect(create.status).toBe(201);
    expect(create.body.title).toBe(sampleJob.title);

    const read = await request(app).get(`/api/jobs/${create.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.title).toBe(sampleJob.title);
  });

  test("a freelancer cannot create a job (403 role enforcement)", async () => {
    const { token } = await makeUser("freelancer", "f1@test.com");
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleJob);
    expect(res.status).toBe(403);
  });

  test("rejects invalid job input (400 validation)", async () => {
    const { token } = await makeUser("client", "c2@test.com");
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", description: "too short", budget: -5, category: "Nope", deadline: "x" });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  test("listing supports pagination", async () => {
    const { token } = await makeUser("client", "c3@test.com");
    for (let i = 0; i < 12; i++) {
      await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...sampleJob, title: `Job ${i}` });
    }
    const page1 = await request(app).get("/api/jobs?page=1&limit=5");
    expect(page1.status).toBe(200);
    expect(page1.body.jobs.length).toBe(5);
    expect(page1.body.total).toBe(12);
    expect(page1.body.totalPages).toBe(3);
    expect(page1.body.hasMore).toBe(true);
  });

  test("only the owner can delete their job (403 for others)", async () => {
    const owner = await makeUser("client", "owner@test.com");
    const other = await makeUser("client", "other@test.com");
    const created = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${owner.token}`)
      .send(sampleJob);

    const forbidden = await request(app)
      .delete(`/api/jobs/${created.body.id}`)
      .set("Authorization", `Bearer ${other.token}`);
    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .delete(`/api/jobs/${created.body.id}`)
      .set("Authorization", `Bearer ${owner.token}`);
    expect(ok.status).toBe(200);
  });
});
