import { describe, expect, it } from "vitest";
import { mediaUploadSchema, slugSchema } from "@/lib/validation/wedding";

describe("wedding validation", () => {
  it("normalizes a safe slug", () => expect(slugSchema.parse(" Annette-and-Clive ")).toBe("annette-and-clive"));
  it("rejects reserved and malformed slugs", () => { expect(()=>slugSchema.parse("admin")).toThrow(); expect(()=>slugSchema.parse("two--dashes")).toThrow(); });
  it("rejects SVG and oversized images", () => {
    expect(()=>mediaUploadSchema.parse({weddingId:"00000000-0000-4000-8000-000000000000",purpose:"hero",fileName:"hero.svg",mimeType:"image/svg+xml",size:1000,altText:"A couple"})).toThrow();
    expect(()=>mediaUploadSchema.parse({weddingId:"00000000-0000-4000-8000-000000000000",purpose:"gallery",fileName:"hero.jpg",mimeType:"image/jpeg",size:13*1024*1024,altText:"A couple"})).toThrow();
  });
  it("accepts PostgreSQL UUIDs used by seeded fixtures", () => {
    const input=mediaUploadSchema.parse({weddingId:"00000000-0000-0000-0000-000000000001",purpose:"hero",fileName:"hero.jpg",mimeType:"image/jpeg",size:1000,altText:"A couple"});
    expect(input.weddingId).toBe("00000000-0000-0000-0000-000000000001");
  });
});
