# Verify Kratos is alive and ready before seeding.
# Must pass before any other seed file runs.

GET {{admin_url}}/admin/health/alive
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

GET {{admin_url}}/admin/health/ready
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

GET {{public_url}}/schemas
HTTP 200
[Asserts]
jsonpath "$" count >= 1
