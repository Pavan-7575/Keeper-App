import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from '../models/User.js';
import OAuthModel from '../models/OAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const googleId = profile.id;
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const firstName = (profile.name && profile.name.givenName) || profile.displayName || 'Google';
                    const lastName = (profile.name && profile.name.familyName) || '';

                    let oauthAccount = await OAuthModel.findOAuthAccount('google', googleId);
                    let user;

                    if (oauthAccount) {
                        user = await UserModel.findById(oauthAccount.user_id);
                    } else {
                        if (email) {
                            user = await UserModel.findByEmail(email);
                        }

                        if (!user) {
                            const username = `user_${Date.now()}`;
                            user = await UserModel.createUser({
                                first_name: firstName,
                                last_name: lastName,
                                username,
                                email: email || `${googleId}@google.com`,
                                password_hash: null,
                                verification_token: null,
                            });
                            await UserModel.updateEmailVerified(user.id);
                        }

                        await OAuthModel.linkOAuthAccount(user.id, 'google', googleId);
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy registered successfully.');
} else {
    console.log('⚠️ Google OAuth is disabled because GOOGLE_CLIENT_ID is not configured in .env');
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_APP_ID !== 'your_facebook_app_id') {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
                profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const facebookId = profile.id;
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const firstName = (profile.name && profile.name.givenName) || profile.displayName || 'Facebook';
                    const lastName = (profile.name && profile.name.familyName) || '';

                    let oauthAccount = await OAuthModel.findOAuthAccount('facebook', facebookId);
                    let user;

                    if (oauthAccount) {
                        user = await UserModel.findById(oauthAccount.user_id);
                    } else {
                        if (email) {
                            user = await UserModel.findByEmail(email);
                        }

                        if (!user) {
                            const username = `fb_user_${Date.now()}`;
                            user = await UserModel.createUser({
                                first_name: firstName,
                                last_name: lastName,
                                username,
                                email: email || `${facebookId}@facebook.com`,
                                password_hash: null,
                                verification_token: null,
                            });
                            await UserModel.updateEmailVerified(user.id);
                        }

                        await OAuthModel.linkOAuthAccount(user.id, 'facebook', facebookId);
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
    console.log('✅ Facebook OAuth strategy registered successfully.');
} else {
    console.log('⚠️ Facebook OAuth is disabled because FACEBOOK_APP_ID is not configured in .env');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
