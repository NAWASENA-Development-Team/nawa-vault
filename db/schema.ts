import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  prefix: varchar('prefix', { length: 10 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  assetId: varchar('asset_id', { length: 30 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  status: varchar('status', { length: 20 }).default('available'),
  condition: varchar('condition', { length: 20 }).default('good'),
  quantity: integer('quantity').default(1),
  location: varchar('location', { length: 100 }),
  baseLocation: varchar('base_location', { length: 100 }),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('member'),
  className: varchar('class', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loans = pgTable('loans', {
  id: serial('id').primaryKey(),
  loanCode: varchar('loan_code', { length: 30 }).unique().notNull(),
  assetId: integer('asset_id').references(() => assets.id),
  borrowerName: varchar('borrower_name', { length: 100 }).notNull(),
  borrowerClass: varchar('borrower_class', { length: 30 }),
  borrowerContact: varchar('borrower_contact', { length: 50 }),
  operatorId: integer('operator_id').references(() => users.id),
  purpose: text('purpose'),
  loanDate: timestamp('loan_date').defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  returnDate: timestamp('return_date'),
  status: varchar('status', { length: 20 }).default('active'),
  returnCondition: varchar('return_condition', { length: 20 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 30 }),
  entityId: integer('entity_id'),
  actorId: integer('actor_id').references(() => users.id),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});