-- Deletes every post currently filed under the Crosshair category,
-- effectively emptying the Crosshairs feed. Run this in the Supabase
-- SQL editor.

delete from public.posts where category = 'crosshair';
