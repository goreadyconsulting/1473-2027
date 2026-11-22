
-- Isolated LARP portal schema. No changes to existing Supabase tables.
create schema if not exists larp_portal;
revoke all on schema larp_portal from public, anon, authenticated;
grant usage on schema larp_portal to service_role;

create table if not exists larp_portal.places (
  id text primary key,
  name text not null,
  rune text not null,
  description text not null default '',
  background text not null,
  stills jsonb not null default '[]'::jsonb,
  sort_order smallint not null unique
);
create table if not exists larp_portal.relics (
  id text primary key,
  place_id text not null references larp_portal.places(id),
  name text not null,
  image text not null,
  power text not null default '',
  catch_text text not null default '',
  consequence text not null default '',
  sort_order smallint not null unique,
  active boolean not null default true
);
create index if not exists larp_relics_active_place_idx on larp_portal.relics(place_id) where active;

create table if not exists larp_portal.sessions (
  id smallint primary key default 1 check (id=1),
  run_id uuid not null default gen_random_uuid(),
  status text not null default 'ready' check(status in ('ready','running','paused','ended')),
  elapsed_seconds double precision not null default 0 check(elapsed_seconds>=0),
  duration_seconds integer not null default 25200 check(duration_seconds between 60 and 86400),
  interval_seconds integer not null default 3600 check(interval_seconds>=60),
  last_resumed_at timestamptz,
  processed_hours smallint not null default 0,
  double_hour smallint not null default 0 check(double_hour between 0 and 7),
  journey_version integer not null default 1,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
create table if not exists larp_portal.events (
  id bigint generated always as identity primary key,
  run_id uuid not null,
  item_id text references larp_portal.relics(id),
  kind text not null check(kind in ('hourly','bonus','restore','manual','start','pause','resume','reset','end','scene')),
  hour_number smallint,
  created_at timestamptz not null default now()
);
create index if not exists larp_events_run_idx on larp_portal.events(run_id,id desc);
create table if not exists larp_portal.admin_auth (
  id smallint primary key default 1 check(id=1),
  salt text not null,
  secret_hash text not null
);
revoke all on all tables in schema larp_portal from public, anon, authenticated;
revoke all on all sequences in schema larp_portal from public, anon, authenticated;
alter table larp_portal.places enable row level security;
alter table larp_portal.relics enable row level security;
alter table larp_portal.sessions enable row level security;
alter table larp_portal.events enable row level security;
alter table larp_portal.admin_auth enable row level security;

insert into larp_portal.places(id,name,rune,description,background,stills,sort_order) values
('emberfall','Emberfall Keep','ᚠ','The abandoned citadel','./assets/realms/emberfall.svg','["./assets/reels/emberfall-1.svg","./assets/reels/emberfall-2.svg","./assets/reels/emberfall-3.svg"]',1),
('glasswind','The Forgotten Grocery','ᚹ','A store from a future that should not exist','./assets/reels/glasswind-3.svg','["./assets/reels/glasswind-1.svg","./assets/reels/glasswind-2.svg","./assets/reels/glasswind-3.svg"]',2),
('verdant','Verdant Hollow','ᛉ','A valley beyond the maps','./assets/realms/verdant.svg','["./assets/reels/verdant-1.svg","./assets/reels/verdant-2.svg","./assets/reels/verdant-3.svg"]',3),
('stormglass','Stormglass Spire','ᚱ','The storm never stops','./assets/realms/stormglass.svg','["./assets/reels/stormglass-1.svg","./assets/reels/stormglass-2.svg","./assets/reels/stormglass-3.svg"]',4),
('bleakwater','Bleakwater Crossing','ᛚ','The crossing at the edge of the world','./assets/realms/bleakwater.svg','["./assets/reels/bleakwater-1.svg","./assets/reels/bleakwater-2.svg","./assets/reels/bleakwater-3.svg"]',5),
('sanctum','The Quiet Sanctum','ᛟ','A chamber of impossible remedies','./assets/realms/sanctum.svg','["./assets/reels/sanctum-1.svg","./assets/reels/sanctum-2.svg","./assets/reels/sanctum-3.svg"]',6),
('iron','Echoes of Iron','ᚨ','Machines left to sleep','./assets/realms/iron.svg','["./assets/reels/iron-1.svg","./assets/reels/iron-2.svg","./assets/reels/iron-3.svg"]',7)
on conflict(id) do nothing;

insert into larp_portal.relics(id,place_id,name,image,power,catch_text,consequence,sort_order) values
('smartphone','iron','Smartphone','./assets/objects/smartphone.svg','Information, books, maps, photos, recordings and future knowledge.','37% battery; no electrical supply, charger or network.','Knowledge could advance technology and rewrite history.',1),
('toilet','glasswind','Giant pack of toilet paper','./assets/objects/toilet.svg','Soft and absorbent, offering extraordinary medieval comfort.','Cannot be replenished, though the enormous pack may last a lifetime.','Probably no great effect upon history.',2),
('history','emberfall','History book 1300–2027','./assets/objects/history.svg','Foreknowledge of wars, rulers, discoveries, disasters, and inventions.','The first change to history makes the book less reliable.','Averted disasters may be replaced with new ones.',3),
('medical','sanctum','Modern doctor''s kit','./assets/objects/medical.svg','Tools from centuries ahead of the most skilled medieval healer.','Training is missing; supplies are finite.','Treatment could become much safer if people learn to use it.',4),
('worldmap','verdant','Modern world map','./assets/objects/worldmap.svg','An unprecedented view of continents, coastlines and the wider world.','Political borders and place names differ in 1473.','Exploration and colonisation could unfold differently.',5),
('firearm','emberfall','Modern firearm','./assets/objects/firearm.svg','A weapon far beyond medieval arms.','Finite ammunition and no viable manufacturing or repair process.','Even a brief advantage might change the balance of power.',6),
('led','stormglass','Portable LED lights','./assets/objects/led.svg','Bright and beautiful light without fire.','Battery charge will eventually run out.','Few lasting effects; a little more wonder in the night.',7),
('condoms','sanctum','Contraceptive supplies','./assets/objects/condoms.svg','Greater control over family planning and some infection risk.','Single-use, limited supply and unfamiliar to the population.','Family size, inheritance and women''s lives might change.',8),
('filter','bleakwater','Portable water purifier','./assets/objects/filter.svg','Removes many contaminants from drinking water.','Filter and maintenance supplies will eventually run out.','A healthier village could grow around safer water.',9)
on conflict(id) do nothing;

insert into larp_portal.sessions(id) values (1) on conflict(id) do nothing;
insert into larp_portal.admin_auth(id,salt,secret_hash)
values (1,'78bb81937622bfa1a89e5fb0','4aa8d97a30a9887ba98b9eae9aa7d6c7b698c44e8c9670be3116472304f6769a')
on conflict(id) do nothing;

-- Edge Function alone may execute these two RPCs. Browser clients cannot invoke them through PostgREST.
create or replace function public.larp_portal_state()
returns jsonb
language plpgsql security definer
set search_path = pg_catalog,larp_portal,extensions
as $$
declare
  s larp_portal.sessions%rowtype;
  v_now timestamptz := clock_timestamp();
  v_elapsed double precision;
  v_due integer;
  v_hour integer;
  v_count integer;
  v_step integer;
  v_item text;
  v_alive integer;
  v_next double precision;
begin
  select * into s from larp_portal.sessions where id=1 for update;
  if not found then raise exception 'LARP session missing'; end if;
  v_elapsed := s.elapsed_seconds;
  if s.status='running' and s.last_resumed_at is not null then
     v_elapsed := least(s.duration_seconds,
          s.elapsed_seconds+greatest(0,extract(epoch from v_now-s.last_resumed_at)));
  end if;
  if s.status='running' then
    v_due := least(7, floor(v_elapsed/s.interval_seconds)::integer);
    while s.processed_hours < v_due loop
      v_hour := s.processed_hours+1;
      v_count := case when v_hour=s.double_hour then 2 else 1 end;
      for v_step in 1..v_count loop
        select count(*) into v_alive from larp_portal.relics where active;
        exit when v_alive<=1;
        select id into v_item from larp_portal.relics where active order by random() limit 1;
        update larp_portal.relics set active=false where id=v_item;
        insert into larp_portal.events(run_id,item_id,kind,hour_number)
        values(s.run_id,v_item,case when v_step=2 then 'bonus' else 'hourly' end,v_hour);
      end loop;
      s.processed_hours := v_hour;
      s.revision := s.revision+1;
    end loop;
    if v_elapsed >= s.duration_seconds then
      s.status := 'ended';
      s.elapsed_seconds := s.duration_seconds;
      s.last_resumed_at := null;
      insert into larp_portal.events(run_id,kind) values(s.run_id,'end');
      s.revision := s.revision+1;
    end if;
    update larp_portal.sessions set
      processed_hours=s.processed_hours,
      status=s.status,
      elapsed_seconds=s.elapsed_seconds,
      last_resumed_at=s.last_resumed_at,
      revision=s.revision,
      updated_at=v_now
    where id=1;
  end if;
  select count(*) into v_alive from larp_portal.relics where active;
  v_next := greatest(0, (s.processed_hours+1)*s.interval_seconds-v_elapsed);
  return jsonb_build_object(
    'server_now', v_now,
    'session', jsonb_build_object(
      'run_id',s.run_id,'status',s.status,
      'duration_seconds',s.duration_seconds,
      'interval_seconds',s.interval_seconds,
      'elapsed_seconds',round(v_elapsed::numeric,2),
      'remaining_seconds',greatest(0,round((s.duration_seconds-v_elapsed)::numeric,2)),
      'next_elimination_seconds',case when s.processed_hours>=7 or v_alive<=1 then null else round(v_next::numeric,2) end,
      'processed_hours',s.processed_hours,'journey_version',s.journey_version,'revision',s.revision
    ),
    'places',coalesce((select jsonb_agg(jsonb_build_object(
      'id',p.id,'name',p.name,'rune',p.rune,'description',p.description,
      'background',p.background,'stills',p.stills
    ) order by p.sort_order) from larp_portal.places p),'[]'::jsonb),
    'relics',coalesce((select jsonb_agg(jsonb_build_object(
      'id',r.id,'place_id',r.place_id,'name',r.name,'image',r.image,
      'active',r.active,'power',r.power,'catch',r.catch_text,'consequence',r.consequence
    ) order by r.sort_order) from larp_portal.relics r),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(e) from (
      select id,item_id,kind,hour_number,created_at from larp_portal.events
      where run_id=s.run_id order by id desc limit 16
    ) e),'[]'::jsonb)
  );
