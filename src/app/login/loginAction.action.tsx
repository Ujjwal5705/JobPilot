"use server";

import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";

export const loginAction = async (data: {
        email: string,
        password: string,
    }) => {

        try {
            const {email, password} = data

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