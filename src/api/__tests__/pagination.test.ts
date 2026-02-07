import { describe, it, expect } from "vitest"
import { parseLinkHeader } from "../pagination"

describe("parseLinkHeader", () => {
  it("returns empty object for null header", () => {
    expect(parseLinkHeader(null)).toEqual({})
  })

  it("returns empty object for empty string", () => {
    expect(parseLinkHeader("")).toEqual({})
  })

  it("extracts next token from absolute URL", () => {
    const header =
      '<http://kratos:4434/admin/identities?page_size=20&page_token=next123>; rel="next"'
    expect(parseLinkHeader(header)).toEqual({ nextToken: "next123" })
  })

  it("extracts prev token", () => {
    const header =
      '<http://kratos:4434/admin/identities?page_size=20&page_token=prev456>; rel="prev"'
    expect(parseLinkHeader(header)).toEqual({ prevToken: "prev456" })
  })

  it('recognizes rel="previous" as prev', () => {
    const header = '<http://kratos:4434/admin/identities?page_token=prev789>; rel="previous"'
    expect(parseLinkHeader(header)).toEqual({ prevToken: "prev789" })
  })

  it("extracts both next and prev tokens", () => {
    const header = [
      '<http://kratos:4434/admin/identities?page_size=20&page_token=nextTok>; rel="next"',
      '<http://kratos:4434/admin/identities?page_size=20&page_token=prevTok>; rel="prev"',
    ].join(",")
    expect(parseLinkHeader(header)).toEqual({
      nextToken: "nextTok",
      prevToken: "prevTok",
    })
  })

  it("handles relative URLs via fallback regex", () => {
    const header = '</admin/identities?page_size=20&page_token=relToken>; rel="next"'
    expect(parseLinkHeader(header)).toEqual({ nextToken: "relToken" })
  })

  it("ignores parts without page_token", () => {
    const header = '<http://kratos:4434/admin/identities?page_size=20>; rel="next"'
    expect(parseLinkHeader(header)).toEqual({})
  })

  it("ignores malformed parts (missing URL or rel)", () => {
    const header = 'rel="next", <http://example.com>'
    expect(parseLinkHeader(header)).toEqual({})
  })

  it("decodes URL-encoded tokens from relative URLs", () => {
    const header = '</identities?page_token=abc%3D123>; rel="next"'
    expect(parseLinkHeader(header)).toEqual({ nextToken: "abc=123" })
  })
})
