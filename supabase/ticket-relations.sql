create table if not exists ticket_relations (
  id uuid primary key default gen_random_uuid(),

  ticket_a_id uuid not null references tickets(id) on delete cascade,
  ticket_b_id uuid not null references tickets(id) on delete cascade,

  created_at timestamptz not null default now(),

  constraint chk_ticket_relations_not_self
    check (ticket_a_id <> ticket_b_id),

  constraint chk_ticket_relations_canonical_order
    check (ticket_a_id < ticket_b_id),

  constraint uq_ticket_relations_pair
    unique (ticket_a_id, ticket_b_id)
);

create index if not exists idx_ticket_relations_ticket_a_id
  on ticket_relations(ticket_a_id);

create index if not exists idx_ticket_relations_ticket_b_id
  on ticket_relations(ticket_b_id);
