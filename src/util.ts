export type Type<T> = { new(...args: any[]): T };

export function debounce(callback: () => void, ms: number): () => void {
    let timeout: NodeJS.Timeout;
    return () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(callback, ms);
    };
}
