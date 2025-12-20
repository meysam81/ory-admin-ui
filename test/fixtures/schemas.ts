import type { IdentitySchema } from "@/types/api"

export const mockSchema: IdentitySchema = {
  id: "default",
  schema: {
    $id: "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Person",
    type: "object",
    properties: {
      traits: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            title: "E-Mail",
            "ory.sh/kratos": {
              credentials: {
                password: {
                  identifier: true,
                },
              },
              verification: {
                via: "email",
              },
              recovery: {
                via: "email",
              },
            },
          },
          name: {
            type: "object",
            properties: {
              first: { type: "string", title: "First Name" },
              last: { type: "string", title: "Last Name" },
            },
          },
        },
        required: ["email"],
      },
    },
  },
}

export const mockSchemas: IdentitySchema[] = [
  mockSchema,
  {
    id: "admin",
    schema: {
      $id: "admin.schema.json",
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Admin User",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "superadmin"] },
          },
          required: ["email", "role"],
        },
      },
    },
  },
]
