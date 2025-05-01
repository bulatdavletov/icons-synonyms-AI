Batch Processing:
I select 3 component sets, plugin show all 3 of them.
I press Generate All, plugin generate synonyms for all 3 component sets. 
OpenAI side: If we make all messages in chat, could it improve quality of generation?
I check components one by one.

Possible action with each component:
- Click synonyms from list
- Manual edit description
- "Save Description" to save current description. Synonyms should disappear. Green checkmark should be shown to show that this item was edited.
- "Regenerate" synonyms.
- "Cancel" to revert to original description

When I change selection - I don'r want to loose components with generated synonyms.
So if I change selection without generating - they should disappear.
If I change selection and there is some generated synonyms - they shouldn't be lost.
Tell me if this description clear enough or ask me to clarify something.

- [ ] Components to separate cards? UI components to separate components?
- [ ] "Generate All" is for all selected components, "Save Description" is for current component
- [ ] Add "Regenerate" button to each card, that works only for current card

Description Handling:
- [ ] Must have option should be checked by default: description of an icon
- [x] After Applying - show updated description with ability to edit it
- [x] Current description should be editable from the beginning

- [ ] If I already generate synonyms and changed selection - don't change current component - add a new one
Or add button Clear? It should clear all generated synonyms.

Component Size Variations:
- [ ] Edit description of the same components with another size. So one description should go to all components
    - toolwindow / ant
    - toolwindow / ant@20x20 
    - toolwindow / ant@14x14
    - How it should be in UI: Instead of 1 name there should be 3 names. Search for similar layers should be on the same Figma page only. If any of these components already has a description - it should be shown as a text under the name. But description text area in this case should be one and the same for all of them.

Similar Icons:
- [ ] Find similar named or descripted icons, and copy show their description
How? Should we have list of all icons with descriptions?
- [ ] Check name and description of mods inside

- Ability to export and import all layers as CSV file: with name of layer, description, links, etc
So we can do some manipulations with it in other tools.

---

If I select 2 cpomponents with similar names "toolwindow / ant" and "toolwindow / ant@20x20", I want to generate one description for both of them.

If i click name of a component - I want to zoom in on it, without loosing current selection.

If I select components, generate synonyms, and then select another components - I want to save card with generated synonyms. If component doesn't have any changes or synonyms - deselect it.

Save all, Generate all, Clear all?

