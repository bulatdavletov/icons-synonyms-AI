// This plugin shows the description of the selected component
figma.showUI(__html__, { width: 300, height: 300 });

interface DescriptionMessage {
  type: 'update-description';
  name: string;
  description: string;
  nodeType: string;
}

interface UpdateDescriptionMessage {
  type: 'update-component-description';
  description: string;
}

interface CloseMessage {
  type: 'close';
}

type Message = DescriptionMessage | UpdateDescriptionMessage | CloseMessage;

function updateDescription(node: ComponentNode | ComponentSetNode, description: string) {
  node.description = description;
  // Send updated description back to UI
  figma.ui.postMessage({
    type: "update-description",
    name: node.name,
    description: node.description,
    nodeType: node.type
  });
}

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  let message: DescriptionMessage;
  
  if (selection.length === 1) {
    const node = selection[0];
    
    if (node.type === "COMPONENT") {
      message = {
        type: "update-description",
        name: node.name,
        description: node.description || "No description available",
        nodeType: node.type
      };
    } else if (node.type === "COMPONENT_SET") {
      message = {
        type: "update-description",
        name: node.name,
        description: node.description || "No description available",
        nodeType: node.type
      };
    } else if (node.type === "INSTANCE") {
      const mainComponent = node.mainComponent;
      message = {
        type: "update-description",
        name: node.name,
        description: mainComponent ? (mainComponent.description || "No description available") : "No description available",
        nodeType: node.type
      };
    } else {
      message = {
        type: "update-description",
        name: node.name,
        description: "Please select a component, component set, or instance",
        nodeType: node.type
      };
    }
    
    figma.ui.postMessage(message);
  } else if (selection.length === 0) {
    message = {
      type: "update-description",
      name: "",
      description: "No selection",
      nodeType: "none"
    };
    figma.ui.postMessage(message);
  } else {
    message = {
      type: "update-description",
      name: "",
      description: "Multiple items selected. Please select a single component, component set, or instance.",
      nodeType: "multiple"
    };
    figma.ui.postMessage(message);
  }
});

// Handle messages from the UI
figma.ui.onmessage = (msg: Message) => {
  if (msg.type === 'close') {
    figma.closePlugin();
  } else if (msg.type === 'update-component-description') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 1) {
      const node = selection[0];
      
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        updateDescription(node, msg.description);
        figma.notify("Description updated successfully!");
      }
    }
  }
};
