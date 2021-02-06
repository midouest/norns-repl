
export function info(message?: any, ...optionalParams: any[]): void {
    const infoMsg = `INFO\tnorns-repl\t${message}`;
    console.log(infoMsg, ...optionalParams);
}

export function error(message?: any, ...optionalParams: any[]): void {
    const errorMsg = `ERROR\tnorns-repl\t${message}`;
    console.error(errorMsg, ...optionalParams);
}
