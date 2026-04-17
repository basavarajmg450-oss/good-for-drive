insert into storage.buckets (id, name, public) values ('verifications','verifications', true)
on conflict (id) do nothing;

create policy "verifications public read"
  on storage.objects for select using (bucket_id = 'verifications');

create policy "verifications own upload"
  on storage.objects for insert
  with check (bucket_id = 'verifications' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "verifications own update"
  on storage.objects for update
  using (bucket_id = 'verifications' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "verifications admin all"
  on storage.objects for all
  using (bucket_id = 'verifications' and public.has_role(auth.uid(),'admin'));