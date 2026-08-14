CREATE TABLE "customers" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text,
	"marketing_opt_in" boolean DEFAULT true NOT NULL,
	"marketing_consent_at" timestamp with time zone NOT NULL,
	"marketing_consent_source" text NOT NULL,
	"marketing_consent_version" text NOT NULL,
	"marketing_opt_out_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_length" CHECK (char_length("customers"."email") BETWEEN 3 AND 254),
	CONSTRAINT "customers_email_normalized" CHECK ("customers"."email" = lower(btrim("customers"."email"))),
	CONSTRAINT "customers_name_length" CHECK ("customers"."name" IS NULL OR char_length("customers"."name") BETWEEN 1 AND 100),
	CONSTRAINT "customers_opt_out_consistent" CHECK (("customers"."marketing_opt_in" AND "customers"."marketing_opt_out_at" IS NULL) OR
          (NOT "customers"."marketing_opt_in" AND "customers"."marketing_opt_out_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "form_rate_limits" (
	"day" date NOT NULL,
	"ip_hash" text NOT NULL,
	"submissions" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_rate_limits_day_ip_hash_pk" PRIMARY KEY("day","ip_hash"),
	CONSTRAINT "form_rate_limits_hash_length" CHECK (char_length("form_rate_limits"."ip_hash") = 64),
	CONSTRAINT "form_rate_limits_submissions_positive" CHECK ("form_rate_limits"."submissions" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"product_slug" text NOT NULL,
	"product_name" text NOT NULL,
	"unit" text NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "order_items_order_id_position_pk" PRIMARY KEY("order_id","position"),
	CONSTRAINT "order_items_position_nonnegative" CHECK ("order_items"."position" >= 0),
	CONSTRAINT "order_items_slug_length" CHECK (char_length("order_items"."product_slug") BETWEEN 1 AND 120),
	CONSTRAINT "order_items_name_length" CHECK (char_length("order_items"."product_name") BETWEEN 1 AND 160),
	CONSTRAINT "order_items_unit_length" CHECK (char_length("order_items"."unit") BETWEEN 1 AND 100),
	CONSTRAINT "order_items_price_positive" CHECK ("order_items"."unit_price" > 0),
	CONSTRAINT "order_items_quantity_range" CHECK ("order_items"."quantity" BETWEEN 1 AND 20)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customer_email" text,
	"customer_name" text,
	"status" text DEFAULT 'whatsapp_opened' NOT NULL,
	"desired_date" date,
	"zone" text,
	"notes" text,
	"subtotal" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_status_known" CHECK ("orders"."status" = 'whatsapp_opened'),
	CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal" >= 0),
	CONSTRAINT "orders_customer_name_length" CHECK ("orders"."customer_name" IS NULL OR char_length("orders"."customer_name") BETWEEN 1 AND 100),
	CONSTRAINT "orders_zone_length" CHECK ("orders"."zone" IS NULL OR char_length("orders"."zone") <= 160),
	CONSTRAINT "orders_notes_length" CHECK ("orders"."notes" IS NULL OR char_length("orders"."notes") <= 500)
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_email_customers_email_fk" FOREIGN KEY ("customer_email") REFERENCES "public"."customers"("email") ON DELETE set null ON UPDATE cascade;