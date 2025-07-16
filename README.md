# i18minimal

a lightweight, type-safe internationalization helper for JavaScript and TypeScript applications.

## Introduction

Internationalization (often abbreviated i18n) is at the heart of creating software that speaks your users’ language—literally. Yet many existing solutions bring heavy runtime dependencies, verbose configuration, or insufficient compile-time guarantees. **i18minimal** aspires to restore elegance and simplicity to the process of localization: a tiny, dependency-free library that delivers full type safety, clear fallbacks, and effortless integration.

## Key Principles

1. **Type Safety at Compile Time**  
   By leveraging TypeScript’s advanced generics and literal types, i18minimal ensures that only valid translation keys are accepted. Mistyped or missing keys become compile-time errors rather than runtime surprises.

2. **Zero Runtime Dependencies**  
   i18minimal contains no external libraries at runtime. Your bundle remains as small as possible, with no performance penalties or extra baggage.

3. **Flexible Fallback Mechanism**  
   When a translation is missing in the active locale, i18minimal gracefully falls back to a designated “main” locale, issuing a console warning. Should the key be absent there as well, an error is thrown to alert you immediately.

4. **Automatic Locale Matching**  
   Out of the box, i18minimal will inspect the user’s language preferences (for example, `navigator.languages`) and match them against the locales you define, selecting the best candidate or defaulting to your specified main locale.

## Installation

```bash
# Using pnpm
ing install i18minimal

# Using npm
npm install i18minimal

# Using yarn
yarn add i18minimal
```

## Getting Started

### 1. Define Your Locale Data

Compose a nested object where each key maps to either a string or a function. Functions can accept arguments (for interpolation or dynamic content) and must return a string.

```ts
import { make } from "i18minimal";

const locales = {
    en: {
        title: "Welcome to Our Site",
        button: { clickMe: "Click me" },
        user: {
            greeting: (name: string) => `Hello, ${name}`,
        },
    },
    zh: {
        title: () => "欢迎来到我们的网站",
        button: { clickMe: "请点击" },
        user: {
            greeting: (name: string) => `你好，${name}`,
        },
    },
} as const;
```

### 2. Create an i18minimal Instance

Invoke `make` by supplying:

- `main`: the fallback locale key (e.g., `'en'`).
- `locales`: your locale definitions.
- `options` (optional):
    - `splitter`: a custom delimiter for nested keys (default: `'->'`).
    - `sources`: an array of language tags to match (default: `navigator.languages`).

```ts
const i18n = make("en", locales, {
    splitter: "->",
    sources: ["zh-CN", "en-US"],
});
```

### 3. Retrieve Translations

Use the `get` method to fetch a translation by its key path. Pass the key path as a string, using your chosen splitter to traverse nested objects.

```ts
console.log(i18n.get("title")); // '欢迎来到我们的网站' or 'Welcome to Our Site'
console.log(i18n.get("button->clickMe", "en")); // 'Click me'
console.log(i18n.get("user->greeting")("Alice")); // dynamic usage: '你好，Alice' or 'Hello, Alice'
```

### 4. Switch Locales at Runtime

If you need to change the active locale in response to user input or a settings panel, call:

```ts
i18n.set("zh");
console.log(i18n.get("title")); // '欢迎来到我们的网站'
```

## API Reference

### `make(main, locale, options?)`

- **`main: string`** — Primary locale key used for fallback.
- **`locale: Record<string, object>`** — An object mapping locale keys to translation maps.
- **`options?: { splitter?: string; sources?: readonly string[] }`** — Optional settings.

Returns an object with:

- **`set(id: string): void`** — Manually set the current locale.
- **`get<P extends string>(key: P, id?: string): string`** — Retrieve a translation. If `id` is omitted, uses the currently matched locale.

### Advanced Type Utilities

For advanced scenarios, i18minimal exposes two internal types:

- **`Path<T, S>`** — Computes a union of valid nested key paths for object `T` using splitter `S`.
- **`FromPath<T, P, S>`** — Infers the return type given a key path `P` in object `T`.

These types power the compile-time validation of your calls to `get`, preventing mistaken keys.

## Fallback and Matching Behavior

1. **Locale Matching**: On initialization, i18minimal inspects the provided language sources to find the best match among your locale keys. Absent a match, it defaults to the `main` locale.
2. **Translation Lookup**: If a key is not found in the active locale, a warning is emitted and a lookup is performed on the `main` locale. A missing key there results in an error.

## Customization

- **Custom Splitters**: Use dots, slashes, or any character as your path delimiter.

    ```ts
    const i18nDot = make("en", locales, { splitter: "." });
    console.log(i18nDot.get("user.greeting", "zh"));
    ```

- **Custom Sources**: Provide an array of language tags from headers, user preferences, or server-side settings.

    ```ts
    const i18nServer = make("en", locales, { sources: ["fr-FR", "es"] });
    ```

## Contributing

Your insights and contributions are most welcome. Please visit the repository, open an issue to discuss your ideas, or submit a pull request with your enhancements.

## License

This project is released under the ISC License. See [LICENSE](LICENSE) for details.
