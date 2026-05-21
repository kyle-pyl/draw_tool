/**
 * Diagram modules - Flowchart, Architecture, RTL, Mind Map, Topology, Chart.
 */

export { registerGeometricTemplates, geometricTemplateDefinitions } from './geometric-templates';
export { registerFlowchartTemplates, flowchartTemplateDefinitions } from './flowchart-templates';
export { registerArchitectureTemplates, architectureTemplateDefinitions } from './architecture-templates';
export { registerRtlTemplates, rtlTemplateDefinitions } from './rtl-templates';
export { generateChart, CHART_COLOR_SCHEMES, convertChartSvgToElements } from './chart';
export type { ChartGenerationConfig, LegendPosition, ChartColorScheme, ConvertedElementResult } from './chart';
export { FlowchartLayoutEngine, flowchartLayoutEngine } from './flowchart/layout';
