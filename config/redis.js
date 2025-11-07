require("dotenv").config();

const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!baseUrl || !token) {
  console.error("Missing Upstash REST credentials in .env");
}
  //store data with expiration in seconds
async function redisSet(key, value, expireSeconds = 3600) {
  const res = await fetch(`${baseUrl}/set/${key}/${value}?EX=${expireSeconds}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
//get data from redis,
async function redisGet(key) {
  const res = await fetch(`${baseUrl}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.result;
}

async function testRedis() {
  try {
    console.log("Testing Upstash Redis REST connection...");
    await redisSet("trainlineTest", "Redis REST Connected!", 10);
    const value = await redisGet("trainlineTest");
    console.log("Redis REST test value:", value);
  } catch (error) {
    console.error("Redis REST test failed:", error.message);
  }
}

module.exports = {
  redisSet,
  redisGet,
  testRedis,
};
