
type Color = {
    name: string;
    value: string;
};

type ServerActionResponse<T = undefined> =
    | { success: true; data: T }
    | { success: false; error: string };
