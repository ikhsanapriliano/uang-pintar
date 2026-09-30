const { Client } = require("pg");
const c = new Client({
  connectionString:
    "postgresql://postgres:123456@localhost:5432/general-affair?schema=public",
});
c.connect()
  .then(() =>
    c.query("SELECT id, name, \"usefulLife\" FROM \"Asset\" ORDER BY \"createdAt\" DESC LIMIT 10"),
  )
  .then((r) => {
    console.log(JSON.stringify(r.rows, null, 2));
    return c.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
