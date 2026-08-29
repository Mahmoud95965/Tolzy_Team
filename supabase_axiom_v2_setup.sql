-- ==============================================================================
-- 🚀 AXIOM V2 - SUPABASE PGVECTOR SETUP & SEARCH FUNCTIONS
-- ==============================================================================

-- 1. Enable the pgvector extension
create extension if not exists vector;

-- 2. Create tools_embeddings table (with 1024 dimensions for Azure text-embedding-3-small)
create table if not exists tools_embeddings (
  id text primary key,
  name text not null,
  description text,
  category text,
  pricing text default 'Freemium',
  pros text[] default '{}',
  cons text[] default '{}',
  use_cases text[] default '{}',
  website_url text,
  link text,
  embedding vector(1024),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Create courses_embeddings table
create table if not exists courses_embeddings (
  id text primary key,
  title text not null,
  description text,
  category text,
  level text default 'All Levels',
  price text default 'Free',
  link text,
  thumbnail text,
  embedding vector(1024),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create HNSW Vector Indexes for lightning-fast cosine similarity search
create index if not exists idx_tools_embeddings_hnsw 
on tools_embeddings 
using hnsw (embedding vector_cosine_ops);

create index if not exists idx_courses_embeddings_hnsw 
on courses_embeddings 
using hnsw (embedding vector_cosine_ops);

create index if not exists idx_tools_category on tools_embeddings (category);
create index if not exists idx_courses_category on courses_embeddings (category);

-- 5. Drop any older functions to avoid signature conflicts
drop function if exists match_tools_v2(vector(1024), float, int, text);
drop function if exists match_tools_v2(vector(1024), float, int);
drop function if exists match_courses(vector(1024), float, int, text);
drop function if exists match_courses(vector(1024), float, int);

-- 6. Create match_tools_v2 RPC Function for high-precision tool recommendations
create or replace function match_tools_v2 (
  query_embedding vector(1024),
  match_threshold float default 0.65,
  match_count int default 5,
  filter_category text default null
)
returns table (
  id text,
  name text,
  description text,
  category text,
  pricing text,
  pros text[],
  cons text[],
  use_cases text[],
  website_url text,
  link text,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    t.id,
    t.name,
    t.description,
    t.category,
    t.pricing,
    t.pros,
    t.cons,
    t.use_cases,
    t.website_url,
    t.link,
    (1 - (t.embedding <=> query_embedding))::float as similarity
  from tools_embeddings t
  where (1 - (t.embedding <=> query_embedding)) >= match_threshold
    and (
      filter_category is null 
      or lower(filter_category) = 'general'
      or lower(t.category) = lower(filter_category)
    )
  order by t.embedding <=> query_embedding asc
  limit match_count;
end;
$$;

-- 7. Create match_courses RPC Function
create or replace function match_courses (
  query_embedding vector(1024),
  match_threshold float default 0.55,
  match_count int default 3,
  filter_category text default null
)
returns table (
  id text,
  title text,
  description text,
  category text,
  level text,
  price text,
  link text,
  thumbnail text,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    c.id,
    c.title,
    c.description,
    c.category,
    c.level,
    c.price,
    c.link,
    c.thumbnail,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from courses_embeddings c
  where (1 - (c.embedding <=> query_embedding)) >= match_threshold
    and (
      filter_category is null 
      or lower(filter_category) = 'general'
      or lower(c.category) = lower(filter_category)
    )
  order by c.embedding <=> query_embedding asc
  limit match_count;
end;
$$;
