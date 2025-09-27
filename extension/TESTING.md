# Prism AI Extension Testing Guide

## Installation Steps

1. **Open Chrome Browser**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `extension` folder
   - The extension should appear in your extensions list

3. **Generate PNG Icons (if needed)**
   - Open `create-png-icons.html` in your browser
   - Icons will auto-download as PNG files
   - Replace the SVG files in the `icons/` folder with the PNG versions

## Testing Checklist

### ✅ Basic Functionality
- [ ] Extension loads without errors
- [ ] Icon appears in browser toolbar
- [ ] Popup opens when clicking icon
- [ ] No console errors in extension pages

### ✅ Overlay Testing
- [ ] Navigate to any website (e.g., news site, Wikipedia)
- [ ] Click extension icon or use keyboard shortcut
- [ ] Overlay appears with glassmorphism effect
- [ ] Control bar is visible at top
- [ ] Left panel (Live Insights) displays
- [ ] Right panel (AI Response) displays
- [ ] Microphone button appears in bottom right

### ✅ Interaction Testing
- [ ] Click "Show/Hide" button - overlay toggles
- [ ] Click "Ask AI" button - voice listening starts/stops
- [ ] Click microphone button - voice listening toggles
- [ ] Click minimize/maximize button - panels collapse/expand
- [ ] Hover over microphone - tooltip appears

### ✅ Keyboard Shortcuts
- [ ] Press `Cmd + Shift` (Mac) or `Ctrl + Shift` (Windows/Linux)
- [ ] Voice listening should toggle
- [ ] Press `Cmd + \` (Mac) or `Ctrl + \` (Windows/Linux)
- [ ] Overlay should show/hide

### ✅ Visual Testing
- [ ] Glassmorphism effect works (backdrop blur)
- [ ] Overlay is translucent and doesn't interfere with page
- [ ] All animations work smoothly
- [ ] Colors and gradients display correctly
- [ ] Text is readable over various backgrounds

### ✅ Cross-Site Testing
- [ ] Test on different types of websites:
  - News sites (CNN, BBC)
  - Social media (Twitter, LinkedIn)
  - E-commerce (Amazon, eBay)
  - Documentation (GitHub, Stack Overflow)
  - Video sites (YouTube, Vimeo)

## Known Issues & Limitations

### Current Limitations
- **Voice Recognition**: Not yet connected to actual speech API
- **AI Analysis**: Static demo content (no real AI processing)
- **Web Search**: Not yet implemented
- **Persistence**: Overlay state doesn't persist across page reloads

### Expected Behaviors
- Overlay should appear on all websites
- Glassmorphism styling should work consistently
- Keyboard shortcuts should work globally
- Popup settings should be functional

## Debugging

### Check Console for Errors
1. Right-click on extension icon → "Inspect popup"
2. Check Console tab for any errors
3. Also check `chrome://extensions/` for extension errors

### Common Issues
- **Icons not showing**: Make sure PNG files exist in `icons/` folder
- **Overlay not appearing**: Check if content script is injected
- **Styling issues**: Verify CSS is loading correctly
- **Keyboard shortcuts not working**: Check if event listeners are bound

### Performance Testing
- Test on heavy websites with lots of content
- Check memory usage in Chrome Task Manager
- Verify overlay doesn't slow down page scrolling

## Next Steps After Testing

Once basic functionality is confirmed:
1. Integrate CedarOS + Mastra for AI processing
2. Add real voice recognition
3. Implement Perplexity search
4. Add subagent architecture for accuracy

## Feedback Collection

Please note any issues found:
- [ ] Visual glitches
- [ ] Performance problems  
- [ ] Cross-site compatibility issues
- [ ] Keyboard shortcut problems
- [ ] Popup functionality issues
