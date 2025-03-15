# Batch Processing Implementation Plan

## Overview
This document outlines the implementation plan for batch processing in the Icon Synonyms AI Plugin. The goal is to enable users to select multiple components and generate synonyms for them sequentially, with a user-friendly interface that provides clear feedback on the process.

## UI Design

### Table-Based Interface
We'll implement a table-based UI for batch processing with the following columns:
- Icon Preview (small thumbnail of the icon)
- Component Name
- Status (Queued, Processing, Completed, Failed)
- Actions (View/Edit, Retry, Cancel)

```
┌────────────────┬────────────────┬────────────────┬────────────┐
│ Icon Preview   │ Component Name │ Status         │ Actions    │
├────────────────┼────────────────┼────────────────┼────────────┤
│ [Icon Image]   │ icon-home      │ ✅ Generated   │ Edit View  │
│ [Icon Image]   │ icon-settings  │ ⏳ Processing  │ Cancel     │
│ [Icon Image]   │ icon-user      │ ⏱️ Queued      │            │
│ [Icon Image]   │ icon-search    │ ❌ Failed      │ Retry      │
└────────────────┴────────────────┴────────────────┴────────────┘
```

### Batch Controls
- "Generate All" button - Start processing all selected components
- "Apply All" button - Apply generated synonyms to all components
- "Cancel" button - Stop the batch process
- Progress bar showing overall completion percentage

### Individual Component View
When a user clicks "Edit/View" for a component, show the detailed synonym editor for that specific component, maintaining the existing grouped view (Objects, Meanings, Shapes, Other).

## Implementation Details

### 1. Selection Handling
- Capture multiple selected components in Figma
- Create a queue of components to process
- Store component metadata (ID, name, node reference)

```typescript
interface BatchItem {
  id: string;
  name: string;
  node: ComponentNode | ComponentSetNode;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  synonyms?: GroupedSynonyms;
  error?: string;
}

let batchQueue: BatchItem[] = [];
```

### 2. Sequential Processing
- Process one component at a time
- Update UI after each component is processed
- Handle errors gracefully without stopping the entire batch

```typescript
async function processBatch() {
  for (let i = 0; i < batchQueue.length; i++) {
    const item = batchQueue[i];
    
    // Update status
    item.status = 'processing';
    updateUI();
    
    try {
      // Generate image and get synonyms
      const image = await exportIconAsImage(item.node);
      const synonyms = await generateSynonyms(image);
      
      // Update item with results
      item.synonyms = synonyms;
      item.status = 'completed';
    } catch (error) {
      item.status = 'failed';
      item.error = error.message;
    }
    
    // Update UI after each item
    updateUI();
  }
}
```

### 3. Progress Tracking
- Track overall progress (e.g., "3/10 completed")
- Show individual component status
- Provide visual indicators (icons, colors)

```typescript
function getProgressStats() {
  const total = batchQueue.length;
  const completed = batchQueue.filter(item => item.status === 'completed').length;
  const failed = batchQueue.filter(item => item.status === 'failed').length;
  const inProgress = batchQueue.filter(item => item.status === 'processing').length;
  
  return {
    total,
    completed,
    failed,
    inProgress,
    percentComplete: Math.round((completed / total) * 100)
  };
}
```

### 4. Cancellation Support
- Allow cancelling the entire batch process
- Allow cancelling individual component processing

```typescript
let isBatchCancelled = false;

function cancelBatch() {
  isBatchCancelled = true;
  
  // Mark remaining queued items as cancelled
  batchQueue.forEach(item => {
    if (item.status === 'queued') {
      item.status = 'cancelled';
    }
  });
  
  updateUI();
}
```

### 5. Synonym Groups
We will maintain the existing synonym grouping structure (Objects, Meanings, Shapes, Other) as it provides valuable semantic organization. The groups will be displayed when viewing/editing an individual component.

```typescript
interface GroupedSynonyms {
  objects: string[];
  meanings: string[];
  shapes: string[];
  other: string[];
}
```

## User Flow

1. **Selection**
   - User selects multiple components in Figma
   - Plugin detects multiple selection and switches to batch mode

2. **Batch Overview**
   - Plugin shows table with all selected components
   - Initial status for all components is "Queued"

3. **Processing**
   - User clicks "Generate All"
   - Components are processed one by one
   - Table updates in real-time with status changes

4. **Review & Edit**
   - User can click on any completed component to view/edit its synonyms
   - Synonym editor appears with grouped synonyms
   - User can select/deselect synonyms to include

5. **Apply Changes**
   - User can apply changes to individual components
   - User can apply all changes at once with "Apply All"

## Technical Considerations

### Performance
- Process components sequentially to avoid API rate limits
- Consider adding a small delay between API calls
- Cache results to avoid redundant processing

### Error Handling
- Gracefully handle API failures
- Provide retry options for failed items
- Show meaningful error messages

### State Management
- Track processing state for each component
- Maintain selection state for synonyms
- Preserve state during UI transitions

## Implementation Phases

### Phase 1: Basic Batch UI
- Create table-based UI for batch overview
- Implement queue management
- Add basic status tracking

### Phase 2: Sequential Processing
- Implement one-by-one processing
- Add progress indicators
- Handle basic error cases

### Phase 3: Enhanced UI
- Add detailed component view/edit
- Implement cancellation
- Add retry functionality

### Phase 4: Finalization
- Add summary statistics
- Optimize performance
- Polish UI and interactions

## Conclusion
This batch processing implementation will significantly enhance the plugin's usability for users working with large icon libraries. By processing components sequentially and providing clear visual feedback, we ensure a smooth and reliable experience while maintaining the valuable semantic grouping of synonyms. 