import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
// @ts-expect-error passport-microsoft has no type declarations
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SerializedUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

// Find or create user + account from OAuth profile
async function findOrCreateUser(
  provider: string,
  providerId: string,
  email: string,
  displayName: string,
  avatarUrl: string | null,
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<SerializedUser> {
  // Check if account already exists for this provider
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerId: { provider, providerId } },
    include: { user: true },
  });

  if (existingAccount) {
    // Update tokens
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { accessToken, refreshToken },
    });
    return {
      id: existingAccount.user.id,
      email: existingAccount.user.email,
      displayName: existingAccount.user.displayName,
      avatarUrl: existingAccount.user.avatarUrl,
    };
  }

  // Check if user exists with this email (account linking)
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Link new provider to existing user
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        provider,
        providerId,
        accessToken,
        refreshToken,
      },
    });
    return {
      id: existingUser.id,
      email: existingUser.email,
      displayName: existingUser.displayName,
      avatarUrl: existingUser.avatarUrl,
    };
  }

  // Create new user + account
  const user = await prisma.user.create({
    data: {
      email,
      displayName,
      avatarUrl,
      accounts: {
        create: {
          provider,
          providerId,
          accessToken,
          refreshToken,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

export function configurePassport() {
  // Serialize user to session (store only id)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return done(null, false);
      done(null, {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      } as SerializedUser);
    } catch (err) {
      done(err);
    }
  });

  const callbackBase = process.env.BACKEND_URL || "http://localhost:3001";

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${callbackBase}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("No email from Google"));
            const user = await findOrCreateUser(
              "google",
              profile.id,
              email,
              profile.displayName,
              profile.photos?.[0]?.value || null,
              _accessToken,
              _refreshToken
            );
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  // Microsoft Strategy (personal accounts)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          callbackURL: `${callbackBase}/api/auth/microsoft/callback`,
          scope: ["user.read"],
          tenant: "common",
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName;
            if (!email) return done(new Error("No email from Microsoft"));
            const user = await findOrCreateUser(
              "microsoft",
              profile.id,
              email,
              profile.displayName,
              profile.photos?.[0]?.value || null,
              accessToken,
              refreshToken
            );
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  // Facebook Strategy
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          callbackURL: `${callbackBase}/api/auth/facebook/callback`,
          profileFields: ["id", "displayName", "photos", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("No email from Facebook. Please allow email access."));
            const user = await findOrCreateUser(
              "facebook",
              profile.id,
              email,
              profile.displayName,
              profile.photos?.[0]?.value || null,
              accessToken,
              refreshToken
            );
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  return passport;
}
