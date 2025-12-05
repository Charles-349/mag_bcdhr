CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_name_unique" UNIQUE("name"),
	CONSTRAINT "companies_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"gender" "gender" NOT NULL,
	"image_url" varchar(255) DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_email_unique";--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "company_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_types" ADD COLUMN "company_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_roles" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "firstname";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "lastname";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "gender";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "leave_types" DROP COLUMN "restricted_to_gender";--> statement-breakpoint
ALTER TABLE "user_roles" DROP COLUMN "employee_id";