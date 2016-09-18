export function acall<T>(fn: Function, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fn(...args, (error: any, value: T) => {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
}
