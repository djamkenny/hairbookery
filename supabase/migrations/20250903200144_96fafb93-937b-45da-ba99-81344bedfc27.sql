-- Enable real-time updates for laundry_orders table
ALTER TABLE laundry_orders REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE laundry_orders;