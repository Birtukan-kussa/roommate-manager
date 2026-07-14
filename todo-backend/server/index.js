import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import cors from "cors";
import schema from "../schema/schema.js";
import colors from "colors";
import connectDB from "./config/db.js";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ override: true });

const PORT = process.env.PORT || 9000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use("/api/auth", authRoutes);

// Optional auth middleware for GraphQL
const authenticateJwt = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

app.use("/graphql", authenticateJwt);

app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema: schema,
    graphiql: process.env.NODE_ENV === "development",
    context: { req },
  }))
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});