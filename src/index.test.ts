import { describe, it, expect, vi } from "vitest";
import makeI18n from "./index";

// Tests for the i18n make function
describe("i18n make function", () => {
    // Change locales to be typed as any to satisfy type constraints
    const locales = {
        enUS: {
            greeting: {
                morning: "Good morning",
                night: "Good night",
            },
            hello: "Hello",
            telephone_code: +1,
            greetFn: (name: string) => `Hello ${name}`,
        },
        zhCN: {
            greeting: {
                morning: "早上好",
            },
            hello: "你好",
            telephone_code: +86,
        },
    };

    // @ts-ignore: for testing purposes
    const i18n = makeI18n("enUS", locales, { sources: ["fr", "en-US", "en"] });

    it("should return string for main locale", () => {
        expect(i18n.get("hello")).toBe("Hello");
    });

    it("should return telephone code for main locale", () => {
        expect(i18n.get("telephone_code")).toBe(+1);
    });

    it("should return nested string for main locale", () => {
        expect(i18n.get("greeting->morning")).toBe("Good morning");
        expect(i18n.get("greeting->night")).toBe("Good night");
    });

    it("should handle function leaves", () => {
        const greet = i18n.get("greetFn");
        expect(greet("Alice")).toBe("Hello Alice");
    });

    it("should switch locale with set()", () => {
        i18n.set("zhCN");
        expect(i18n.get("hello")).toBe("你好");
        expect(i18n.get("greeting->morning")).toBe("早上好");
    });

    it("should fallback to main locale if key missing in other locale", () => {
        i18n.set("zhCN");
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(i18n.get("greeting->night")).toBe("Good night");
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("falling back to main 'enUS'"),
        );
        warnSpy.mockRestore();
    });

    it("should throw error when key missing in main locale", () => {
        expect(() => (i18n.get as any)("nonexistent")).toThrowError(
            /can not be found/,
        );
    });
});
