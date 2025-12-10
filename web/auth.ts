import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

// Disable NextAuth telemetry
process.env.NEXTAUTH_TELEMETRY = 'false'

declare module "next-auth" {
  interface Session {
    user: {
      robloxId: string
    } & DefaultSession["user"]
  }
  interface JWT {
    robloxId: string
  }
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  trustHost: true,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Custom Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Choose a username" },
        password: { label: "Password", type: "password", placeholder: "Create a password" },
      },
      async authorize(credentials) {
        // Basic validation - more detailed validation will be done client-side
        if (credentials?.username && credentials?.password) {
          // Generate fake ID
          const fakeId = Math.abs(
            credentials.username.split('').reduce((acc, char) => {
              return ((acc << 5) - acc) + char.charCodeAt(0)
            }, 0)
          ).toString()

          return {
            id: fakeId,
            name: credentials.username,
            email: null,
            image: null,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        // Generate a fake Roblox ID based on Google ID or email
        const identifier = user.id || user.email || 'default';
        const fakeRobloxId = Math.abs(
          identifier.split('').reduce((acc: number, char: string) => {
            return ((acc << 5) - acc) + char.charCodeAt(0)
          }, 0)
        ).toString();
        token.robloxId = fakeRobloxId;
      }
      return token
    },
    async session(params: { session: Session; token: JWT; user?: User; newSession?: boolean; trigger?: string }) {
      const { session, token } = params;
      if (session.user) {
        session.user.robloxId = token.robloxId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  telemetry: false,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)