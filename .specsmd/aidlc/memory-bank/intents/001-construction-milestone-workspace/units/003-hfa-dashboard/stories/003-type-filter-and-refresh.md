---
id: 003-type-filter-and-refresh
unit: 003-hfa-dashboard
intent: 001-construction-milestone-workspace
status: draft
priority: must
created: 2026-06-24T00:00:00Z
assigned_bolt: null
implemented: false
---

# Story: 003-type-filter-and-refresh

## User Story
**As an** HFA staff member
**I want** to filter the case list by case type and pull down to refresh
**So that** I can focus on a specific category of work and ensure I am viewing the latest data

## Acceptance Criteria
- [ ] **Given** the dashboard is loaded, **When** the chip strip renders, **Then** four chips are shown in order: "All", "Loan", "Inspection", "Application"; "All" is selected by default
- [ ] **Given** a type chip is tapped, **When** the active filter signal updates, **Then** the case list re-renders showing only cases whose `type` matches the selected value; "All" shows every case
- [ ] **Given** a filter is active and the user pulls down to refresh, **When** the pull-to-refresh completes, **Then** the data is re-fetched from Supabase and the active filter is re-applied to the fresh data
- [ ] **Given** a filter is applied and the user navigates to a case then returns, **When** the dashboard view re-activates, **Then** the previously selected filter chip is still active
- [ ] **Given** the filtered list is empty (no cases of the selected type), **When** the list renders, **Then** an empty state message "No {type} cases" is shown

## Technical Notes
- `activeFilter = signal<'all' | 'loan' | 'inspection' | 'application'>('all')`
- Filtered list derived with `filteredCases = computed(() => activeFilter() === 'all' ? cases() : cases().filter(c => c.type === activeFilter()))`
- Chip strip is a row of `IonChip` elements; `[class.chip--active]` bound to `activeFilter() === type`
- `IonRefresher` with `(ionRefresh)` event handler: calls `CaseService.getHfaCases(hfaId)`, sets result into `cases` signal, then calls `event.target.complete()`
- Filter state retained in the component signal (not URL); signal survives Angular router's component reuse within the same tab

## Dependencies
### Requires
- 001-case-list-screen

### Enables
- None

## Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| New case of filtered type is added by another user | Visible only after manual pull-to-refresh (no live push on dashboard for v1) |
| Pull-to-refresh fails (network error) | `IonRefresher` completes with an error toast; existing case data remains unchanged |
| User rapidly taps different filter chips | Each tap updates the signal; `computed` re-evaluates; no debounce needed |
| All cases are of one type | Tapping the other type chips shows empty state correctly |

## Out of Scope
- Saving filter preference across app restarts
- Multi-select type filtering
- Sorting cases by column (e.g., by overdue status)
- Server-side filtering (all filtering is client-side against already-loaded data)
