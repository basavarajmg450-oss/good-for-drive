drop policy if exists "verifications public read" on storage.objects;

create policy "verifications owner read"
  on storage.objects for select
  using (bucket_id = 'verifications' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "verifications admin read"
  on storage.objects for select
  using (bucket_id = 'verifications' and public.has_role(auth.uid(),'admin'));

update storage.buckets set public = false where id = 'verifications';