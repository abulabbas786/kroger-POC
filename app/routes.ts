import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
    // Client 
    route("/", "./routes/home.tsx"),
    // API
    route("/api/customers", "./api/routes/customers.ts"),
] satisfies RouteConfig;