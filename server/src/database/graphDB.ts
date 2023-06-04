import dotenv from "dotenv";
import neo4j, { auth } from "neo4j-driver";
dotenv.config();

export const graphDB = neo4j.driver(
  process.env.NEO4J_URL!,
  auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PWD!),
  { connectionTimeout: 600_000, maxConnectionLifetime: 600_000, connectionAcquisitionTimeout: 600_000 }
);

const createIndexes = async () => {
  const session = graphDB.session();
  console.info("Creating indexes");
  await session.run(`
    CREATE FULLTEXT INDEX namesAndOrgnrs IF NOT EXISTS 
    FOR (n:Company|Shareholder|Person|Unit) 
    ON EACH [n.name, n.orgnr]
  `);
  console.info("Indexes created");
  session.close();
};

const createConstraints = async () => {
  const session = graphDB.session();
  console.info("Creating constraints");
  await session.run(`CREATE CONSTRAINT company_uuids IF NOT EXISTS FOR (n:Company) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT shareholder_uuids IF NOT EXISTS FOR (n:Shareholder) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT unit_uuids IF NOT EXISTS FOR (n:Unit) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT person_uuids IF NOT EXISTS FOR (n:Person) REQUIRE n.uuid is UNIQUE`);
  await session.run(`CREATE CONSTRAINT unique_company_orgnrs IF NOT EXISTS FOR (c:Company) REQUIRE c.orgnr IS UNIQUE`);
  await session.run(`CREATE CONSTRAINT unique_unit_orgnrs IF NOT EXISTS FOR (u:Unit) REQUIRE u.orgnr IS UNIQUE`);
  await session.run(
    `CREATE CONSTRAINT unique_shareholder_orgnrs IF NOT EXISTS FOR (s:Shareholder) REQUIRE s.orgnr IS UNIQUE`
  );
  await session.run(
    `CREATE CONSTRAINT unique_shareholder_ids IF NOT EXISTS FOR (s:Shareholder) REQUIRE s.id IS UNIQUE`
  );
  await session.run(
    `CREATE CONSTRAINT unique_people IF NOT EXISTS FOR (p:Person) REQUIRE (p.birthDate, p.firstName, p.lastName) IS UNIQUE`
  );
  console.info("Created constraints");
  session.close();
};

createIndexes().catch((e) => {
  console.error("Failed to create indexes", e);
});

createConstraints().catch((e) => {
  console.error("Feiled to create constraints", e);
});
