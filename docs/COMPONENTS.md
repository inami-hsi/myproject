# TaskFlow Component Reference

All components are React client components (`"use client"`) using TypeScript. Located under `src/components/`.

---

## Layout Components

### Sidebar

**File:** `src/components/layout/Sidebar.tsx`

App-wide navigation sidebar with logo, dashboard link, project list, and settings.

```tsx
interface SidebarProps {
  onNavigate?: () => void;  // Called after any navigation click (used to close mobile sidebar)
}
```

- Fetches projects from `projectStore` on mount
- Highlights active project based on URL params
- Shows project color dot and task count

### Header

**File:** `src/components/layout/Header.tsx`

Top bar with hamburger menu (mobile), search input, theme toggle, and user dropdown.

```tsx
interface HeaderProps {
  onMenuClick: () => void;  // Toggle mobile sidebar
}
```

- Search input bound to `uiStore.searchQuery`
- User dropdown with Profile, Settings, Log out items

### ThemeToggle

**File:** `src/components/layout/ThemeToggle.tsx`

Dark/light mode toggle button using `next-themes`.

No props. Uses `useTheme()` hook internally.

---

## Project Components

### ProjectList

**File:** `src/components/project/ProjectList.tsx`

Grid of project cards linking to their detail pages.

```tsx
interface ProjectListProps {
  projects: Project[];
}
```

Renders a responsive grid (`sm:grid-cols-2 lg:grid-cols-3`). Each card shows project color, name, description, task count, and archived badge.

### ProjectForm

**File:** `src/components/project/ProjectForm.tsx`

Dialog content for creating a new project.

```tsx
interface ProjectFormProps {
  onSuccess: () => void;  // Called after successful creation (to close dialog)
}
```

Fields: name (required), description (optional), color (8 preset swatches). Uses `projectStore.createProject`.

### ProjectSidebar

**File:** `src/components/project/ProjectSidebar.tsx`

Stats panel shown alongside the main project view. Displays project info, completion progress, status breakdown, priority breakdown, and recent activity.

```tsx
interface ProjectSidebarProps {
  project: Project | null;
  tasks: Task[];
}
```

All stats are computed client-side with `useMemo`.

### MilestoneManager

**File:** `src/components/project/MilestoneManager.tsx`

Panel for listing, creating, and deleting milestones within a project.

```tsx
interface MilestoneManagerProps {
  projectId: string;
}
```

- Uses `useMilestones` hook for data fetching and mutations
- Add form with name, date picker, and 8-color palette
- Delete with confirmation (click twice)

### TagManager

**File:** `src/components/project/TagManager.tsx`

Panel for listing and creating tags. Tags are global (not project-scoped).

```tsx
interface TagManagerProps {
  projectId: string;
}
```

- Fetches tags from `/api/tags` on mount
- Add form with name and 8-color palette
- Tags displayed as colored chips

---

## Task Components

### TaskForm

**File:** `src/components/task/TaskForm.tsx`

Dialog content for creating or editing a task.

```tsx
interface TaskFormProps {
  projectId: string;
  task?: Task;          // If provided, form is in edit mode
  onSuccess?: () => void;
}
```

Fields: title, description, status (select), priority (select), start date, end date, due date. Uses `taskStore.createTask` or `taskStore.updateTask`.

### TaskDetail

**File:** `src/components/task/TaskDetail.tsx`

Side sheet with full task details and inline editing capabilities.

```tsx
interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}
```

Features:
- Click-to-edit on title, description, status, priority, and all date fields
- Progress slider (0-100%, step 5) with immediate save on commit
- Tag display
- Dependency list (predecessor and successor tasks with type badges)
- Comment thread with add form (Enter to submit)
- Created/updated timestamps

### TaskCard

**File:** `src/components/task/TaskCard.tsx`

Reusable card component displaying task summary. Clicking opens the task detail sheet.

```tsx
interface TaskCardProps {
  task: Task;
  compact?: boolean;  // Reduces padding when true
}
```

Shows: title (strikethrough when done), status/priority badges, progress bar, due date (red when overdue), date range, tags.

### TaskFilters

**File:** `src/components/task/TaskFilters.tsx`

Horizontal filter bar for status and priority. Bound to `uiStore`.

No props. Reads/writes `filterStatus` and `filterPriority` from `uiStore`. Shows active filter count and a clear button.

### CommentList

