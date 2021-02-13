import { request, RequestOptions } from "http";
import { URL } from "url";

function httpRequest(options: string | RequestOptions | URL): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = request(options, (res) => {
            let buffer = "";

            res.on("data", (chunk) => {
                buffer += chunk;
            });

            res.on("end", () => {
                try {
                    const obj = JSON.parse(buffer);
                    resolve(obj);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        req.end();
    });
}

export class API {
    constructor(protected host: string) {}

    doUnitOperation(unit: string, operation: string): Promise<any> {
        return httpRequest({
            host: this.host,
            path: `/api/v1/unit/${unit}?do=${operation}`,
            method: "GET",
        });
    }

    installProjectFromURL(url: string): Promise<any> {
        const encodedURL = encodeURIComponent(url);
        return httpRequest({
            host: this.host,
            path: `/api/v1/project/install?url=${encodedURL}`,
            method: "POST",
        });
    }
}
