import NextAuth, { DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT, Session, DefaultSession } from "next-auth"

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Custom Account",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Choose a username" },
      },
      async authorize(credentials) {
        // Let anyone create an account with any username - no password needed!
        if (credentials?.username) {
          // Generate a fake Roblox ID based on username hash
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
    async jwt({ token, user }: { token: JWT, user: unknown }) {
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
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.robloxId = token.robloxId
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