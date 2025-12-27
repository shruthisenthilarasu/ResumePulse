import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          // Update last login
          user = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } else {
          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.emails?.[0]?.value || '' },
          });

          if (existingUser) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: profile.id,
                authProvider: 'GOOGLE',
                avatarUrl: profile.photos?.[0]?.value,
                name: profile.displayName || existingUser.name,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || '',
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value,
                authProvider: 'GOOGLE',
              },
            });
          }
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;

