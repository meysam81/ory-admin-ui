import { identityHandlers } from "./identities"
import { sessionHandlers } from "./sessions"
import { healthHandlers } from "./health"
import { courierHandlers } from "./courier"
import { schemaHandlers } from "./schemas"

export const handlers = [
  ...identityHandlers,
  ...sessionHandlers,
  ...healthHandlers,
  ...courierHandlers,
  ...schemaHandlers,
]
