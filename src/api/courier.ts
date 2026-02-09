import { getApiClient } from "./client"
import { parsePaginationHeaders } from "./pagination"
import { safeParseArrayWithLog, safeParseWithLog } from "@/lib/validation"
import { messageSchema } from "@/types/api.schemas"
import type { Message, PaginationParams, PaginatedResponse } from "@/types/api"

type MessageStatus = "queued" | "sent" | "processing" | "abandoned"

export const courierApi = {
  listMessages: async (
    params?: PaginationParams & { status?: MessageStatus; recipient?: string }
  ): Promise<PaginatedResponse<Message>> => {
    const client = getApiClient()
    const searchParams = new URLSearchParams()
    if (params?.page_size) searchParams.set("page_size", String(params.page_size))
    if (params?.page_token) searchParams.set("page_token", params.page_token)
    if (params?.status) searchParams.set("status", params.status)
    if (params?.recipient) searchParams.set("recipient", params.recipient)

    const response = await client.get("admin/courier/messages", {
      searchParams: searchParams.toString() ? searchParams : undefined,
    })
    const raw = await response.json<Message[]>()
    const data = safeParseArrayWithLog(messageSchema, raw, "courierApi.listMessages")
    const pagination = parsePaginationHeaders(response.headers)
    return { data, pagination }
  },

  getMessage: async (id: string): Promise<Message> => {
    const client = getApiClient()
    const raw = await client.get(`admin/courier/messages/${id}`).json<Message>()
    return safeParseWithLog(messageSchema, raw, "courierApi.getMessage")
  },
}
