var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@create-figma-plugin/utilities/lib/events.js
function on(name, handler) {
  const id = `${currentId}`;
  currentId += 1;
  eventHandlers[id] = { handler, name };
  return function() {
    delete eventHandlers[id];
  };
}
function invokeEventHandler(name, args) {
  let invoked = false;
  for (const id in eventHandlers) {
    if (eventHandlers[id].name === name) {
      eventHandlers[id].handler.apply(null, args);
      invoked = true;
    }
  }
  if (invoked === false) {
    throw new Error(`No event handler with name \`${name}\``);
  }
}
var eventHandlers, currentId, emit;
var init_events = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/events.js"() {
    eventHandlers = {};
    currentId = 0;
    emit = typeof window === "undefined" ? function(name, ...args) {
      figma.ui.postMessage([name, ...args]);
    } : function(name, ...args) {
      window.parent.postMessage({
        pluginMessage: [name, ...args]
      }, "*");
    };
    if (typeof window === "undefined") {
      figma.ui.onmessage = function(args) {
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = args;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    } else {
      window.onmessage = function(event) {
        if (typeof event.data.pluginMessage === "undefined") {
          return;
        }
        const args = event.data.pluginMessage;
        if (!Array.isArray(args)) {
          return;
        }
        const [name, ...rest] = event.data.pluginMessage;
        if (typeof name !== "string") {
          return;
        }
        invokeEventHandler(name, rest);
      };
    }
  }
});

// node_modules/@create-figma-plugin/utilities/lib/ui.js
function showUI(options, data) {
  if (typeof __html__ === "undefined") {
    throw new Error("No UI defined");
  }
  const html = `<div id="create-figma-plugin"></div><script>document.body.classList.add('theme-${figma.editorType}');const __FIGMA_COMMAND__='${typeof figma.command === "undefined" ? "" : figma.command}';const __SHOW_UI_DATA__=${JSON.stringify(typeof data === "undefined" ? {} : data)};${__html__}</script>`;
  figma.showUI(html, __spreadProps(__spreadValues({}, options), {
    themeColors: typeof options.themeColors === "undefined" ? true : options.themeColors
  }));
}
var init_ui = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/ui.js"() {
  }
});

// node_modules/@create-figma-plugin/utilities/lib/index.js
var init_lib = __esm({
  "node_modules/@create-figma-plugin/utilities/lib/index.js"() {
    init_events();
    init_ui();
  }
});

// src/icon-exporter.ts
async function exportNodeAsBase64(node, options = {}) {
  try {
    const scale = options.scale || 2;
    const format = options.format || "PNG";
    const settings = {
      format,
      constraint: { type: "SCALE", value: scale }
    };
    const bytes = await node.exportAsync(settings);
    const base64 = figma.base64Encode(bytes);
    return base64;
  } catch (error) {
    console.error("Error exporting node:", error);
    throw new Error("Failed to export icon");
  }
}
function optimizeIconForExport(node) {
  if (node.type === "INSTANCE") {
    const mainComponent = node.mainComponent;
    if (mainComponent) {
      return mainComponent;
    }
  }
  return node;
}
function getBestNodeToExport(selection) {
  if (selection.length === 0) {
    return null;
  }
  if (selection.length === 1) {
    return optimizeIconForExport(selection[0]);
  }
  const components = selection.filter((node) => node.type === "COMPONENT");
  if (components.length > 0) {
    return optimizeIconForExport(components[0]);
  }
  const instances = selection.filter((node) => node.type === "INSTANCE");
  if (instances.length > 0) {
    return optimizeIconForExport(instances[0]);
  }
  return optimizeIconForExport(selection[0]);
}
var init_icon_exporter = __esm({
  "src/icon-exporter.ts"() {
    "use strict";
  }
});

