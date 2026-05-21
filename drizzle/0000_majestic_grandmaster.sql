CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" varchar(30) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category_id" integer,
	"status" varchar(20) DEFAULT 'available',
	"condition" varchar(20) DEFAULT 'good',
	"quantity" integer DEFAULT 1,
	"location" varchar(100),
	"base_location" varchar(100),
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assets_asset_id_unique" UNIQUE("asset_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(30),
	"entity_id" integer,
	"actor_id" integer,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"prefix" varchar(10) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_prefix_unique" UNIQUE("prefix")
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" serial PRIMARY KEY NOT NULL,
	"loan_code" varchar(30) NOT NULL,
	"asset_id" integer,
	"borrower_name" varchar(100) NOT NULL,
	"borrower_class" varchar(30),
	"borrower_contact" varchar(50),
	"operator_id" integer,
	"purpose" text,
	"loan_date" timestamp DEFAULT now(),
	"due_date" timestamp NOT NULL,
	"return_date" timestamp,
	"status" varchar(20) DEFAULT 'active',
	"return_condition" varchar(20),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "loans_loan_code_unique" UNIQUE("loan_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'member',
	"class" varchar(20),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;