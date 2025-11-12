"use server";

import { db } from "@/config/db";
import * as argon2 from "argon2";
import { eq, or } from "drizzle-orm";
import { applicants, employers, users } from "../../../drizzle/schema";
import { LoginUserData, LoginUserSchema, RegisterUserData, RegisterUserSchema } from "../auth.schema";
import { createSessionAndSetCookies, invalidateSession } from "./use-cases/sessions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from 'crypto'

export const registrationAction = async (data: RegisterUserData) => {

        try {
            const {data: validatedData, error} = RegisterUserSchema.safeParse(data);
            if (error) return {
                status: "ERROR",
                message: error.issues[0].message
            };

            const {name, userName, email, password, role} = validatedData

            // Check if user already exist
            const [user] = await db.select().from(users).where(or(eq(users.email, email), eq(users.userName, userName)));
            if (user) {
                if (user.email === email){
                    return {
                        status: "ERROR",
                        message: "User already registered with this email!",
                    };
                }
                else{
                    return {
                        status: "ERROR",
                        message: "User already registered with this username!",
                    };
                }
            }

            // hashing password
            const hashedPassword = await argon2.hash(password);
            await db.transaction( async (tx) => {
                const [result] = await tx.insert(users).values({name, userName, email, password: hashedPassword, role});
                if (role == 'employer'){
                    await tx.insert(employers).values({id: result.insertId});
                }
                else{
                    await tx.insert(applicants).values({id: result.insertId});
                }
                await createSessionAndSetCookies(result.insertId, tx)
            });

            return {
                status: 'SUCCESS',
                message: 'Registration Completed Succesfully!',
            };
        } catch (error) {
            return {
                status: 'ERROR',
                message: 'Unknown Error Occurred! Please Try Again Later',
            };
        }
};


export const loginAction = async (data: LoginUserData) => {

        try {

            const {data: validatedData, error} = LoginUserSchema.safeParse(data)
            if (error) return {
                status: "ERROR",
                message: error.issues[0].message
            };
            const {email, password} = validatedData

            // If user exist
            const [user] = await db.select().from(users).where(eq(users.email, email));

            if (!user){
                return {
                    status: "ERROR",
                    message: "Invalid email or password",
                }
            }

            // Checking password
            const isValid = await argon2.verify(user.password, password)

            await createSessionAndSetCookies(user.id)

            if (!isValid){
                return {
                    status: "ERROR",
                    message: "Invalid email or password",
                }
            }

            // Success
            return {
                status: "SUCCESS",
                message: "Login successful",
            }
        } catch (error) {
            console.log(error)
            return {
                status: "ERROR",
                message: "Something went wrong!"
            }
        }
};

export const logoutUserAction = async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;

    if(!session) return redirect('/login')

    const hashedToken = crypto.createHash('sha-256').update(session).digest('hex')

    await invalidateSession(hashedToken)
    cookieStore.delete("session")
    redirect('/login')
}