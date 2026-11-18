# HUSTLEVERSE-
lic.profiles enabeateew their own profile (example) create policy "Public profiles are viewable by everyone."    on public.profiles for select    using ( true );  -- 4. Create a policy allowing users to update their own profile create policy "Users can update own profile."    on public.profiles for update    using ( auth.uid() = id );
