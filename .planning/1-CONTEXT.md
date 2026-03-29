# Phase 1 Context: Infraestrutura & Correções

## Current State Analysis

### 1. Sync System (APK)
**Location**: `src/services/api.js` (NOT SyncService.js)

The app uses this flow:
```
SourceContext.selectSource → getList() → api.syncSource()
```

**api.js fallback chain** (for APK):
1. CapacitorHttp.get() - native HTTP
2. Public proxies (allorigins.win, corsproxy.io, cors-anywhere)
3. Direct fetch

**Finding**: SyncService.js is a simple fetch wrapper that is NOT used anywhere. The actual sync logic is in api.js with proper CapacitorHttp support.

**Gray Areas**:
- Is there a specific error when sync fails in APK? (timeout, CORS, source down?)
- Which source(s) fail to load? All or specific ones?
- Should SyncService.js be integrated or deprecated?

---

### 2. Credentials Migration
**Location**: `src/data/credentials.js`

**Current implementation**:
```js
const getEnv = (key, fallback = '') => {
  return import.meta?.env?.[key] || fallback;
};

// Usage:
host: getEnv('VITE_SAWSAX_HOST', 'http://185.66.90.170'), // HARDCODED FALLBACK
user: getEnv('VITE_SAWSAX_USER_1', 'welligton7753'),      // ACTUAL CREDENTIALS
pass: getEnv('VITE_SAWSAX_PASS_1', '2336USDGyewz'),        // EXPOSED IN SOURCE
```

**Problem**: Fallback values ARE the actual credentials - defeats the security purpose.

**Gray Areas**:
- Should we REMOVE fallbacks entirely (app breaks without .env)?
- Or keep empty fallbacks and warn user to configure .env?
- Is there a .env file already present in the project?

---

### 3. ChannelListOverlay Integration
**Location**: `src/components/Channels/ChannelListOverlay.jsx`

**Already integrated in App.jsx** (lines 251-261):
- Triggered by: Sidebar button, Navbar button, keyboard (Guide or Shift+Enter)
- Receives props: channels, groups, activeGroup, onPlayChannel, currentChannel

**Gray Areas**:
- Is there a specific issue? (not opening, missing features)
- The component receives `channelValidity` prop but doesn't display validity status - should this be added?
- Any UI/UX improvements needed?

---

## Questions for Downstream Agents

### For Researcher:
1. Test the APK - does sync actually fail? What's the error message?
2. Check if .env file exists in project root
3. Identify which sources work/don't work in the APK

### For Planner:
1. What's the desired behavior when .env is missing? (fail hard or use fallback)
2. Priority of ChannelListOverlay improvements vs other Phase 1 tasks

---

## Implementation Notes

### Credentials Fix (if approved):
- Option A: Remove all fallbacks → requires .env
- Option B: Keep empty fallbacks → logs warning if missing
- Must verify Vite embeds .env into APK build (it should with VITE_ prefix)

### Sync Fix (if needed):
- Current api.js already has proper CapacitorHttp implementation
- May need to increase timeout or add more fallback proxies
- Could integrate SyncService.js as a lightweight wrapper

### ChannelListOverlay:
- Already functional - confirm if any issues exist
- Consider adding channel validity indicator (green/red dot)
