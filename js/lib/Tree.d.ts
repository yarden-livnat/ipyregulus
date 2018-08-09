import { DOMWidgetView } from "@jupyter-widgets/base";
export declare class Tree extends DOMWidgetView {
    render(): void;
    events(): {
        [e: string]: string;
    };
    _handle_click(event: any): void;
    el: HTMLButtonElement;
    draw(): void;
}
