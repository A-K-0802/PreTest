# TestPrep DSA Platform - Project Issues, Solutions & Historical Context

This document maintains a complete tracking history of all user-reported problems, technical root causes, solutions implemented, and critical rules ("What NOT to do") to preserve codebase stability across future sessions.

---

## 📌 Index of Tracked Issues & Context

1. [Empty Testcases Table & Hidden Testcases Count Mismatch](#1-empty-testcases-table--hidden-testcases-count-mismatch)
2. [Deleted Question Placeholders Appearing on New Browser Login](#2-deleted-question-placeholders-appearing-on-new-browser-login)
3. [LeetCode-Style Filters Engine & Position Layout](#3-leetcode-style-filters-engine--position-layout)
4. [User Discussion Comments & Admin Moderation Dashboard](#4-user-discussion-comments--admin-moderation-dashboard)
5. [Submissions Trajectory & Acceptance Rate Analytics](#5-submissions-trajectory--acceptance-rate-analytics)
6. [Explicit Judge0 Error Output Formatting](#6-explicit-judge0-error-output-formatting)
7. [Question Details Infinite Loading State (Postgres 22P02 UUID Error)](#7-question-details-infinite-loading-state-postgres-22p02-uuid-error)
8. [Empty `stdin` Division-by-Zero (`SIGFPE`) Runtime Error in C++](#8-empty-stdin-division-by-zero-sigfpe-runtime-error-in-c)
9. [Public Judge0 Cloudflare HTTP Status 530 Rate Limiting](#9-public-judge0-cloudflare-http-status-530-rate-limiting)

---

## 🛠️ Detailed Issue Breakdown & History

### 1. Empty Testcases Table & Hidden Testcases Count Mismatch
- **User Problem**: Testcases were not inserting into Supabase `testcases` table when adding a question. Question bank page showed 8 hidden / 2 public testcases when only 5 existed.
- **Root Cause**: Admin form was reading static placeholder testcases and Supabase foreign key insert payloads were missing `question_id` UUID binding.
- **Solution**: Updated `/admin/questions/new` to query live DB IDs and properly batch insert public (`is_hidden: false`) and hidden (`is_hidden: true`) testcases into Supabase.

### 2. Deleted Question Placeholders Appearing on New Browser Login
- **User Problem**: Deleted questions appeared when logging in on a new browser window because of hardcoded `INITIAL_PROBLEMS` and `BASELINE_QUESTIONS` arrays.
- **Root Cause**: Frontend pages fell back to static client-side fallback arrays when database returned empty lists.
- **Solution**: Removed all static placeholder arrays (`INITIAL_PROBLEMS` & `BASELINE_QUESTIONS`). Problem catalog now loads exclusively from live Supabase DB rows (`questions` table).

### 3. LeetCode-Style Filters Engine & Position Layout
- **User Problem**: User requested tag/difficulty/status filtering modal positioned to the immediate right of search bar, with 30% reduced modal size.
- **Solution**: Created `ProblemFiltersModal.tsx` popover component positioned next to the fixed search bar (`w-full md:w-96`), supporting:
  - Difficulty (`EASY`, `MEDIUM`, `HARD`)
  - Status (`SOLVED`, `TODO`) via user's `ACCEPTED` submission set
  - Tags array (`text[]` in Postgres) with `AND` / `OR` tag matching modes.

### 4. User Discussion Comments & Admin Moderation Dashboard
- **User Problem**: Enable users to post comments on problem discussion tabs and provide admin moderation dashboard at `/admin/comments`.
- **Solution**: Built discussion comment box & feed on `/problems/[slug]` using Supabase `comments` table joined with `profiles(username)`. Updated `/admin/comments` and `/admin` metric cards to manage and moderate user comments.

### 5. Submissions Trajectory & Acceptance Rate Analytics
- **User Problem**: Track user submission history and calculate live problem Acceptance Rate `(Accepted Submissions / Total Submissions) * 100%`.
- **Solution**: Added **Submissions** tab on `/problems/[slug]`, updated `/submissions` page, and calculated live Acceptance Rates on problem cards and headers.

### 6. Explicit Judge0 Error Output Formatting
- **User Problem**: Replace generic execution fallback messages with explicit diagnostic boxes for `COMPILATION_ERROR`, `TIME_LIMIT_EXCEEDED`, `RUNTIME_ERROR`, and `WRONG_ANSWER`.
- **Solution**: Updated `backend/app/api/v1/execution.py` to extract `compile_output`, `stderr`, `stdout` and render formatted terminal output blocks in Next.js frontend.

### 7. Question Details Infinite Loading State (Postgres 22P02 UUID Error)
- **User Problem**: Opening problem pages showed `"Loading problem from database..."` indefinitely.
- **Root Cause**: Supabase query `.or("title_slug.eq.sams-password-scanner,id.eq.sams-password-scanner")` attempted to match string text against PostgreSQL `UUID` column `id`, throwing syntax error `22P02`.
- **Solution**: Added UUID regex check `/^[0-9a-f]{8}-.../i`. If slug is text, query `.eq('title_slug', currentSlug)`. Added fallback to backend API and graceful default state.

### 8. Empty `stdin` Division-by-Zero (`SIGFPE`) Runtime Error in C++
- **User Problem**: C++ solution for rice bag question gave `💥 RUNTIME ERROR` on Judge0 sandbox.
- **Root Cause**: If a question had testcases with `is_hidden = true`, `sampleCases` evaluated to `[]` and sent `stdin = ""`. In C++, `cin >> N >> k1 >> k2` failed, `k1 + k2` remained `0`, and `N / (k1 + k2)` crashed with `SIGFPE` (division by zero).
- **Solution**: Updated `processTestcaseLists` to fallback `sampleCases` to `allTestcases[0]`. Added explicit check in `handleRunCode` to prevent running against empty stdin.

### 9. Public Judge0 Cloudflare HTTP Status 530 Rate Limiting
- **User Problem**: Judge0 sandbox returned `Judge0 API Returned HTTP Status 530` / Cloudflare error response.
- **Root Cause**: Public demo host `https://ce.judge0.com` is rate-limited by Cloudflare edge proxy during traffic spikes on unauthenticated POST calls.
- **Solution**:
  1. Built local subprocess execution engine in FastAPI (`Judge0Service`) for Python 3 and JavaScript (Node.js) so local evaluation succeeds seamlessly during 530 outages.
  2. Formatted explicit Cloudflare 530 diagnostic notice instructing user how to configure `JUDGE0_API_KEY` for RapidAPI access when running C++/Java.

---

## 🚫 CRITICAL RULES: WHAT NOT TO DO

1. **NEVER add static problem placeholder arrays (`BASELINE_PROBLEMS` or `INITIAL_PROBLEMS`)** back into frontend components. All data must load exclusively from Supabase DB or backend API.
2. **NEVER pass non-UUID string slugs into Supabase `.or("id.eq.slug...")` queries**. Always validate UUID format with `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` first to prevent PostgreSQL `22P02` syntax errors.
3. **NEVER run Judge0 execution against `undefined` or `null` testcase inputs**. Always verify `sampleCase.input` is defined before calling `fetch('/execution/run')` to prevent C++ `SIGFPE` division-by-zero crashes.
4. **NEVER overwrite user code when fixing execution handlers**. Preserve Monaco editor contents and language selection.
5. **NEVER return `None` or `null` for `execution_time_ms` or `memory_kb`** in FastAPI response models. Always default to `0` integer values.
