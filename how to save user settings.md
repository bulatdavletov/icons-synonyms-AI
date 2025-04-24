To save user settings in a Figma plugin, the recommended approach is to use the `figma.clientStorage` API. This API allows you to persist user-specific data (such as settings or preferences) on the user's local machine, so the data remains available across plugin sessions[5][6][1].

## How to Use `figma.clientStorage` for User Settings

**Basic Usage Example:**

```typescript
// Save user settings
await figma.clientStorage.setAsync('userSettings', { theme: 'dark', autoSave: true });

// Retrieve user settings
const settings = await figma.clientStorage.getAsync('userSettings');
if (settings) {
  // Apply settings as needed
  applyUserSettings(settings);
}

// Delete user settings (e.g., on logout)
await figma.clientStorage.deleteAsync('userSettings');
```
- The `setAsync` method stores any JSON-serializable value under a string key.
- The `getAsync` method retrieves the value for a given key (returns `undefined` if not set).
- The `deleteAsync` method removes the key/value pair from storage[5][6].

**Best Practices:**
- Use a unique key or prefix (e.g., your plugin's name) to avoid collisions with other plugins[5].
- Implement error handling to manage storage failures gracefully[5].
- The API is asynchronous, so always use `await` or handle Promises properly[6].

## Communication Between UI and Plugin Code

Since `figma.clientStorage` is only available in the main plugin code (not directly in the UI code), you must use message passing to save settings that originate from your plugin's UI:

1. **Send a message from the UI to the plugin main code:**
   ```javascript
   // In your UI code (e.g., React, vanilla JS)
   parent.postMessage({
     pluginMessage: {
       type: 'SAVE_USER_SETTINGS',
       settings: { theme: 'dark', autoSave: true }
     }
   }, '*');
   ```

2. **Handle the message in your main plugin code:**
   ```typescript
   // In your main plugin code (code.ts)
   figma.ui.onmessage = async (msg) => {
     if (msg.type === 'SAVE_USER_SETTINGS') {
       await figma.clientStorage.setAsync('userSettings', msg.settings);
     }
   };
   ```
This ensures settings from the UI are correctly persisted[4].

## Key Points

- `figma.clientStorage` is private to each plugin and not shared between plugins[6].
- Each plugin has a 5MB storage limit[6].
- Data is not synced between different users or devices—it's local to the user's machine[6].
- Data may be cleared if the user clears their browser cache or if the plugin ID changes[6].

By following this approach, you can reliably save and retrieve user settings in your Figma plugin, providing a seamless experience for your users[5][6][4].

Sources
[1] What is the most efficient way to save user's data in plugins? https://forum.figma.com/ask-the-community-7/what-is-the-most-efficient-way-to-save-user-s-data-in-plugins-28579
[2] Manage plugins and widgets in an organization - Figma help https://help.figma.com/hc/en-us/articles/4404228724759-Manage-plugins-and-widgets-in-an-organization
[3] Save plugins and widgets for an organization - Figma help https://help.figma.com/hc/en-us/articles/4404239055127-Save-plugins-and-widgets-for-an-organization
[4] How to make next-level Figma plugins: auth, routing, storage, and ... https://evilmartians.com/chronicles/how-to-make-next-level-figma-plugins-auth-routing-storage-and-more
[5] Making Figma Plugins More Powerful with clientStorage https://story.vjy.me/making-figma-plugins-more-powerful-with-clientstorage-40
[6] figma.clientStorage | Plugin API https://www.figma.com/plugin-docs/api/figma-clientStorage/
[7] How to install and uninstall Figma plugins - Hypermatic https://www.hypermatic.com/tutorials/how-to-install-and-uninstall-figma-plugins/
[8] How to use Plugins in Figma - YouTube https://www.youtube.com/watch?v=ZEOdvJSkcmM