// src/config.ts
var config;
var init_config = __esm({
  "src/config.ts"() {
    "use strict";
    config = {
      // OpenAI API key
      OPENAI_API_KEY: "",
      // JetBrains API key - loaded from .env in build script or deployment
      // For security, this should be replaced during build/deployment
      JETBRAINS_API_KEY: "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJHcmF6aWUgQXV0aGVudGljYXRpb24iLCJ1aWQiOiIyN2VhMDI3OS1jODY5LTQxM2ItYWI5OS03MDhjNGExMzg3NmYiLCJ1c2VyX3N0YXRlIjoiSU5URVJOQUwiLCJyZWdpc3RyYXRpb25fZGF0ZSI6MTY4NjE1NjUzNzA0NiwibGljZW5zZSI6IlAzSVFPTU5TMVAiLCJsaWNlbnNlX3R5cGUiOiJqZXRicmFpbnMtYWkub3JnYW5pemF0aW9uYWwucHJvIiwiZXhwIjoxNzQ0NjQwNDU1fQ.h8P5QWpyrKdbSW1oWCX_PX4NNGUCPg9sFZPjWr4doHX9fxrFU7JDJ0ItV9JNnmWXibJmTCx-n4LGwlQGkBmBQnlsLVOw_PH7latTrj5NS8JrsxwEd7sdJT3h2hTpINg_mwSVUjWYQFpA4-XwvUhqcYiGZ4bTXTouKOvLm_wo2spQOu5OhxhguXjYknWdIAgpAzhDP8PtqM3QYjqvGP9RM5zBPg6VYZ43FGVlKT5NSUh8huxWQwT3arPS0ys48Hyi--nESfyjEW1wctexfDcOuAyE-8DqCqR9vHTa_EWAfgfcJBL6-qywTapgAvOtFj0yCMuDXasFwwcQg-5n1CR1wA",
      // API provider to use ('openai' or 'jetbrains')
      API_PROVIDER: "jetbrains",
      // Proxy server settings
      PROXY_URL: "http://localhost:3000"
    };
  }
});

// src/prompt-templates.ts
function getIconSynonymsPrompt(iconName, existingDescription) {
  return `
    This is an icon named "${iconName}". 
    ${existingDescription ? `It currently has this description: "${existingDescription}"` : ""}
    Please analyze this icon and provide information in the following format. Each line should start with the category name:

    1. Usage (required):
       - This is how the icon is used in the IDE
       - Usually it's the name of the action or feature
       - If name contains multiple words in camelCase, split them with spaces
       - Example: "projectStructure" -> "Usage: project structure"
       - Format: "Usage: your text here"

    2. Object (required):
       - The main object represented in the icon
       - Example: if named "projectStructure" but shows a folder icon -> "Object: folder"
       - Can include multiple related terms separated by commas
       - Format: "Object: term1, term2"

    3. Modificator (if found, leave empty if not):
       - Look for small icons/indicators in the corners (usually bottom right)
       - Example: folder with gear icon -> "Modificator: gear, settings"
       - Format: "Modificator: term1, term2" (or leave empty)

    4. Shapes (if found, leave empty if not):
       - List any simple shapes you see in the icon
       - Include circles, squares, rectangles, arrows, etc.
       - Example: "Shapes: circle, arrow, triangle"
       - Format: "Shapes: shape1, shape2, shape3"

    Example output:
    Usage: project structure
    Object: folder
    Modificator: gear
    Shapes: square, arrow

    Context: These icons are used in JetBrains IDEs.
    Don't use words like "icon", "symbol", "image", etc.
    Don't repeat the name of icon or existing description.
    Return only these four categories with their values, one per line.
    Leave empty lines for categories that don't apply (except required ones).
  `;
}
var init_prompt_templates = __esm({
  "src/prompt-templates.ts"() {
    "use strict";
  }
});

