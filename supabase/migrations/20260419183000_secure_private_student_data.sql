create extension if not exists "pgcrypto";

create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;

create policy "Students can view their own profile"
on public.student_profiles
for select
using (auth.uid() = id);

create policy "Students can create their own profile"
on public.student_profiles
for insert
with check (auth.uid() = id);

create policy "Students can update their own profile"
on public.student_profiles
for update
using (auth.uid() = id);

create table if not exists public.personal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists personal_tasks_user_id_idx on public.personal_tasks(user_id);

alter table public.personal_tasks enable row level security;

create policy "Students manage their own personal tasks"
on public.personal_tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.project_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  title text not null,
  details text not null,
  submission_date date not null,
  status text not null check (status in ('idea', 'in-progress', 'review', 'submitted')),
  created_at timestamptz not null default now()
);

create index if not exists project_plans_user_id_idx on public.project_plans(user_id);

alter table public.project_plans enable row level security;

create policy "Students manage their own project plans"
on public.project_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.chat_conversations
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists chat_conversations_user_id_idx on public.chat_conversations(user_id);

drop policy if exists "Anyone can manage conversations" on public.chat_conversations;
drop policy if exists "Anyone can manage messages" on public.chat_messages;

create policy "Students manage their own chat conversations"
on public.chat_conversations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Students manage messages from their own conversations"
on public.chat_messages
for all
using (
  exists (
    select 1
    from public.chat_conversations
    where public.chat_conversations.id = chat_messages.conversation_id
      and public.chat_conversations.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.chat_conversations
    where public.chat_conversations.id = chat_messages.conversation_id
      and public.chat_conversations.user_id = auth.uid()
  )
);
