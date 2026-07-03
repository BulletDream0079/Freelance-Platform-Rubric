const request = require("supertest");
const app = require("../server");
const db = require("./setup");

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

async function makeUser(role, email) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: `${role}`, email, password: "secret123", role });
  return res.body;
}

async function makeJob(token) {
  const res = await request(app)
    .post("/api/jobs")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Logo design",
      description: "Design a modern logo for a coffee brand, vector deliverables required.",
      category: "Graphics & Design",
      budget: 300,
      deadline: "2026-12-01",
    });
  return res.body;
}

describe("Proposal workflow", () => {
  test("accepting one proposal auto-rejects the others and sets job in-progress", async () => {
    const client = await makeUser("client", "c@test.com");
    const f1 = await makeUser("freelancer", "f1@test.com");
    const f2 = await makeUser("freelancer", "f2@test.com");
    const job = await makeJob(client.token);

    const p1 = await request(app).post("/api/proposals").set("Authorization", `Bearer ${f1.token}`)
      .send({ jobId: job.id, coverLetter: "I can do this well", bid: 280, deliveryDays: 5 });
    const p2 = await request(app).post("/api/proposals").set("Authorization", `Bearer ${f2.token}`)
      .send({ jobId: job.id, coverLetter: "Pick me, great portfolio", bid: 260, deliveryDays: 4 });
    expect(p1.status).toBe(201);
    expect(p2.status).toBe(201);

    const accept = await request(app)
      .put(`/api/proposals/${p1.body.id}/status`)
      .set("Authorization", `Bearer ${client.token}`)
      .send({ status: "accepted" });
    expect(accept.status).toBe(200);
    expect(accept.body.status).toBe("accepted");

    const list = await request(app)
      .get(`/api/proposals/job/${job.id}`)
      .set("Authorization", `Bearer ${client.token}`);
    const other = list.body.find((p) => p.id === p2.body.id);
    expect(other.status).toBe("rejected");

    const jobAfter = await request(app).get(`/api/jobs/${job.id}`);
    expect(jobAfter.body.status).toBe("in-progress");
  });

  test("a second accept is rejected once the job already has an accepted proposal (409)", async () => {
    const client = await makeUser("client", "c2@test.com");
    const f1 = await makeUser("freelancer", "fa@test.com");
    const f2 = await makeUser("freelancer", "fb@test.com");
    const job = await makeJob(client.token);

    const p1 = await request(app).post("/api/proposals").set("Authorization", `Bearer ${f1.token}`)
      .send({ jobId: job.id, coverLetter: "Cover letter one", bid: 200, deliveryDays: 3 });
    const p2 = await request(app).post("/api/proposals").set("Authorization", `Bearer ${f2.token}`)
      .send({ jobId: job.id, coverLetter: "Cover letter two", bid: 210, deliveryDays: 3 });

    await request(app).put(`/api/proposals/${p1.body.id}/status`)
      .set("Authorization", `Bearer ${client.token}`).send({ status: "accepted" });

    const second = await request(app).put(`/api/proposals/${p2.body.id}/status`)
      .set("Authorization", `Bearer ${client.token}`).send({ status: "accepted" });
    expect(second.status).toBe(409);
  });

  test("a freelancer cannot view another client's job proposals (403)", async () => {
    const client = await makeUser("client", "c3@test.com");
    const freelancer = await makeUser("freelancer", "fc@test.com");
    const job = await makeJob(client.token);

    const res = await request(app)
      .get(`/api/proposals/job/${job.id}`)
      .set("Authorization", `Bearer ${freelancer.token}`);
    expect(res.status).toBe(403);
  });
});
