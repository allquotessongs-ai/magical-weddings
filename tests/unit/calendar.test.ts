import { describe, expect, it } from "vitest";
import { formatWeddingDate } from "@/lib/utils";
describe("Jamaica date formatting",()=>{it("formats in the wedding timezone",()=>expect(formatWeddingDate("2027-02-21T02:00:00.000Z","America/Jamaica")).toContain("20"))});
