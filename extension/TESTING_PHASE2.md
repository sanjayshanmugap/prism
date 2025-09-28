# Phase 2 Testing Guide: CedarOS + Mastra Integration

## 🔒 Security Setup Complete
- ✅ API keys are now protected in .gitignore
- ✅ Template configuration file created for safe setup
- ✅ Your OpenAI API key is configured and ready

## 🔧 Critical Fixes Applied
- ✅ Fixed ES6 import syntax issues in background.js
- ✅ Resolved extension context invalidation errors
- ✅ Implemented direct OpenAI API integration
- ✅ Added proper error handling for Chrome extension compatibility
- ✅ Service worker now works with Manifest V3

## 🧪 Testing Checklist

### **Pre-Test Setup**
1. **Load Extension in Chrome**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder
   - Verify extension appears with Prism AI icon

2. **Verify API Configuration**:
   - Check that `extension/config/api-config.js` contains your OpenAI API key
   - Ensure the key starts with `sk-proj-` (your actual key is configured)

### **Test 1: Basic Overlay Functionality**
- [ ] **Load Extension**: Extension loads without errors
- [ ] **Icon Display**: Prism AI icon appears in browser toolbar
- [ ] **Popup Works**: Clicking icon shows popup with blue-purple gradient
- [ ] **Overlay Toggle**: Clicking "Toggle Overlay" shows/hides the glassmorphism overlay
- [ ] **Keyboard Shortcuts**: 
  - `⌘ \` (Cmd + Backslash) toggles overlay visibility
  - `⌘ ⇧` (Cmd + Shift) toggles voice listening

### **Test 2: AI Content Analysis**
Navigate to different types of websites and test auto-analysis:

#### **Financial Website Test** (e.g., Yahoo Finance, Bloomberg)
1. Navigate to a financial news article
2. Click extension icon to show overlay
3. Wait 2-3 seconds for auto-analysis
4. **Expected Results**:
   - [ ] Left panel shows "Content Analysis" insights
   - [ ] AI detects financial terms (revenue, profit, EBITDA, etc.)
   - [ ] Action buttons suggest relevant financial questions
   - [ ] Right panel shows AI-generated summary
   - [ ] Confidence score displayed (should be >70%)

#### **News Website Test** (e.g., CNN, BBC, Reuters)
1. Navigate to a news article
2. Show overlay and wait for analysis
3. **Expected Results**:
   - [ ] Insights identify main topics and themes
   - [ ] Actions suggest relevant follow-up questions
   - [ ] AI summary captures key points
   - [ ] Confidence score reflects content quality

#### **Technical Website Test** (e.g., GitHub, Stack Overflow, documentation)
1. Navigate to technical content
2. Show overlay and wait for analysis
3. **Expected Results**:
   - [ ] Technical concepts identified
   - [ ] Relevant technical questions suggested
   - [ ] Summary focuses on technical aspects
   - [ ] Appropriate confidence scoring

### **Test 3: Voice Processing**
1. **Microphone Permission**: Click microphone button, allow permissions
2. **Voice Commands**: Try these commands:
   - [ ] "Analyze this content"
   - [ ] "What is this about?"
   - [ ] "Explain the main points"
   - [ ] "What are the key topics?"

**Expected Results**:
- [ ] Voice input is captured and processed
- [ ] AI responds with relevant analysis
- [ ] Overlay updates with new insights
- [ ] Intent detection works correctly

### **Test 4: Real-Time Updates**
1. **Dynamic Content**: Show overlay on a webpage
2. **Navigate to Different Page**: Go to another page on same site
3. **Show Overlay Again**: Click to show overlay on new page
4. **Expected Results**:
   - [ ] Content analysis updates for new page
   - [ ] Insights reflect new content
   - [ ] Actions adapt to new context
   - [ ] No stale data from previous page

### **Test 5: Error Handling**
1. **Network Issues**: Disconnect internet, try to show overlay
2. **Invalid Content**: Show overlay on a blank page
3. **API Limits**: Test with multiple rapid requests
4. **Expected Results**:
   - [ ] Graceful error messages
   - [ ] Fallback responses when API fails
   - [ ] No crashes or broken UI
   - [ ] Retry logic works properly

## 🔍 Debugging Guide

### **Check Console for Errors**
1. **Extension Console**: Right-click extension icon → "Inspect popup"
2. **Background Script**: Go to `chrome://extensions/` → Click "service worker" link
3. **Content Script**: Right-click page → "Inspect" → Console tab

### **Common Issues & Solutions**

#### **"API key not configured" Error**
- **Solution**: Verify `extension/config/api-config.js` has your actual OpenAI key
- **Check**: Key should start with `sk-proj-`

#### **"No insights generated"**
- **Check**: Browser console for API errors
- **Verify**: Internet connection and API key validity
- **Test**: Try on different websites with more content

#### **"Voice not working"**
- **Check**: Microphone permissions in browser
- **Verify**: Browser supports Web Speech API
- **Test**: Try different voice commands

#### **"Overlay not appearing"**
- **Check**: Content script injection in console
- **Verify**: Extension permissions include "activeTab"
- **Reload**: Refresh the webpage and try again

### **Performance Monitoring**
- [ ] **Loading Time**: Overlay appears within 2 seconds
- [ ] **Analysis Speed**: AI analysis completes within 5 seconds
- [ ] **Memory Usage**: Check Chrome Task Manager for memory leaks
- [ ] **API Calls**: Monitor network tab for API request efficiency

## 📊 Success Criteria

### **Minimum Viable Product (MVP)**
- [ ] Overlay displays correctly on any website
- [ ] AI analysis generates relevant insights for financial content
- [ ] Voice commands trigger appropriate responses
- [ ] No crashes or major errors
- [ ] API integration works reliably

### **Excellent Performance**
- [ ] Analysis accuracy >80% for relevant content
- [ ] Response time <3 seconds for most requests
- [ ] Voice recognition accuracy >90% for clear speech
- [ ] Zero crashes during normal usage
- [ ] Smooth animations and transitions

## 🚀 Next Steps After Testing

Once Phase 2 testing is complete:
1. **Report Issues**: Document any bugs or performance issues
2. **Performance Metrics**: Note response times and accuracy
3. **User Feedback**: Test with different types of content
4. **Phase 3 Ready**: Proceed to Perplexity web search integration

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

✅ Basic Overlay: Pass/Fail
✅ Financial Analysis: Pass/Fail  
✅ News Analysis: Pass/Fail
✅ Technical Analysis: Pass/Fail
✅ Voice Commands: Pass/Fail
✅ Real-time Updates: Pass/Fail
✅ Error Handling: Pass/Fail

Performance:
- Average Response Time: _____ seconds
- Analysis Accuracy: _____%
- Voice Recognition: _____%
- Memory Usage: _____ MB

Issues Found:
1. ________________
2. ________________
3. ________________

Ready for Phase 3: Yes/No
```

Happy testing! 🎯
