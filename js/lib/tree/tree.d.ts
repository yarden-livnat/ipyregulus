import { DOMWidgetView } from "@jupyter-widgets/base";
import './tree.css';
export declare class Tree extends DOMWidgetView {
    render(): void;
    events(): {
        [e: string]: string;
    };
    _handle_click(event: any): void;
    title_updated(): void;
    data_updated(): void;
    draw(): void;
    d3el: any;
    panel: any;
}
