import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import cors from "cors";
import schema from "../schema/schema.js";
import colors from "colors";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

const app = express();

connectDB();

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: process.env.NODE_ENV === "development",
  })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});