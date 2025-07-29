# Deep Research Feature - Comprehensive Test Guide

## Overview
This guide provides step-by-step instructions for testing the Deep Research feature in Ron AI, including verification steps and expected behaviors at each stage.

## Prerequisites
1. Ensure the backend server is running:
   ```bash
   cd backend && python api.py
   ```
   
2. Ensure the frontend is running:
   ```bash
   npm run dev
   ```

3. Open the application at `http://localhost:3000`

## Test Scenarios

### Test 1: Basic Deep Research Flow

#### Steps:
1. **Enable Deep Research**
   - Toggle ON the "Deep Research" switch in the UI
   - Verify: The toggle should be highlighted/active

2. **Submit a Research Topic**
   - Type a research topic in the input field (e.g., "Latest treatments for Type 2 Diabetes")
   - Click Send or press Enter
   - **Expected**: 
     - Loading indicator appears
     - Research Progress component becomes visible
     - Stage 1 "Planning Research" should be active

3. **Wait for Research Plan**
   - **Expected within 10-30 seconds**:
     - Research plan appears with 5+ bullet points
     - Each point prefixed with [RESEARCH] or [DELIVERABLE]
     - Two buttons appear: "Approve & Execute" and "Request Changes"
     - Stage 1 shows as completed (checkmark)

4. **Approve the Plan**
   - Click "Approve & Execute" button
   - **Expected**:
     - Button click is registered (check browser console)
     - Message "Looks good, run it" is sent
     - Stage 2 "Researching" becomes active
     - Loading indicator reappears

5. **Monitor Research Progress**
   - **Expected progression**:
     - Stage 2: "Researching" (may take 1-3 minutes)
     - Stage 3: "Evaluating Quality" (10-30 seconds)
     - Stage 4: "Composing Report" (30-60 seconds)
     - Each stage should show checkmark when complete

6. **View Final Report**
   - **Expected**:
     - Complete research report appears in the chat
     - Report includes citations as clickable links
     - All stages show as completed
     - Research Progress component may hide or show completion state

### Test 2: Session Persistence Verification

#### Steps:
1. Complete Test 1 up to step 3 (get research plan)
2. **Check Backend Logs** for:
   ```
   Creating new session [session_id]
   Created message for Gemini agent: role=user, text=Please conduct deep research...
   ```

3. Click "Approve & Execute"
4. **Check Backend Logs** for:
   ```
   Using existing session [session_id] with state: dict_keys(['research_plan'])
   Session has research plan: True
   Current research plan: [RESEARCH] Analyze the latest...
   Detected approval message: Looks good, run it
   ```

5. **Verify**: The session ID in both log entries should be the same

### Test 3: Error Recovery

#### Steps:
1. Enable Deep Research and submit a topic
2. When research plan appears, wait 5 seconds
3. Click "Request Changes" instead of approve
4. Type feedback: "Please include more information about prevention strategies"
5. Send the feedback
6. **Expected**:
   - Agent revises the plan with [MODIFIED] tags
   - New plan includes prevention-related points
   - Approval buttons reappear

### Test 4: Multiple Research Sessions

#### Steps:
1. Complete a full research flow (Test 1)
2. Start a new research topic without refreshing the page
3. **Expected**:
   - New session is created
   - Previous research doesn't interfere
   - Full flow works correctly

## Backend Log Monitoring

Open a terminal to monitor backend logs:
```bash
tail -f api.log
```

### Key Log Messages to Watch For:

1. **Session Creation**:
   ```
   Deep research request received - sessionId: xxx, userId: yyy
   Creating new session xxx
   ```

2. **Session Reuse** (Critical for approval):
   ```
   Using existing session xxx with state: dict_keys(['research_plan'])
   Session has research plan: True
   ```

3. **Approval Detection**:
   ```
   Detected approval message: Looks good, run it
   ```

4. **Agent Transitions**:
   ```
   Starting agent run with message: Looks good, run it
   ```

## Browser Console Monitoring

Open browser DevTools (F12) and monitor the Console tab:

### Expected Console Messages:

1. **Message Sending**:
   ```
   handleSendMessage called with: [message]
   Sending message with deep research enabled
   ```

2. **Approval Message**:
   ```
   handleSendMessage called with: Looks good, run it
   Approval message detected - bypassing processing check
   ```

3. **SSE Events**:
   ```
   Received SSE event: message
   Research state update: {research_plan: ...}
   ```

## Common Issues and Solutions

### Issue 1: Buttons Don't Respond
- **Check**: Browser console for "Message blocked - processing in progress"
- **Solution**: Refresh page and try again

### Issue 2: Agent Asks for New Topic After Approval
- **Check**: Backend logs for "Creating new session" after approval
- **Solution**: Restart backend server - session service may have reset

### Issue 3: Research Progress Stuck
- **Check**: Network tab for failed SSE connections
- **Solution**: Check backend is running and CORS is configured

### Issue 4: No Research Plan Appears
- **Check**: Backend logs for errors
- **Solution**: Ensure Gemini API credentials are configured

## Success Criteria

The Deep Research feature is working correctly when:

1. ✅ Buttons respond immediately when clicked
2. ✅ Approval message triggers research execution (not a new plan request)
3. ✅ Research progresses through all 4 stages
4. ✅ Final report includes citations and comprehensive information
5. ✅ Session persists across messages (check backend logs)
6. ✅ Multiple research sessions can run independently

## Performance Expectations

- Research Plan Generation: 10-30 seconds
- Full Research Execution: 2-5 minutes
- Quality depends on topic complexity

## Debug Commands

If issues persist, run these commands:

1. **Check Python Dependencies**:
   ```bash
   pip list | grep google-adk
   ```

2. **Verify Environment Variables**:
   ```bash
   echo $GOOGLE_CLOUD_PROJECT
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

3. **Test API Directly**:
   ```bash
   curl -X POST http://localhost:8000/api/run_sse \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "userId": "test", "sessionId": "test123"}'
   ```

---

## Report Issues

If the feature doesn't work as expected after following this guide:

1. Save the backend logs
2. Save the browser console logs
3. Note which step failed
4. Include the session ID from the logs

This information will help diagnose any remaining issues quickly.