"use strict";
// Icon Exporter utility for converting Figma icons to images
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportNodeAsBase64 = exportNodeAsBase64;
exports.optimizeIconForExport = optimizeIconForExport;
exports.getBestNodeToExport = getBestNodeToExport;
/**
 * Exports a Figma node as a PNG image and returns it as a base64 string
 * @param node The Figma node to export
 * @param options Export options
 * @returns Promise resolving to a base64-encoded PNG
 */
function exportNodeAsBase64(node_1) {
    return __awaiter(this, arguments, void 0, function* (node, options = {}) {
        try {
            // Set default options
            const scale = options.scale || 2; // 2x scale for better quality
            const format = options.format || 'PNG';
            // Set export settings
            const settings = {
                format: format,
                constraint: { type: 'SCALE', value: scale }
            };
            // Get the export data
            const bytes = yield node.exportAsync(settings);
            // Convert to base64
            const base64 = figma.base64Encode(bytes);
            return base64;
        }
        catch (error) {
            console.error('Error exporting node:', error);
            throw new Error('Failed to export icon');
        }
    });
}
/**
 * Optimizes an icon node for export
 * @param node The icon node to optimize
 * @returns The optimized node
 */
function optimizeIconForExport(node) {
    // If the node is a component instance, get its main component
    if (node.type === 'INSTANCE') {
        // For instances, we can use the main component for better quality
        const mainComponent = node.mainComponent;
        if (mainComponent) {
            return mainComponent;
        }
    }
    // For other node types, just return the node itself
    return node;
}
/**
 * Gets the best node to export from a selection
 * @param selection The current selection
 * @returns The best node to export, or null if no suitable node is found
 */
function getBestNodeToExport(selection) {
    if (selection.length === 0) {
        return null;
    }
    // If there's only one node selected, use that
    if (selection.length === 1) {
        return optimizeIconForExport(selection[0]);
    }
    // If multiple nodes are selected, try to find the best one
    // Prefer components over instances over other node types
    const components = selection.filter(node => node.type === 'COMPONENT');
    if (components.length > 0) {
        return optimizeIconForExport(components[0]);
    }
    const instances = selection.filter(node => node.type === 'INSTANCE');
    if (instances.length > 0) {
        return optimizeIconForExport(instances[0]);
    }
    // If no components or instances, just use the first node
    return optimizeIconForExport(selection[0]);
}