end;
$$;

create or replace function public.larp_portal_control(
  p_secret text,
  p_command text,
  p_item_id text default null
)
returns jsonb
language plpgsql security definer
set search_path = pg_catalog,larp_portal,extensions
as $$
declare
  v_auth larp_portal.admin_auth%rowtype;
  s larp_portal.sessions%rowtype;
  v_now timestamptz := clock_timestamp();
  v_elapsed double precision;
  v_alive integer;
  v_result jsonb;
begin
  select * into v_auth from larp_portal.admin_auth where id=1;
  if v_auth.secret_hash is null or encode(extensions.digest(v_auth.salt||':'||coalesce(p_secret,''),'sha256'),'hex')<>v_auth.secret_hash then
    raise exception 'Access denied' using errcode='28000';
  end if;
  -- Reconcile elapsed hours before applying a manual command, preventing time-travel double events.
  perform public.larp_portal_state();
  select * into s from larp_portal.sessions where id=1 for update;
  v_elapsed := s.elapsed_seconds;
  if s.status='running' and s.last_resumed_at is not null then
     v_elapsed := least(s.duration_seconds,
          s.elapsed_seconds+greatest(0,extract(epoch from v_now-s.last_resumed_at)));
  end if;
  case p_command
    when 'login' then null;
    when 'start' then
      if s.status <> 'ready' then raise exception 'Reset the session before starting'; end if;
      update larp_portal.relics set active=true;
      update larp_portal.sessions set
        status='running',elapsed_seconds=0,last_resumed_at=v_now,
        processed_hours=0,double_hour=1+floor(random()*7)::integer,
        revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,kind) values(s.run_id,'start');
    when 'pause' then
      if s.status<>'running' then raise exception 'Session is not running'; end if;
      update larp_portal.sessions set status='paused',elapsed_seconds=v_elapsed,
        last_resumed_at=null,revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,kind) values(s.run_id,'pause');
    when 'resume' then
      if s.status<>'paused' then raise exception 'Session is not paused'; end if;
      update larp_portal.sessions set status='running',last_resumed_at=v_now,
        revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,kind) values(s.run_id,'resume');
    when 'restore' then
      if not exists(select 1 from larp_portal.relics where id=p_item_id and not active) then
        raise exception 'Item is not eliminated'; end if;
      update larp_portal.relics set active=true where id=p_item_id;
      update larp_portal.sessions set revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,item_id,kind) values(s.run_id,p_item_id,'restore');
    when 'eliminate' then
      select count(*) into v_alive from larp_portal.relics where active;
      if v_alive<=1 or not exists(select 1 from larp_portal.relics where id=p_item_id and active) then
        raise exception 'Cannot eliminate item'; end if;
      update larp_portal.relics set active=false where id=p_item_id;
      update larp_portal.sessions set revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,item_id,kind) values(s.run_id,p_item_id,'manual');
    when 'reset_scene' then
      update larp_portal.sessions set journey_version=journey_version+1,
       revision=revision+1,updated_at=v_now where id=1;
      insert into larp_portal.events(run_id,kind) values(s.run_id,'scene');
    when 'reset' then
      update larp_portal.relics set active=true;
      update larp_portal.sessions set run_id=gen_random_uuid(),status='ready',
       elapsed_seconds=0,last_resumed_at=null,processed_hours=0,
       double_hour=0,journey_version=journey_version+1,
       revision=revision+1,updated_at=v_now where id=1;
      -- no events for previous runs are erased; they're retained as audit history
    else
      raise exception 'Unsupported command';
  end case;
  v_result:=public.larp_portal_state();
  return v_result||jsonb_build_object('admin',jsonb_build_object(
    'bonus_hour',(select double_hour from larp_portal.sessions where id=1),
    'authenticated',true
  ));
end;
$$;

revoke all on function public.larp_portal_state() from public,anon,authenticated;
revoke all on function public.larp_portal_control(text,text,text) from public,anon,authenticated;
grant execute on function public.larp_portal_state() to service_role;
grant execute on function public.larp_portal_control(text,text,text) to service_role;
