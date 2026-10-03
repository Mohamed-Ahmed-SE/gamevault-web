import { describe, expect, it } from "vitest";
import { normalizePlatform, platformId, PLATFORMS } from "./platforms";
import { parseSearchParams } from "./search-params";
import { statusSchema, libraryMutationSchema } from "../validators";

describe("canonical platform map",()=>{
 it("keeps PlayStation 2 and PlayStation 3 explicit",()=>{expect(platformId("ps2")).toBe(15);expect(platformId("ps3")).toBe(16);expect(PLATFORMS.ps2.name).toBe("PlayStation 2");expect(PLATFORMS.ps3.name).toBe("PlayStation 3")});
 it("normalizes provider PlayStation names",()=>{expect(normalizePlatform({id:16,slug:"playstation-3",name:"PlayStation 3"}).slug).toBe("ps3")});
});
describe("query and user-input validation",()=>{
 it("parses shareable filters, preserves requested pages, and defaults invalid pages",()=>{expect(parseSearchParams(new URLSearchParams("q=zelda&platform=ps2&genre=adventure&page=-2")).page).toBe(1);expect(parseSearchParams(new URLSearchParams("page=3")).page).toBe(3);expect(parseSearchParams(new URLSearchParams("platform=ps3")).platform).toBe("ps3")});
 it("accepts only the six documented statuses",()=>{expect(statusSchema.safeParse("completed").success).toBe(true);expect(statusSchema.safeParse("completed_100").success).toBe(false)});
 it("rejects ratings outside 1–10",()=>{const base={gameId:"123",ratings:{gameplay:11,story:null,graphics:null,sound:null,overall:null}};expect(libraryMutationSchema.safeParse(base).success).toBe(false)});
});
