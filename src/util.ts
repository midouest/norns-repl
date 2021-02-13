
export function info(message?: any, ...optionalParams: any[]): void {
    const infoMsg = `INFO\tnorns-repl\t${message}`;
    console.log(infoMsg, ...optionalParams);
}

export function error(message?: any, ...optionalParams: any[]): void {
    const errorMsg = `ERROR\tnorns-repl\t${message}`;
    console.error(errorMsg, ...optionalParams);
}


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
