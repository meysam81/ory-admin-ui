# Verify all seeded data is accessible via the Admin API.

# --- Health ---

GET {{admin_url}}/admin/health/alive
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

GET {{admin_url}}/admin/health/ready
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# --- Identities: at least 8 ---

GET {{admin_url}}/admin/identities?page_size=50
HTTP 200
[Asserts]
jsonpath "$" count >= 8

# --- Verify alice (active + metadata) ---

GET {{admin_url}}/admin/identities?credentials_identifier=alice@seed.local
HTTP 200
[Captures]
alice_id: jsonpath "$[0].id"
[Asserts]
jsonpath "$[0].state" == "active"
jsonpath "$[0].metadata_admin.role" == "admin"
jsonpath "$[0].metadata_public.display_name" == "Alice Admin"

# --- Verify frank (inactive) ---

GET {{admin_url}}/admin/identities?credentials_identifier=frank@seed.local
HTTP 200
[Asserts]
jsonpath "$[0].state" == "inactive"
jsonpath "$[0].metadata_admin.deactivation_reason" == "policy_violation"

# --- Sessions: at least 3 ---

GET {{admin_url}}/admin/sessions?page_size=50&expand=Identity
HTTP 200
[Asserts]
jsonpath "$" count >= 3

# --- Alice has at least 1 session ---

GET {{admin_url}}/admin/identities/{{alice_id}}/sessions
HTTP 200
[Asserts]
jsonpath "$" count >= 1

# --- Courier messages: at least 3 ---

GET {{admin_url}}/admin/courier/messages?page_size=50
HTTP 200
[Asserts]
jsonpath "$" count >= 3

# --- Schemas: at least 1 ---

GET {{public_url}}/schemas
HTTP 200
[Asserts]
jsonpath "$" count >= 1
