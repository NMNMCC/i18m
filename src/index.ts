export type Leaf = string | ((...args: any[]) => string);
export type Locale = {
    [key: string]: Leaf | Locale;
};

type Path<T, S extends string> = T extends object
    ? {
          [K in keyof T]: `${Exclude<K, symbol>}${Path<T[K], S> extends never ? "" : `${S}${Path<T[K], S>}`}`;
      }[keyof T]
    : never;

type FromPath<
    T,
    P extends string,
    S extends string,
> = P extends `${infer K}${S}${infer R}`
    ? K extends keyof T
        ? FromPath<T[K], R, S>
        : never
    : P extends keyof T
      ? T[P]
      : never;

const match = <T extends string[]>(
    source: string,
    targets: T,
): T[number] | null => {
    const [language] = source.split("-");
    return (
        targets.find((target) => target === source) ??
        targets.find((target) => target === language) ??
        null
    );
};

const matchMany = <T extends string[]>(
    [head, ...tail]: readonly string[],
    targets: T,
): T[number] | null =>
    head === undefined
        ? null
        : match(head, targets) || matchMany(tail, targets);

export default <
    T extends Record<string, T[K]>,
    K extends keyof T extends string ? keyof T : never,
    S extends string = "->",
>(
    main: K,
    locale: T,
    {
        splitter = "->" as S,
        sources = navigator.languages,
    }: Partial<{
        splitter: S;
        sources: readonly string[];
    }> = {},
) => {
    type ID = keyof T extends string ? keyof T : never;

    const locales = Object.keys(locale) as ID[];
    let matched: ID = matchMany(sources, locales) || (main as ID);

    const set = (id: ID) => {
        matched = id;
    };

    const get = <P extends Path<T[K], S>>(
        key: P,
        id = matched,
    ): FromPath<T[K], P, S> => {
        const leaves = key.split(splitter) as string[];

        return leaves.reduce<Leaf | Locale>((acc, curr) => {
            if (acc && typeof acc === "object" && curr in acc) {
                return (acc as Record<string, any>)[curr];
            } else {
                if (id !== main) {
                    console.warn(
                        `'${key}' can not be found in locale '${id}', falling back to main '${main}'.`,
                    );
                    return get(key, main);
                } else {
                    throw new Error(
                        `'${key}' can not be found in locale '${id}' and no fallback is available.`,
                    );
                }
            }
        }, locale[id!]!) as any;
    };

    return {
        set,
        get,
    };
};
