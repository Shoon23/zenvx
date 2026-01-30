export function createTypedProxy<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop: string) {
      if (!(prop in target)) {
        console.error(
          `❌ Tried to access undefined environment variable "${prop}"`,
        );
        process.exit(1);
      }
      return target[prop as keyof T];
    },
  }) as T;
}
