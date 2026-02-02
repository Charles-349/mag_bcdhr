ALTER TABLE "leave_balances" DROP CONSTRAINT "leave_balances_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;