import { pgTable, serial, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Owner Instances (Divisi/Unit) ───────────────────────────────────────────
export const ownerInstances = pgTable('owner_instances', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 20 }).notNull().unique(),   // ex: TU, PE, LIT
  name: varchar('name', { length: 100 }).notNull(),           // ex: Tata Usaha
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Categories (3-level tree) ────────────────────────────────────────────────
// level 1 = TYPE        (E, F, L)
// level 2 = KATEGORI    (EA, EP, FS, ...)
// level 3 = SUBKATEGORI (EAS, EAD, ...)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  // Combined code used to build asset ID: level-1 prefix + level-2 char + level-3 char
  // For root type: "E" | For sub-cat: "ES" | For leaf: stored as 2-char code on level-3
  code: varchar('code', { length: 10 }).notNull().unique(),   // ex: E, EA, EAS
  level: integer('level').notNull().default(1),               // 1 | 2 | 3
  parentId: integer('parent_id'),                             // null for root
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parent_child',
  }),
  children: many(categories, { relationName: 'parent_child' }),
}));

// ─── Assets ───────────────────────────────────────────────────────────────────
export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  // Format: [TYPE][CAT][SUBCAT][NNNN]/[OWNER]  e.g. ES0001/TU
  assetId: varchar('asset_id', { length: 40 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),   // points to level-3
  ownerInstanceId: integer('owner_instance_id').references(() => ownerInstances.id),
  status: varchar('status', { length: 20 }).default('available'),       // available | borrowed | maintenance | lost
  condition: varchar('condition', { length: 20 }).default('good'),      // good | fair | damaged
  quantity: integer('quantity').default(1),
  location: varchar('location', { length: 100 }),
  baseLocation: varchar('base_location', { length: 100 }),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const assetsRelations = relations(assets, ({ one }) => ({
  category: one(categories, { fields: [assets.categoryId], references: [categories.id] }),
  ownerInstance: one(ownerInstances, { fields: [assets.ownerInstanceId], references: [ownerInstances.id] }),
}));

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('member'),   // admin | operator | member
  className: varchar('class', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Loans ────────────────────────────────────────────────────────────────────
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
  status: varchar('status', { length: 20 }).default('active'),   // active | returned | overdue
  returnCondition: varchar('return_condition', { length: 20 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loansRelations = relations(loans, ({ one }) => ({
  asset: one(assets, { fields: [loans.assetId], references: [assets.id] }),
  operator: one(users, { fields: [loans.operatorId], references: [users.id] }),
}));

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 50 }).notNull(),
  entityType: varchar('entity_type', { length: 30 }),
  entityId: integer('entity_id'),
  actorId: integer('actor_id').references(() => users.id),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow(),
});