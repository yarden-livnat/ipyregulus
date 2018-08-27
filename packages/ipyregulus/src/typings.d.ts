declare var require: {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

declare module '*.html' {
  const content: string;
  export = content;
}

declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}
