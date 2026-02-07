lint:
  pre-commit run -a

serve:
  bun run dev

build:
  bun run build

mkdocs:
  mkdocs serve

up *args:
  docker compose up -d {{args}}

down *args:
  docker compose down {{args}}

logs *args:
  docker compose logs {{args}}

# Seed Kratos with sample data for local dev.
# NOT idempotent — Kratos rejects duplicate credential identifiers (409).
# Override: just seed admin_url=http://host:port public_url=http://host:port
seed admin_url="http://localhost:4434" public_url="http://localhost:4433":
  hurl --variables-file seed/vars.env \
    --variable admin_url={{admin_url}} \
    --variable public_url={{public_url}} \
    --test \
    --jobs 1 \
    seed/01-health-check.hurl \
    seed/02-create-identities.hurl \
    seed/03-create-sessions.hurl \
    seed/04-trigger-courier.hurl \
    seed/05-verify-seed.hurl
