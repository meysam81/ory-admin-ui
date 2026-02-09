import { describe, it, expect } from "vitest"
import { parseLinkHeader, parsePaginationHeaders } from "../pagination"

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

describe("parsePaginationHeaders", () => {
  function makeHeaders(entries: Record<string, string>): Headers {
    return new Headers(entries)
  }

  it("returns empty object when no relevant headers", () => {
    expect(parsePaginationHeaders(makeHeaders({}))).toEqual({})
  })

  it("extracts x-total-count as totalCount", () => {
    const headers = makeHeaders({ "x-total-count": "42" })
    expect(parsePaginationHeaders(headers)).toEqual({ totalCount: 42 })
  })

  it("extracts both link and x-total-count", () => {
    const headers = makeHeaders({
      link: '<http://kratos:4434/admin/identities?page_token=nextTok>; rel="next"',
      "x-total-count": "150",
    })
    expect(parsePaginationHeaders(headers)).toEqual({
      nextToken: "nextTok",
      totalCount: 150,
    })
  })

  it("ignores non-numeric x-total-count", () => {
    const headers = makeHeaders({ "x-total-count": "invalid" })
    expect(parsePaginationHeaders(headers)).toEqual({})
  })

  it("handles x-total-count of 0", () => {
    const headers = makeHeaders({ "x-total-count": "0" })
    expect(parsePaginationHeaders(headers)).toEqual({ totalCount: 0 })
  })
})
