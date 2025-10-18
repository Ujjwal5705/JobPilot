"use server";

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import * as argon2 from "argon2";
import { eq, or } from "drizzle-orm";

export const registrationAction = async (data: {
        name: string,
        userName: string,
        email: string,
        password: string,
        role: "employer" | "applicant",
    }) => {

        try {
            const {name, userName, email, password, role} = data

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
            await db.insert(users).values({name, userName, email, password: hashedPassword, role});

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