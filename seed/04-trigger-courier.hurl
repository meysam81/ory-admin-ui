# Trigger recovery flows via the frontend API to generate courier messages.
# Uses GET /self-service/recovery/api + POST /self-service/recovery (no admin ID lookups needed).
# Requires recovery flow enabled in kratos-server-config.yml.

# --- dave ---

GET {{public_url}}/self-service/recovery/api
HTTP 200
[Captures]
recovery_flow_dave: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "choose_method"

POST {{public_url}}/self-service/recovery?flow={{recovery_flow_dave}}
Content-Type: application/json
{
  "method": "code",
  "email": "dave@seed.local"
}
HTTP 200
[Asserts]
jsonpath "$.state" == "sent_email"

# --- eve ---

GET {{public_url}}/self-service/recovery/api
HTTP 200
[Captures]
recovery_flow_eve: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "choose_method"

POST {{public_url}}/self-service/recovery?flow={{recovery_flow_eve}}
Content-Type: application/json
{
  "method": "code",
  "email": "eve@seed.local"
}
HTTP 200
[Asserts]
jsonpath "$.state" == "sent_email"

# --- alice ---

GET {{public_url}}/self-service/recovery/api
HTTP 200
[Captures]
recovery_flow_alice: jsonpath "$.id"
[Asserts]
jsonpath "$.state" == "choose_method"

POST {{public_url}}/self-service/recovery?flow={{recovery_flow_alice}}
Content-Type: application/json
{
  "method": "code",
  "email": "alice@seed.local"
}
HTTP 200
[Asserts]
jsonpath "$.state" == "sent_email"
