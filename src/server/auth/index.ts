import NextAuth from "next-auth";
import { cache } from "react";
import { authOptions } from "./auth-options";

const auth = cache(() => NextAuth(authOptions));

export { auth };
