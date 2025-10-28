import { z } from "zod/v3";

export const RegisterUserSchema = z.object({
        name: z.string().trim().min(2, 'Name must be atleast 2 char long').max(255, 'Name must not exceed 255 characters'),
        userName: z.string().trim().min(3, 'Username must be atleast 3 char long').max(255, 'Username must not exceed 255 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
        email: z.string().email('Please enter a valid Email Address').trim().max(255, 'Email must not exceed 255 characters').toLowerCase(),
        password: z.string().min(8, 'Password must be atleast 8 characters long').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain atleast one lowercase letter, one uppercase letter and one number.'),
        role: z.enum(['applicant', 'employer'], {message: 'Role must be applicant or employer'}).default('applicant'),
});

export type RegisterUserData = z.infer<typeof RegisterUserSchema>

export const LoginUserSchema = z.object({
        email: z.string().email('Please enter a valid Email Address').trim().max(255, 'Email must not exceed 255 characters').toLowerCase(),
        password: z.string().min(8, 'Password must be atleast 8 characters long'),
});

export type LoginUserData = z.infer<typeof LoginUserSchema>

export const registerUserWithConfirmSchema = RegisterUserSchema
.extend({
        confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
});

export type RegisterUserWithConfirmData = z.infer<typeof registerUserWithConfirmSchema>