**File:** `src/components/task/CommentList.tsx`

Standalone comment thread component with fetch, display, and add functionality.

```tsx
interface CommentListProps {
  taskId: string;
}
```

- Fetches comments from `/api/tasks/:id/comments` on mount
- Shows user avatar initial, name, relative timestamp (date-fns)
- Add form with Ctrl+Enter submit shortcut

---

## Gantt Components

### GanttChart

**File:** `src/components/gantt/GanttChart.tsx`

Main Gantt chart container. Manages time scale, scroll state, and coordinates all sub-components.

```tsx
interface GanttChartProps {
  tasks: Task[];
  milestones: Milestone[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (id: string, updates: { startDate?: string; endDate?: string }) => void;
}
```

Structure:
- Toolbar: Day/Week/Month scale buttons, "Today" scroll button
- Left sidebar (250px): Task list with status dots, milestone rows
- Right panel: Scrollable SVG area with timeline header, grid lines, weekend shading, today line, dependency arrows, task bars, milestones

### GanttBar

**File:** `src/components/gantt/GanttBar.tsx`

SVG group rendering a single task bar with drag, resize, and tooltip support.

```tsx
interface GanttBarProps {
  task: Task;
  x: number;            // Bar x position in pixels
  width: number;         // Bar width in pixels
  y: number;             // Row y position in pixels
  height?: number;       // Bar height, default 28px
  dayWidth: number;      // Pixels per day (for snap calculations)
  onClick: () => void;
  onDragEnd?: (deltaDays: number) => void;    // Called with day offset after drag
  onResizeEnd?: (deltaDays: number) => void;  // Called with day offset after resize
}
```

Rendering details:
- Background fill with rounded corners (color by status)
- Progress overlay fill with darker color
- Text label (truncated if bar is narrow, hidden if < 60px)
- Right-edge resize handle (6px wide, cursor: ew-resize)
- Hover tooltip showing title, date range, and progress

### GanttTimeline

**File:** `src/components/gantt/GanttTimeline.tsx`

SVG timeline header rendered as a sticky element above the chart area.

```tsx
interface GanttTimelineProps {
  startDate: Date;
  endDate: Date;
  timeScale: TimeScale;  // "day" | "week" | "month"
  dayWidth: number;
}
```

Two-row layout:
- Top row (24px): Month labels (day/week view) or year labels (month view)
- Bottom row (28px): Day numbers, week numbers (`W1`, `W2`...), or month numbers

Weekend cells are visually distinguished in day view.

### GanttDependencyArrow

**File:** `src/components/gantt/GanttDependencyArrow.tsx`

SVG path and arrowhead connecting two task bars.

```tsx
interface GanttDependencyArrowProps {
  fromTask: { x: number; y: number; width: number };
  toTask: { x: number; y: number; width: number };
  type: DependencyType;  // "FS" | "SS" | "FF" | "SF"
}
```

- Renders right-angle connector paths (not straight lines)
- Arrowhead direction depends on type: FS/SS point right at target start, FF/SF point left at target end
- Highlights to terracotta on hover
- Wider invisible hit area (8px stroke) for easier hover targeting

### GanttMilestone

**File:** `src/components/gantt/GanttMilestone.tsx`

SVG diamond shape marking a milestone on the timeline.

```tsx
interface GanttMilestoneProps {
  milestone: Milestone;
  x: number;
  y: number;
  onClick: () => void;
}
```

- Diamond shape (rotated square, 12px)
- Text label to the right
- Hover tooltip with name and formatted date
- Color from milestone data (default `#8b7ec8`)

---

## Kanban Components

### KanbanColumn

**File:** `src/components/kanban/KanbanColumn.tsx`

A single status column in the Kanban board. Acts as a droppable zone via dnd-kit.

```tsx
interface KanbanColumnProps {
  status: TaskStatus;        // "TODO" | "IN_PROGRESS" | "DONE" | "ON_HOLD"
  tasks: Task[];             // Tasks filtered to this status
  onTaskClick: (task: Task) => void;
}
```

- Header with colored status dot, label, and task count badge
- Scrollable task list using `SortableContext` (vertical list strategy)
- "Add task" button shown for TODO and IN_PROGRESS columns
- Visual feedback (ring highlight) when drag is over the column

### KanbanCard

**File:** `src/components/kanban/KanbanCard.tsx`

