import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from 'dotenv';
import UserModel from '../models/User.js';
import OAuthModel from '../models/OAuth.js';

dotenv.config();

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const googleId = profile.id;
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const firstName = profile.name ? profile.name.givenName : 'Google';
                    const lastName = profile.name ? profile.name.familyName : 'User';
                    const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

                    // 1. Check if OAuth account exists
                    let oauthAccount = await OAuthModel.findOAuthAccount('google', googleId);
                    let user;

                    if (oauthAccount) {
                        user = await UserModel.findById(oauthAccount.user_id);
                    } else {
                        // 2. Check if user with same email exists
                        if (email) {
                            user = await UserModel.findByEmail(email);
                        }

                        // 3. Create user if not exists
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

                        // Link OAuth account
                        await OAuthModel.linkOAuthAccount(user.id, 'google', googleId);
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_APP_ID !== 'your_facebook_app_id') {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: '/api/auth/facebook/callback',
                profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const facebookId = profile.id;
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const firstName = profile.name ? profile.name.givenName : 'Facebook';
                    const lastName = profile.name ? profile.name.familyName : 'User';
                    const profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

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
