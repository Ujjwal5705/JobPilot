import crypto from 'crypto'
import { getIPAddress } from './location';
import { cookies, headers } from 'next/headers';
import { db } from '@/config/db';
import { sessions, users } from '../../../../drizzle/schema';
import { SESSION_LIFETIME, SESSION_REFRESH_TIME } from '@/config/constants';
import { eq } from 'drizzle-orm';
import { date } from 'zod';
import { invalidDataA } from '@hookform/resolvers/ajv/src/__tests__/__fixtures__/data-errors.js';

type CreateSessionData = {
    userAgent: string,
    ip: string,
    userID: number,
    token: string,
}

const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex').normalize();
};

const createUserSession = async ({token, userID, userAgent, ip} : CreateSessionData) => {
    const hashedToken = crypto.createHash('sha-256').update(token).digest('hex')

    const [session] = await db.insert(sessions).values({
        id: hashedToken,
        userid: userID,
        expiresAt: new Date(Date.now() + SESSION_LIFETIME*1000),
        ip,
        userAgent,
    });

}

export const createSessionAndSetCookies = async (userID: number) => {
    const token = generateSessionToken()
    const ip = await getIPAddress()
    const headersList = await headers()

    await createUserSession({
        token,
        userID: userID,
        userAgent: headersList.get('user-agent') || '',
        ip: ip,
    })

    const cookieStore = await cookies()

    cookieStore.set('session', token, {
        secure: true,
        httpOnly: true,
        maxAge: SESSION_LIFETIME,
    })
};

export const validateSessionAndGetUser = async (session: string) => {
    const hashedToken = crypto.createHash('sha-256').update(session).digest('hex')

    const [user] = await db.select({
        id: users.id,
        session: {
            id: sessions.id,
            expiresAt: sessions.expiresAt,
            userAgent: sessions.userAgent,
            ip: sessions.ip,
        },
        name: users.name,
        username: users.userName,
        role: users.role,
        phonenumber: users.phonenumber,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
    }).from(sessions).where(eq(sessions.id, hashedToken)).innerJoin(users, eq(users.id, sessions.userid))

    if (!user) return null

    if (Date.now() >= user.session.expiresAt.getDate()){
        await invalidateSession(user.session.id)
    }

    if (Date.now() >= user.session.expiresAt.getDate() - SESSION_REFRESH_TIME * 1000){
        await db.update(sessions).set({
            expiresAt: new Date(Date.now() + SESSION_LIFETIME * 1000)
        }).where(eq(sessions.id, user.session.id))
    }

    return user
}

const invalidateSession = async (id: string) => {
    await db.delete(sessions).where(eq(sessions.id, id))
}