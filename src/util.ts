export function info(message?: any, ...optionalParams: any[]): void {
    const infoMsg = `INFO\tnorns-repl\t${message}`;
    console.log(infoMsg, ...optionalParams);
}

export function error(message?: any, ...optionalParams: any[]): void {
    const errorMsg = `ERROR\tnorns-repl\t${message}`;
    console.error(errorMsg, ...optionalParams);
}

export function debounce(callback: () => void, ms: number): () => void {
    let timeout: NodeJS.Timeout;
    return () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(callback, ms);
    };
}

export function insertAt(str: string, index: number, data: string): string {
    return str.slice(0, index) + data + str.slice(index);
}

export function deleteAt(str: string, index: number): string {
    return str.slice(0, index) + str.slice(index + 1);
}

export function capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}
