-- Catálogo real de Ale: 23 productos con 60 presentaciones.
--
-- RECREA la tabla en vez de alterarla, y es deliberado:
--
--   · El enum `categoria` pierde tres valores (`bocaditos`, `salado`,
--     `sin-gluten-keto`). Postgres sabe AÑADIR valores a un enum, no quitarlos:
--     hay que recrear el tipo, y para eso no puede haber columnas que lo usen.
--   · Cambian los slugs de casi todos los productos, así que no hay ninguna fila
--     que valga la pena conservar. Todo lo que había en `products` venía de
--     `npm run db:seed`, que se vuelve a ejecutar después de esto.
--
-- Si algún día hay datos que NO vengan de la semilla —pedidos, ediciones desde el
-- panel—, esta migración deja de ser segura y hay que escribir una que migre fila
-- a fila. Hoy no los hay.
DROP TABLE IF EXISTS "products" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."categoria";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."ocasion";--> statement-breakpoint
CREATE TYPE "public"."categoria" AS ENUM('queques', 'galletas', 'dulces');--> statement-breakpoint
CREATE TYPE "public"."ocasion" AS ENUM('cumpleanos', 'bodas-bautizos', 'baby-shower', 'oficinas', 'regalos', 'navidad');--> statement-breakpoint
CREATE TYPE "public"."subcategoria" AS ENUM('cupcake', 'personalizado');--> statement-breakpoint
CREATE TABLE "product_variants" (
	"slug" text NOT NULL,
	"unit" text NOT NULL,
	"price" integer NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "product_variants_slug_unit_pk" PRIMARY KEY("slug","unit"),
	CONSTRAINT "product_variants_price_positive" CHECK ("product_variants"."price" > 0),
	CONSTRAINT "product_variants_unit_length" CHECK (char_length("product_variants"."unit") BETWEEN 3 AND 60)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"price_from" boolean DEFAULT false NOT NULL,
	"price_on_request" boolean DEFAULT false NOT NULL,
	"price_todo" boolean DEFAULT false NOT NULL,
	"description" text[] NOT NULL,
	"categoria" "categoria" NOT NULL,
	"subcategoria" "subcategoria",
	"ocasiones" "ocasion"[] NOT NULL,
	"ingredients" text[] DEFAULT '{}' NOT NULL,
	"allergens" text[] DEFAULT '{}' NOT NULL,
	"lead_time_hours" integer NOT NULL,
	"image_heights" integer[] NOT NULL,
	"image_alt" text NOT NULL,
	"image_b_heights" integer[],
	"image_b_alt" text,
	"photo_todo" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_kebab" CHECK ("products"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "products_price_positive" CHECK ("products"."price" > 0),
	CONSTRAINT "products_lead_time_range" CHECK ("products"."lead_time_hours" BETWEEN 24 AND 336),
	CONSTRAINT "products_description_size" CHECK (array_length("products"."description", 1) BETWEEN 1 AND 4),
	CONSTRAINT "products_ocasiones_not_empty" CHECK (array_length("products"."ocasiones", 1) >= 1),
	CONSTRAINT "products_ingredients_not_empty" CHECK (array_length("products"."ingredients", 1) >= 1),
	CONSTRAINT "products_image_heights_size" CHECK (array_length("products"."image_heights", 1) BETWEEN 1 AND 3),
	CONSTRAINT "products_image_b_complete" CHECK (("products"."image_b_heights" IS NULL) = ("products"."image_b_alt" IS NULL)),
	CONSTRAINT "products_on_request_is_from" CHECK (NOT ("products"."price_on_request" AND NOT "products"."price_from"))
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_slug_products_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."products"("slug") ON DELETE cascade ON UPDATE cascade;