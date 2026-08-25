import type {
    PlaygroundDraft,
    WebPlaygroundExample,
} from "@/lib/playground/types";


const DRAFT_PREFIX =
    "tech-path-playground-draft:";


const DRAFT_MAX_AGE =
    24 *
    60 *
    60 *
    1000;


function createDraftId() {
    if (
        typeof crypto !==
        "undefined" &&
        typeof crypto.randomUUID ===
        "function"
    ) {
        return crypto.randomUUID();
    }


    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}


function getStorageKey(
    draftId:
        string,
) {
    return `${DRAFT_PREFIX}${draftId}`;
}


function cleanupExpiredDrafts() {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }


    const now =
        Date.now();


    const keys:
        string[] = [];


    for (
        let index = 0;

        index <
        window.localStorage.length;

        index += 1
    ) {
        const key =
            window.localStorage.key(
                index,
            );


        if (
            key?.startsWith(
                DRAFT_PREFIX,
            )
        ) {
            keys.push(
                key,
            );
        }
    }


    keys.forEach(
        (key) => {
            try {
                const raw =
                    window.localStorage.getItem(
                        key,
                    );


                if (!raw) {
                    return;
                }


                const parsed =
                    JSON.parse(
                        raw,
                    ) as Partial<PlaygroundDraft>;


                if (
                    typeof parsed.createdAt !==
                    "number" ||
                    now -
                    parsed.createdAt >
                    DRAFT_MAX_AGE
                ) {
                    window.localStorage.removeItem(
                        key,
                    );
                }
            } catch {
                window.localStorage.removeItem(
                    key,
                );
            }
        },
    );
}


export function saveWebPlaygroundDraft(
    example:
        WebPlaygroundExample,
): string | null {
    if (
        typeof window ===
        "undefined"
    ) {
        return null;
    }


    try {
        cleanupExpiredDrafts();


        const draftId =
            createDraftId();


        const draft:
            PlaygroundDraft = {
            version:
                1,

            createdAt:
                Date.now(),

            example,
        };


        window.localStorage.setItem(
            getStorageKey(
                draftId,
            ),

            JSON.stringify(
                draft,
            ),
        );


        return draftId;
    } catch (
    error
    ) {
        console.warn(
            "Unable to save Tech Path playground draft:",
            error,
        );


        return null;
    }
}


export function loadWebPlaygroundDraft(
    draftId:
        string,
): WebPlaygroundExample | null {
    if (
        typeof window ===
        "undefined" ||
        !draftId
    ) {
        return null;
    }


    try {
        const raw =
            window.localStorage.getItem(
                getStorageKey(
                    draftId,
                ),
            );


        if (!raw) {
            return null;
        }


        const draft =
            JSON.parse(
                raw,
            ) as Partial<PlaygroundDraft>;


        if (
            draft.version !==
            1 ||
            typeof draft.createdAt !==
            "number" ||
            Date.now() -
            draft.createdAt >
            DRAFT_MAX_AGE ||
            !draft.example ||
            draft.example.kind !==
            "web"
        ) {
            return null;
        }


        const example =
            draft.example;


        if (
            typeof example.files?.html !==
            "string" ||
            typeof example.files?.css !==
            "string" ||
            typeof example.files
                ?.javascript !==
            "string"
        ) {
            return null;
        }


        return example;
    } catch (
    error
    ) {
        console.warn(
            "Unable to load Tech Path playground draft:",
            error,
        );


        return null;
    }
}