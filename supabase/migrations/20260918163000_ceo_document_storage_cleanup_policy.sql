-- Permit privileged organization users to clean up failed private document uploads.
drop policy if exists ceo_docs_storage_delete on storage.objects;
create policy ceo_docs_storage_delete on storage.objects for delete to authenticated
using (
 bucket_id='ceo-documents'
 and public.has_org_role(((storage.foldername(name))[1])::uuid,array['ceo','org_admin','executive'])
);
