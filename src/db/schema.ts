import { pgTable, serial, text, integer, timestamp, date, boolean } from 'drizzle-orm/pg-core';

// ─── Boats ───────────────────────────────────────────────────────────
export const boats = pgTable('boats', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Bookings ────────────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  boatId: integer('boat_id').references(() => boats.id).notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),           // optional
  customerPhone: text('customer_phone').notNull(),  // with country code, e.g. +995599...
  guestCount: integer('guest_count').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  priceGel: integer('price_gel').notNull(),          // price shown at booking time
  status: text('status').default('pending').notNull(), // pending | confirmed | cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Blocked Dates ───────────────────────────────────────────────────
export const blockedDates = pgTable('blocked_dates', {
  id: serial('id').primaryKey(),
  boatId: integer('boat_id').references(() => boats.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reason: text('reason'),
});

// ─── Pricing Tiers ───────────────────────────────────────────────────
export const pricingTiers = pgTable('pricing_tiers', {
  id: serial('id').primaryKey(),
  minGuests: integer('min_guests').notNull(),
  maxGuests: integer('max_guests').notNull(),
  priceGel: integer('price_gel').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Operating Hours ─────────────────────────────────────────────────
export const operatingHours = pgTable('operating_hours', {
  id: serial('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(),       // 0=Sunday ... 6=Saturday
  openTime: text('open_time').notNull(),              // "09:00"
  closeTime: text('close_time').notNull(),            // "21:00"
  isClosed: boolean('is_closed').default(false).notNull(),
});

// ─── Settings ────────────────────────────────────────────────────────
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Daily Incomes ───────────────────────────────────────────────────
export const dailyIncomes = pgTable('daily_incomes', {
  id: serial('id').primaryKey(),
  date: date('date').unique().notNull(),
  rawInput: text('raw_input').notNull(), // e.g., "120, 150, 200"
  tripsCount: integer('trips_count').notNull(), // e.g., 3
  totalGel: integer('total_gel').notNull(), // e.g., 470
});
