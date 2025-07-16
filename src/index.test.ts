import { describe, it, expect, vi } from "vitest";
import makeI18n from "./index";

// Tests for the i18n make function
describe("i18n make function", () => {
    // Change locales to be typed as any to satisfy type constraints
    const locales: Record<string, any> = {
        en: {
            greeting: {
                morning: "Good morning",
                night: "Good night",
            },
            hello: "Hello",
            greetFn: (name: string) => `Hello ${name}`,
        },
        fr: {
            greeting: {
                morning: "Bonjour",
            },
            hello: "Bonjour",
            // greetFn missing to test fallback
        },
    };

    it("should return string for main locale", () => {
        const i18n = makeI18n("en", locales);
        expect(i18n.get("hello")).toBe("Hello");
    });

    it("should return nested string for main locale", () => {
        const i18n = makeI18n("en", locales);
        expect(i18n.get("greeting->morning")).toBe("Good morning");
        expect(i18n.get("greeting->night")).toBe("Good night");
    });

    it("should handle function leaves", () => {
        const i18n = makeI18n("en", locales);
        const greet = i18n.get("greetFn");
        expect(greet("Alice")).toBe("Hello Alice");
    });

    it("should switch locale with set()", () => {
        const i18n = makeI18n("en", locales);
        i18n.set("fr");
        expect(i18n.get("hello")).toBe("Bonjour");
        expect(i18n.get("greeting->morning")).toBe("Bonjour");
    });

    it("should fallback to main locale if key missing in other locale", () => {
        const i18n = makeI18n("en", locales);
        i18n.set("fr");
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        expect(i18n.get("greeting->night")).toBe("Good night");
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("falling back to main 'en'"),
        );
        warnSpy.mockRestore();
    });

    it("should throw error when key missing in main locale", () => {
        const i18n = makeI18n("en", locales);
        expect(() => (i18n.get as any)("nonexistent")).toThrowError(
            /can not be found/,
        );
    });
});