// src/ai-service.ts
function parseAIResponse(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  const result = [];
  for (const line of lines) {
    if (line.toLowerCase().startsWith("usage:")) {
      result.push(line);
    } else if (line.toLowerCase().startsWith("object:")) {
      result.push(line);
    } else if (line.toLowerCase().startsWith("modificator:")) {
      result.push(line);
    } else if (line.toLowerCase().startsWith("shapes:")) {
      result.push(line);
    } else if (line === "Usage" || line === "Object" || line === "Modificator" || line === "Shapes") {
      continue;
    } else if (line.includes(":")) {
      const [category, ...rest] = line.split(":");
      const trimmedCategory = category.trim();
      if (["usage", "object", "modificator", "shapes"].includes(trimmedCategory.toLowerCase())) {
        result.push(`${trimmedCategory}: ${rest.join(":").trim()}`);
      }
    }
  }
  console.log("Parsed response lines:", result);
  return result;
}
async function generateSynonymsWithOpenAI(params) {
  try {
    const prompt = getIconSynonymsPrompt(params.name, params.existingDescription);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${params.imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Response from OpenAI:", data.choices[0].message.content);
    const parsedSynonyms = parseAIResponse(data.choices[0].message.content);
    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error("No valid synonyms generated");
    }
    return {
      synonyms: parsedSynonyms
    };
  } catch (error) {
    console.error("Error generating synonyms with OpenAI:", error);
    throw error;
  }
}
async function generateSynonymsWithJetBrains(params) {
  var _a, _b, _c;
  try {
    const prompt = getIconSynonymsPrompt(params.name, params.existingDescription);
    const endpoint = "https://platform.jetbrains.ai/api/v1/chat/completions";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Grazie-Authenticate-JWT": config.JETBRAINS_API_KEY,
        "Grazie-Agent": JSON.stringify({
          name: "icons-synonyms-ai",
          version: "1.0.0"
        })
      },
      body: JSON.stringify({
        model: "jetbrains-chat",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${params.imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });
    if (!response.ok) {
      throw new Error(`JetBrains API error: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Response from JetBrains API:", data);
    const content = ((_c = (_b = (_a = data.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) || "";
    const parsedSynonyms = parseAIResponse(content);
    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error("No valid synonyms generated");
    }
    return {
      synonyms: parsedSynonyms
    };
  } catch (error) {
    console.error("Error generating synonyms with JetBrains API:", error);
    throw error;
  }
}
async function generateSynonyms(params) {
  try {
    if (config.API_PROVIDER === "jetbrains") {
      return await generateSynonymsWithJetBrains(params);
    } else {
      return await generateSynonymsWithOpenAI(params);
    }
  } catch (error) {
    console.error("Error generating synonyms:", error);
    return {
      synonyms: [],
      error: error.message || "Unknown error occurred"
    };
  }
}
var init_ai_service = __esm({
  "src/ai-service.ts"() {
    "use strict";
    init_config();
    init_prompt_templates();
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
function main_default() {
  showUI({
    width: 400,
    height: 500
  });
  function updateDescription(node, description) {
    node.description = description;
  }
  function sendSelectionToUI() {
    var _a, _b;
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      const node = selection[0];
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE") {
        const hasDescription = Boolean(
          node.type === "INSTANCE" ? (_a = node.mainComponent) == null ? void 0 : _a.description : node.description
        );
        const description = node.type === "INSTANCE" ? ((_b = node.mainComponent) == null ? void 0 : _b.description) || "" : node.description || "";
        emit("selection-change", {
          name: node.name,
          type: node.type,
          description,
          hasDescription
        });
      }
    }
  }
  on("generate-synonyms", async () => {
    try {
      figma.notify("Generating synonyms...");
      const selection = figma.currentPage.selection;
      const nodeToExport = getBestNodeToExport(selection);
      if (!nodeToExport) {
        emit("generate-error", {
          error: "No valid icon selected"
        });
        return;
      }
      const imageBase64 = await exportNodeAsBase64(nodeToExport);
      let name = nodeToExport.name;
      let description = "";
      if (nodeToExport.type === "COMPONENT") {
        description = nodeToExport.description || "";
      } else if (nodeToExport.type === "INSTANCE" && nodeToExport.mainComponent) {
        description = nodeToExport.mainComponent.description || "";
      }
      const result = await generateSynonyms({
        name,
        imageBase64,
        existingDescription: description
      });
      console.log("Raw synonyms from AI:", result.synonyms);
      const groups = [
        {
          title: "Usage",
          synonyms: result.synonyms.filter((s) => s.toLowerCase().startsWith("usage:")).map((s) => s.replace(/^usage:\s*/i, "").trim())
        },
        {
          title: "Object",
          synonyms: result.synonyms.filter((s) => s.toLowerCase().startsWith("object:")).map((s) => s.replace(/^object:\s*/i, "").trim()).flatMap((s) => s.split(",").map((term) => term.trim())).filter((s) => s.length > 0)
        },
        {
          title: "Modificator",
          synonyms: result.synonyms.filter((s) => s.toLowerCase().startsWith("modificator:")).map((s) => s.replace(/^modificator:\s*/i, "").trim()).flatMap((s) => s.split(",").map((term) => term.trim())).filter((s) => s.length > 0)
        },
        {
          title: "Shapes",
          synonyms: result.synonyms.filter((s) => s.toLowerCase().startsWith("shapes:")).map((s) => s.replace(/^shapes:\s*/i, "").trim()).flatMap((s) => s.split(",").map((term) => term.trim())).filter((s) => s.length > 0)
        }
      ].filter((group) => group.synonyms.length > 0);
      console.log("Grouped synonyms:", groups);
      emit("synonyms-generated", { groups });
      figma.notify("Synonyms generated successfully!");
    } catch (error) {
      console.error("Error in generate-synonyms handler:", error);
      emit("generate-error", {
        error: error.message || "Unknown error occurred"
      });
      figma.notify("Error generating synonyms");
    }
  });
  on("update-description", (data) => {
    const selection = figma.currentPage.selection[0];
    if (selection && (selection.type === "COMPONENT" || selection.type === "COMPONENT_SET")) {
      try {
        const existingDescription = selection.description || "";
        const usageTerms = data.synonyms.filter((s) => s.toLowerCase().startsWith("usage:")).map((s) => s.replace(/^usage:\s*/i, "").trim());
        const objectTerms = data.synonyms.filter((s) => s.toLowerCase().startsWith("object:")).map((s) => s.replace(/^object:\s*/i, "").trim());
        const modificatorTerms = data.synonyms.filter((s) => s.toLowerCase().startsWith("modificator:")).map((s) => s.replace(/^modificator:\s*/i, "").trim());
        const shapeTerms = data.synonyms.filter((s) => s.toLowerCase().startsWith("shapes:")).map((s) => s.replace(/^shapes:\s*/i, "").trim());
        const newLines = [];
        if (usageTerms.length > 0) newLines.push(`Usage: ${usageTerms.join(", ")}`);
        if (objectTerms.length > 0) newLines.push(`Object: ${objectTerms.join(", ")}`);
        if (modificatorTerms.length > 0) newLines.push(`Modificator: ${modificatorTerms.join(", ")}`);
        if (shapeTerms.length > 0) newLines.push(`Shapes: ${shapeTerms.join(", ")}`);
        const newDescription = existingDescription ? `${existingDescription}
${newLines.join("\n")}` : newLines.join("\n");
        selection.description = newDescription;
        figma.notify("Description updated successfully!");
      } catch (error) {
        emit("generate-error", {
          error: "Failed to update description: " + error.message
        });
      }
    }
  });
  figma.on("selectionchange", () => {
    sendSelectionToUI();
  });
  sendSelectionToUI();
}
var init_main = __esm({
  "src/main.ts"() {
    "use strict";
    init_lib();
    init_icon_exporter();
    init_ai_service();
  }
});

// <stdin>
var modules = { "src/main.ts--default": (init_main(), __toCommonJS(main_exports))["default"] };
var commandId = true ? "src/main.ts--default" : figma.command;
modules[commandId]();
