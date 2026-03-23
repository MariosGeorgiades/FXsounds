-- Run this SQL in your Supabase SQL Editor to enable unlimited Photo Upload Storage!

-- 1. Create a new storage bucket called 'gallery' and make it public
insert into storage.buckets (id, name, public) 
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- 2. Allow public read access to the 'gallery' bucket so visitors can see the images
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'gallery' );

-- 3. Allow anonymous uploads and deletes (since the admin panel uses the public anon key for now)
create policy "Anon Uploads" 
on storage.objects for insert 
with check ( bucket_id = 'gallery' );

create policy "Anon Deletes" 
on storage.objects for delete 
using ( bucket_id = 'gallery' );
