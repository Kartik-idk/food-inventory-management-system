CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"store_name" text DEFAULT 'My Store' NOT NULL,
	"owner_email" text DEFAULT 'store.owner@example.com' NOT NULL,
	"alerts_enabled" boolean DEFAULT true NOT NULL,
	"alert_high_risk" boolean DEFAULT true NOT NULL,
	"alert_critical_risk" boolean DEFAULT true NOT NULL,
	"alert_expired" boolean DEFAULT true NOT NULL,
	"max_discount_percentage" integer DEFAULT 50 NOT NULL,
	"pos_api_key_hash" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
