CREATE INDEX "waste_items_category_id_idx" ON "waste_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "waste_logs_user_id_idx" ON "waste_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "waste_logs_created_at_idx" ON "waste_logs" USING btree ("created_at");