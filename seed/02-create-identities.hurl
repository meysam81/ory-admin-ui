# Create 8 identities: 5 active, 3 inactive.
# NOT idempotent — Kratos returns 409 if credential identifiers already exist.

# 1. alice — active, admin role
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "active",
  "traits": { "email": "alice@seed.local" },
  "metadata_admin": { "role": "admin" },
  "metadata_public": { "display_name": "Alice Admin" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_1: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "active"
jsonpath "$.traits.email" == "alice@seed.local"

# 2. bob — active, editor role
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "active",
  "traits": { "email": "bob@seed.local" },
  "metadata_admin": { "role": "editor", "department": "engineering" },
  "metadata_public": { "display_name": "Bob Editor" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_2: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "active"

# 3. carol — active, viewer role
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "active",
  "traits": { "email": "carol@seed.local" },
  "metadata_admin": { "role": "viewer" },
  "metadata_public": { "display_name": "Carol Viewer" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_3: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "active"

# 4. dave — active, user with preferences
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "active",
  "traits": { "email": "dave@seed.local" },
  "metadata_admin": { "role": "user" },
  "metadata_public": { "theme": "dark", "language": "en" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_4: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "active"

# 5. eve — active, support role
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "active",
  "traits": { "email": "eve@seed.local" },
  "metadata_admin": { "role": "support" },
  "metadata_public": { "display_name": "Eve Support" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_5: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "active"

# 6. frank — inactive, policy violation
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "inactive",
  "traits": { "email": "frank@seed.local" },
  "metadata_admin": { "deactivation_reason": "policy_violation" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_6: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "inactive"

# 7. grace — inactive, dormant account
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "inactive",
  "traits": { "email": "grace@seed.local" },
  "metadata_admin": { "deactivation_reason": "account_dormant" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_7: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "inactive"

# 8. hank — inactive, no metadata
POST {{admin_url}}/admin/identities
Content-Type: application/json
{
  "schema_id": "default",
  "state": "inactive",
  "traits": { "email": "hank@seed.local" },
  "credentials": {
    "password": { "config": { "password": "{{seed_password}}" } }
  }
}
HTTP 201
[Captures]
identity_id_8: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "inactive"