A sortable task card within a Kanban column. Uses dnd-kit `useSortable`.

```tsx
interface KanbanCardProps {
  task: Task;
  onClick: () => void;
}
```

- Tag dots (max 3, with "+N" overflow)
- Title (2-line clamp)
- Priority badge with icon for CRITICAL
- Due date with overdue highlighting
- Progress bar (shown when progress > 0)
- Drag visual: opacity 50%, slight rotation and scale

---

## Calendar Component

### CalendarView

**File:** `src/components/calendar/CalendarView.tsx`

Month/week calendar grid showing tasks by due date.

No props. Reads tasks from `taskStore` and UI state from `uiStore` internally.

Features:
- Month/week mode toggle
- Previous/next navigation and "Today" button
- 7-column grid with weekday headers
- Day cells show up to 3 task chips (month) or 8 (week), with "+N more" overflow
- Task chips show priority color dot and truncated title
- Clicking a date opens a detail panel at the bottom
- Clicking a task chip opens the task detail sheet
- Current day highlighted, non-current-month days dimmed

---

## List Component

### ListView

**File:** `src/components/list/ListView.tsx`

Sortable table view of all tasks in the current project.

No props. Reads tasks from `taskStore` internally.

Columns:
- Title (sortable, flexible width)
- Status (sortable, badge)
- Priority (sortable, badge)
- Due Date (sortable, red when overdue)
- Progress (sortable, mini progress bar + percentage)
- Tags (not sortable, colored chips)

Sort behavior: Click column header to sort ascending; click again to toggle descending. Default sort: priority ascending.

---

## UI Components (shadcn/ui)

All located in `src/components/ui/`. These are standard shadcn/ui components built on Radix UI primitives with Tailwind styling. See the [shadcn/ui docs](https://ui.shadcn.com/) for detailed API reference.

| Component | File | Radix Primitive |
|-----------|------|-----------------|
| Button | `button.tsx` | Slot |
| Card | `card.tsx` | - (div) |
| Dialog | `dialog.tsx` | Dialog |
| Input | `input.tsx` | - (input) |
| Label | `label.tsx` | Label |
| Select | `select.tsx` | Select |
| Badge | `badge.tsx` | - (div) |
| Tooltip | `tooltip.tsx` | Tooltip |
| Slider | `slider.tsx` | Slider |
| Separator | `separator.tsx` | Separator |
| Tabs | `tabs.tsx` | Tabs |
| DropdownMenu | `dropdown-menu.tsx` | DropdownMenu |
| ScrollArea | `scroll-area.tsx` | ScrollArea |
| Progress | `progress.tsx` | - (div) |
| Textarea | `textarea.tsx` | - (textarea) |
| Sheet | `sheet.tsx` | Dialog (as sheet) |

---

## Custom Hooks

### useGantt

**File:** `src/hooks/useGantt.ts`

Computes all layout data needed to render the Gantt chart.

```tsx
function useGantt(
  tasks: Task[],
  milestones: Milestone[],
  timeScale: TimeScale
): UseGanttReturn;

interface UseGanttReturn {
  timelineStart: Date;
  timelineEnd: Date;
  dayWidth: number;
  totalWidth: number;
  totalHeight: number;
  taskBars: Array<{ task: Task; x: number; width: number; y: number }>;
  milestoneMarkers: Array<{ milestone: Milestone; x: number; y: number }>;
  todayX: number;
  getDateFromX: (x: number) => Date;
  getXFromDate: (date: Date) => number;
}
```

Key behaviors:
- Timeline range auto-computed from task/milestone dates with 7-day padding
- Row height: 40px per task, milestones placed after all tasks
- Day width varies by scale: day=40px, week=60/7px, month=80/30px
- Tasks without dates get `x=0, width=0` (not rendered by GanttBar)

### useMilestones

**File:** `src/hooks/useMilestones.ts`

Manages milestone CRUD with local React state (not Zustand).

```tsx
function useMilestones(projectId: string | null): {
  milestones: Milestone[];
  loading: boolean;
  fetchMilestones: () => Promise<void>;
  createMilestone: (input: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestone: (id: string, input: Partial<Omit<CreateMilestoneInput, "projectId">>) => Promise<Milestone>;
  deleteMilestone: (id: string) => Promise<void>;
};
```

Auto-fetches milestones when `projectId` changes. All mutations update local state optimistically after successful API response.
