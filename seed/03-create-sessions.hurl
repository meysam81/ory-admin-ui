# Login 3 identities via the Public API to create sessions.
# Uses the native /self-service/login/api flow (no browser required).

# --- alice ---

GET {{public_url}}/self-service/login/api
HTTP 200
[Captures]
login_flow_alice: jsonpath "$.id"

POST {{public_url}}/self-service/login?flow={{login_flow_alice}}
Content-Type: application/json
{
  "method": "password",
  "identifier": "alice@seed.local",
  "password": "{{seed_password}}"
}
HTTP 200
[Captures]
session_token_alice: jsonpath "$.session_token"
session_id_alice: jsonpath "$.session.id"
[Asserts]
jsonpath "$.session.active" == true
jsonpath "$.session.identity.traits.email" == "alice@seed.local"

# --- bob ---

GET {{public_url}}/self-service/login/api
HTTP 200
[Captures]
login_flow_bob: jsonpath "$.id"

POST {{public_url}}/self-service/login?flow={{login_flow_bob}}
Content-Type: application/json
{
  "method": "password",
  "identifier": "bob@seed.local",
  "password": "{{seed_password}}"
}
HTTP 200
[Captures]
session_token_bob: jsonpath "$.session_token"
session_id_bob: jsonpath "$.session.id"
[Asserts]
jsonpath "$.session.active" == true
jsonpath "$.session.identity.traits.email" == "bob@seed.local"

# --- carol ---

GET {{public_url}}/self-service/login/api
HTTP 200
[Captures]
login_flow_carol: jsonpath "$.id"

POST {{public_url}}/self-service/login?flow={{login_flow_carol}}
Content-Type: application/json
{
  "method": "password",
  "identifier": "carol@seed.local",
  "password": "{{seed_password}}"
}
HTTP 200
[Captures]
session_token_carol: jsonpath "$.session_token"
session_id_carol: jsonpath "$.session.id"
[Asserts]
jsonpath "$.session.active" == true
jsonpath "$.session.identity.traits.email" == "carol@seed.local"
