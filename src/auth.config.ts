import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { getUserByEmail, loginSchema } from "./schema"

import bcrypt from "bcryptjs"

export const authOptions = {
  trustHost: true,
};
 
export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)
        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await  getUserByEmail(email)

          if(!user || !user.password){
            return null
          }

          const isValid = await bcrypt.compare(password, user.password)

          if(isValid){
            return user
          }
        }
        return null
      }
    })
  ],
} satisfies NextAuthConfig;