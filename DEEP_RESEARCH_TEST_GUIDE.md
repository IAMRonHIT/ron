# Deep Research Feature - Testing Guide

## Overview
The deep research feature has been updated to handle all research stages properly. Here's what was fixed:

### Issues Resolved:
1. **Topic Switching Issue**: The AI employment topic was appearing due to the Gemini agent's example output. This is now properly handled.
2. **Context Variable Error**: Fixed the "research_plan not found" error by ensuring proper state management between approval and execution.
3. **Research Flow**: Improved the flow to properly handle plan approval and execution stages.
4. **Error Handling**: Added comprehensive error handling for various failure scenarios.

### Key Improvements Made:

1. **State Management**:
   - Clear the research plan from approval state after it's approved
   - Properly track research steps through all stages
   - Handle errors gracefully with user-friendly messages

2. **UI Updates**:
   - Research progress shows correct status at each stage
   - Error states are properly displayed
   - Final reports are added as assistant messages

3. **Error Handling**:
   - Detects and handles errors in SSE events
   - Shows appropriate error messages to users
   - Prevents the UI from getting stuck in processing state

## Testing Steps

### 1. Basic Deep Research Flow
1. Enable "Deep Research" toggle in the UI
2. Enter a research query: "Research the current trends in PTSD treatment"
3. Wait for the research plan to be generated
4. Review the plan and click "Approve & Execute"
5. Monitor the research progress through all stages
6. Verify the final report is generated with citations

### 2. Error Scenarios to Test
1. **Network Interruption**: Disconnect network during research execution
2. **Session Timeout**: Wait for extended period between plan approval and execution
3. **Invalid Research Topic**: Try topics that might cause the agent to fail

### 3. Expected Behavior

#### Stage 1: Initialization
- Status: "Initializing Deep Research"
- Description: "Setting up research parameters..."

#### Stage 2: Plan Generation
- Status: "Research Methodology Generated"
- Shows the research plan for review
- Approve/Edit buttons are functional

#### Stage 3: Execution (after approval)
- Status: "Executing Research"
- Description: "Conducting comprehensive research..."

#### Stage 4: Report Generation
- Multiple sub-stages may appear:
  - Report Outline Generated
  - Conducting Research
  - Research Complete

#### Stage 5: Final Output
- Complete research report with citations
- Report appears as an assistant message
- All progress steps show as completed

## Common Issues and Solutions

### Issue: "Context variable not found: research_plan"
**Solution**: This has been fixed. If it still occurs, ensure the backend is properly passing the research plan in the session state.

### Issue: Research shows AI employment instead of requested topic
**Solution**: This is a backend issue where the Gemini agent might be using example data. The frontend now handles this gracefully, but the backend should be updated to use the actual user query.

### Issue: Buttons don't work after plan is shown
**Solution**: Fixed by resetting `isProcessing` state when the plan arrives.

### Issue: UI gets stuck in processing state
**Solution**: Added proper error handling and finally blocks to ensure processing state is always cleared.

## Code Structure

### Key Components:
- `src/app/page.tsx`: Main page handling deep research flow
- `src/components/research-progress-clean.tsx`: Progress visualization
- `src/lib/api.ts`: API client for deep research endpoints

### Key State Variables:
- `isDeepResearch`: Toggle for deep research mode
- `researchSteps`: Array tracking research progress
- `researchPlanForApproval`: Stores plan awaiting approval
- `currentSessionId`/`currentUserId`: Session management

## Future Improvements

1. **Backend Integration**: Ensure the Gemini agent properly uses the user's actual research query
2. **Progress Granularity**: Add more detailed progress updates during research execution
3. **Retry Mechanism**: Add ability to retry failed research steps
4. **Export Options**: Allow users to export research reports in various formats
5. **Research History**: Store and display previous research sessions

## Debugging Tips

1. Check browser console for detailed logs
2. Look for "Deep research error:" messages
3. Verify SSE events are properly formatted
4. Ensure backend is returning proper state deltas
5. Check network tab for API calls to `/api/run_sse`