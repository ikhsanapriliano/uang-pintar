const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const sql =
  "SELECT column_name, data_type, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name='Asset' AND column_name='usefulLife'";
p.$queryRawUnsafe(sql)
  .then((r) => {
    console.log(JSON.stringify(r));
    return p.$disconnect();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
