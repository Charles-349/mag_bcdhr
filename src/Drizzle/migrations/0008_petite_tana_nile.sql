ALTER TABLE "leave_requests" ALTER COLUMN "total_days" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "approving_department_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approving_department_id_departments_id_fk" FOREIGN KEY ("approving_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" DROP COLUMN "include_weekends";--> statement-breakpoint
ALTER TABLE "leave_requests" DROP COLUMN "include_holidays";