// This plugin generates AI-powered synonyms for icon components
import { exportNodeAsBase64, getBestNodeToExport } from './src/icon-exporter';
import { generateSynonyms } from './src/ai-service';

// Show UI with increased size for the new functionality
figma.showUI(__html__, { width: 400, height: 500 });

interface DescriptionMessage {
  type: 'update-description';
  name: string;
  description: string;
  nodeType: string;
  hasDescription: boolean;
}

interface UpdateDescriptionMessage {
  type: 'update-description';
  description: string;
}

interface DescriptionUpdatedMessage {
  type: 'description-updated';
  description: string;
  hasDescription: boolean;
}

interface GenerateSynonymsMessage {
  type: 'generate-synonyms';
  apiKey: string;
}

interface SynonymsResultMessage {
  type: 'synonyms-result';
  synonyms: string[];
  error?: string;
}

interface UiReadyMessage {
  type: 'ui-ready';
}

interface CloseMessage {
  type: 'close';
}

type Message = 
  | DescriptionMessage 
  | UpdateDescriptionMessage 
  | GenerateSynonymsMessage 
  | SynonymsResultMessage 
  | UiReadyMessage
  | CloseMessage;

function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
  node.description = description;
  // Send updated description back to UI
  figma.ui.postMessage({
    type: "description-updated",
    description: node.description,
    hasDescription: node.description.trim() !== ""
  } as DescriptionUpdatedMessage);
}

// Function to send current selection to UI
function sendSelectionToUI() {
  const selection = figma.currentPage.selection;
  console.log("Sending current selection to UI:", selection);
  
  if (selection.length === 1) {
    const node = selection[0];
    console.log("Selected node:", node.type, node.name);
    
    let message: DescriptionMessage;
    
    if (node.type === "COMPONENT") {
      const hasDescription = Boolean(node.description && node.description.trim() !== "");
      message = {
        type: "update-description",
        name: node.name,
        description: hasDescription ? node.description : "",
        nodeType: node.type,
        hasDescription
      };
    } else if (node.type === "COMPONENT_SET") {
      const hasDescription = Boolean(node.description && node.description.trim() !== "");
      message = {
        type: "update-description",
        name: node.name,
        description: hasDescription ? node.description : "",
        nodeType: node.type,
        hasDescription
      };
    } else if (node.type === "INSTANCE") {
      const mainComponent = node.mainComponent;
      const hasDescription = Boolean(mainComponent && mainComponent.description && mainComponent.description.trim() !== "");
      message = {
        type: "update-description",
        name: node.name,
        description: hasDescription && mainComponent ? mainComponent.description : "",
        nodeType: node.type,
        hasDescription
      };
    } else {
      message = {
        type: "update-description",
        name: node.name,
        description: "Please select a component, component set, or instance",
        nodeType: node.type,
        hasDescription: false
      };
    }
    
    console.log("Sending message to UI:", message);
    figma.ui.postMessage(message);
  } else if (selection.length === 0) {
    const message: DescriptionMessage = {
      type: "update-description",
      name: "",
      description: "No selection",
      nodeType: "none",
      hasDescription: false
    };
    figma.ui.postMessage(message);
  } else {
    const message: DescriptionMessage = {
      type: "update-description",
      name: "",
      description: "Multiple items selected. Please select a single component, component set, or instance.",
      nodeType: "multiple",
      hasDescription: false
    };
    figma.ui.postMessage(message);
  }
}

// Handle messages from the UI
figma.ui.onmessage = async (msg: Message) => {
  console.log("Message received from UI:", msg);
  
  if (msg.type === 'close') {
    figma.closePlugin();
  } else if (msg.type === 'update-description') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 1) {
      const node = selection[0];
      
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        updateDescription(node, msg.description);
        figma.notify("Description updated successfully!");
      } else if (node.type === "INSTANCE" && node.mainComponent) {
        // For instances, update the main component's description
        updateDescription(node.mainComponent, msg.description);
        figma.notify("Main component description updated successfully!");
      } else {
        figma.notify("Cannot update description: Please select a component or component set");
      }
    } else {
      figma.notify("Cannot update description: Please select a single component");
    }
  } else if (msg.type === 'ui-ready') {
    console.log("UI is ready, sending current selection");
    sendSelectionToUI();
  } else if (msg.type === 'generate-synonyms') {
    try {
      // Show loading state
      figma.notify("Generating synonyms...");
      
      // Get the current selection
      const selection = figma.currentPage.selection;
      
      // Find the best node to export
      const nodeToExport = getBestNodeToExport(selection);
      
      if (!nodeToExport) {
        figma.ui.postMessage({
          type: 'synonyms-result',
          synonyms: [],
          error: 'No valid icon selected'
        });
        return;
      }
      
      // Export the node as base64
      const imageBase64 = await exportNodeAsBase64(nodeToExport);
      
      // Get the node name and description
      let name = nodeToExport.name;
      let description = '';
      
      if (nodeToExport.type === 'COMPONENT') {
        description = nodeToExport.description || '';
      } else if (nodeToExport.type === 'INSTANCE' && nodeToExport.mainComponent) {
        description = nodeToExport.mainComponent.description || '';
      }
      
      // Generate synonyms using the AI service
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description
      }, msg.apiKey);
      
      // Send the result back to the UI
      figma.ui.postMessage({
        type: 'synonyms-result',
        synonyms: result.synonyms,
        error: result.error
      });
      
      if (result.error) {
        figma.notify("Error generating synonyms: " + result.error);
      } else {
        figma.notify("Synonyms generated successfully!");
      }
    } catch (error: any) {
      console.error('Error in generate-synonyms handler:', error);
      figma.ui.postMessage({
        type: 'synonyms-result',
        synonyms: [],
        error: error.message || 'Unknown error occurred'
      });
      figma.notify("Error generating synonyms");
    }
  }
};

// Trigger the selection change handler on startup
figma.on("run", () => {
  console.log("Plugin started");
  // Send the current selection to the UI
  sendSelectionToUI();
});

// Add selection change event handler
figma.on("selectionchange", () => {
  console.log("Selection changed");
  sendSelectionToUI();
});
