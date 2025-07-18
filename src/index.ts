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
    T extends { [K in string]: T[K] },
    K extends keyof T,
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
    const locales = Object.keys(locale);
    let matched = (matchMany(sources, locales) || main) as keyof T;

    const set = (id: keyof T) => {
        matched = id;
    };

    const get = <P extends Path<T[K], S>>(
        key: P,
        id = matched,
    ): FromPath<T[K], P, S> => {
        const leaves = key.split(splitter) as string[];

        return leaves.reduce((acc, curr) => {
            if (acc && typeof acc === "object" && curr in acc) {
                return (acc as Record<string, any>)[curr];
            } else {
                if (id !== main) {
                    console.warn(
                        `'${key}' can not be found in locale '${id.toString()}', falling back to main '${main.toString()}'.`,
                    );
                    return get(key, main);
                } else {
                    throw new Error(
                        `'${key}' can not be found in locale '${id.toString()}' and no fallback is available.`,
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
