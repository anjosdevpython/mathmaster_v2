
-- Tabela de progresso do usuário
create table if not exists public.game_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default auth.uid() not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Garante que cada usuário tenha apenas 1 registro de progresso
  constraint unique_user_progress unique (user_id)
);

-- Ativar Row Level Security (RLS)
alter table public.game_progress enable row level security;

-- Política: Usuário pode ver apenas seu próprio progresso
create policy "Users can view own progress" 
on public.game_progress for select 
using (auth.uid() = user_id);

-- Política: Usuário pode inserir apenas seu próprio progresso
create policy "Users can insert own progress" 
on public.game_progress for insert 
with check (auth.uid() = user_id);

-- Política: Usuário pode atualizar apenas seu próprio progresso
create policy "Users can update own progress" 
on public.game_progress for update 
using (auth.uid() = user_id);

-- Função para atualizar timestamp automaticamente
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_progress_updated
  before update on public.game_progress
  for each row execute procedure public.handle_updated_at();
