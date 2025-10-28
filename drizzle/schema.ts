import { int, mysqlTable, serial, varchar, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', {length: 255}).notNull(),
    userName: varchar('username', {length: 255}).unique(),
    password: text('password').notNull(),
    email: varchar('email', {length: 255}).notNull().unique(),
    role: mysqlEnum('role', ['admin', 'employer', 'applicant']).default('applicant'),
    phonenumber: varchar('number', {length: 255}),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}); 

export const sessions = mysqlTable('sessions', {
    id: varchar('id', {length: 255}).primaryKey(),
    userid: int('user_id').notNull().references(() => users.id, {onDelete: "cascade"}),
    userAgent: text('user_agent').notNull(),
    ip: varchar('ip', {length: 255}).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});