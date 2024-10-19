import * as d3 from "d3";
import { select } from "d3-selection";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;

export class Visual implements IVisual {
    private target: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private worldMap: SVGElement | null = null;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.svg = select<HTMLElement, unknown>(this.target)
            .append<SVGSVGElement>("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        // Load the world map SVG
        d3.xml("assets/world-map.svg").then((data) => {
            if (data && data.documentElement) {
                this.worldMap = data.documentElement as SVGElement;
                this.svg.node()?.appendChild(this.worldMap);
            } else {
                console.error("Failed to load the world map SVG.");
            }
        }).catch(error => {
            console.error("Error loading the world map SVG:", error);
        });
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        const categorical: DataViewCategorical | undefined = dataView.categorical;

        if (categorical !== undefined && categorical.categories !== undefined && categorical.values !== undefined) {
            const latitude: (number | null)[] = categorical.categories[0].values as (number | null)[];
            const longitude: (number | null)[] = categorical.categories[1].values as (number | null)[];
            const values: (number | null)[] = categorical.values[0].values as (number | null)[];

            // Clear previous points
            this.svg.selectAll("circle").remove();

            // Plot points
            for (let i = 0; i < latitude.length; i++) {
                const lat = latitude[i];
                const lon = longitude[i];
                const value = values[i];

                if (lat !== null && lon !== null && value !== null) {
                    // Convert lat/lon to x/y (this is a simplified example)
                    const svgNode = this.svg.node() as SVGSVGElement;
                    const x = (lon + 180) * svgNode.clientWidth / 360;
                    const y = (90 - lat) * svgNode.clientHeight / 180;

                    this.svg
                        .append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", Math.sqrt(value))
                        .attr("fill", "red")
                        .attr("opacity", 0.6);
                }
            }
        }
    }
}
