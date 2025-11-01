import crypto from 'crypto'
import { getIPAddress } from './location';
import { cookies, headers } from 'next/headers';
import { db } from '@/config/db';
import { sessions } from '../../../../drizzle/schema';
import { SESSION_LIFETIME } from '@/config/constants';

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