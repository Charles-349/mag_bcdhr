ALTER TABLE "employees" ALTER COLUMN "contract_type" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "contract_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "contract_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_types" DROP COLUMN "leave_type_category";--> statement-breakpoint
DROP TYPE "public"."contract_type";--> statement-breakpoint
DROP TYPE "public"."leave_type_category";