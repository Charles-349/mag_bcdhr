ALTER TABLE "companies" ADD COLUMN "country_code" varchar(5) DEFAULT 'KE' NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "proof_document" varchar(255);