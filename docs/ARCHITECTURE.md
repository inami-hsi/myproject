# TaskFlow Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2+ |
| Language | TypeScript | 5.6+ |
| Database | PostgreSQL | via Prisma |
| ORM | Prisma | 6.0+ |
| State Management | Zustand | 5.0+ |
| UI Components | shadcn/ui (Radix UI primitives) | - |
| Styling | Tailwind CSS | 3.4+ |
| Drag & Drop | dnd-kit | 6.1+ |
| Date Utilities | date-fns | 4.1+ |
| Animation | motion (Framer Motion) | 11.15+ |
| Icons | lucide-react | 0.460+ |
| Validation | Zod | 3.23+ |
| Theming | next-themes | 0.4+ |
| Testing | Vitest + Testing Library | - |
| E2E Testing | Playwright | - |

## System Architecture

```
Browser (React SPA)
    |
    |  fetch() calls
    v
Next.js App Router (Server)
    |
    |  Route Handlers (src/app/api/)
    |  Zod validation
    v
Prisma ORM
    |
    v
PostgreSQL (DATABASE_URL)
```

All API communication uses standard `fetch()` from client-side Zustand stores. There is no server-side rendering of data-dependent pages -- pages are client components that fetch data on mount via store actions.

## Directory Structure

```
src/
  app/
    (auth)/
      login/page.tsx            # Login page (unauthenticated)
    (dashboard)/
      layout.tsx                # Dashboard layout (sidebar + header + main)
      page.tsx                  # Dashboard home (project list)
      projects/
        [projectId]/page.tsx    # Project detail (gantt/kanban/calendar/list views)
    api/
      projects/
        route.ts                # GET (list), POST (create)
        [id]/route.ts           # GET (detail), PUT (update), DELETE
      tasks/
        route.ts                # GET (list by projectId), POST (create)
        [id]/
          route.ts              # GET (detail), PUT (update), DELETE
          comments/route.ts     # GET (list), POST (create)
      milestones/
        route.ts                # GET (list by projectId), POST (create)
        [id]/route.ts           # PUT (update), DELETE
      tags/
        route.ts                # GET (list all), POST (create)
    layout.tsx                  # Root layout (ThemeProvider, fonts)
    page.tsx                    # Root redirect

  components/
    gantt/                      # Gantt chart components (SVG-based)
      GanttChart.tsx            # Main chart container
      GanttBar.tsx              # Individual task bar (drag + resize)
      GanttTimeline.tsx         # Timeline header (day/week/month)
      GanttDependencyArrow.tsx  # SVG dependency arrows (FS/SS/FF/SF)
      GanttMilestone.tsx        # Diamond milestone marker
    kanban/                     # Kanban board components
      KanbanColumn.tsx          # Status column with droppable zone
      KanbanCard.tsx            # Sortable task card
    calendar/
      CalendarView.tsx          # Month/week calendar grid
    list/
      ListView.tsx              # Sortable table view
    task/                       # Task-related components
      TaskForm.tsx              # Create/edit task dialog
      TaskDetail.tsx            # Task detail sheet (inline editing)
      TaskCard.tsx              # Reusable task card
      TaskFilters.tsx           # Status/priority filter bar
      CommentList.tsx           # Comment thread with add form
    project/                    # Project-related components
      ProjectList.tsx           # Project card grid
      ProjectForm.tsx           # Create project dialog
      ProjectSidebar.tsx        # Project stats panel
      MilestoneManager.tsx      # Milestone CRUD panel
      TagManager.tsx            # Tag CRUD panel
    layout/                     # Layout components
      Sidebar.tsx               # App sidebar (logo + nav + project list)
      Header.tsx                # Top bar (search + theme toggle + user menu)
      ThemeToggle.tsx           # Dark/light mode toggle
    ui/                         # shadcn/ui primitives
      button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx,
      select.tsx, badge.tsx, tooltip.tsx, slider.tsx, separator.tsx,
      tabs.tsx, dropdown-menu.tsx, scroll-area.tsx, progress.tsx,
      textarea.tsx, sheet.tsx

  hooks/
    useGantt.ts                 # Gantt chart layout calculations
    useMilestones.ts            # Milestone CRUD with local state
    useProjects.ts              # Project-related hooks
    useTasks.ts                 # Task-related hooks

  stores/
    projectStore.ts             # Project CRUD + current project
    taskStore.ts                # Task CRUD + selected task + reorder
    uiStore.ts                  # View mode, time scale, sidebar, filters

  lib/
    prisma.ts                   # Singleton Prisma client
    auth.ts                     # Auth utilities (getCurrentUser, getOrCreateDemoUser)
    utils.ts                    # cn(), formatDate(), date math, status/priority labels & colors

  types/
    index.ts                    # All TypeScript interfaces and type aliases

prisma/
  schema.prisma                 # Database schema (8 models, 3 enums)
```

## Data Flow

### Read Path

```
Component mount
    |
    v
Zustand store action (e.g. fetchTasks)
    |
    | fetch("/api/tasks?projectId=...")
    v
Next.js API Route Handler
    |
    | getOrCreateDemoUser() -- auth check
    | Zod schema validation (for writes)
    | prisma.task.findMany(...)
    v
PostgreSQL
    |
    | query result
    v
API Route returns NextResponse.json(data)
    |
    v
Store updates state: set({ tasks: data })
    |
    v
React re-renders subscribed components
```

### Write Path

```
User interaction (form submit, drag-end, inline edit)
    |
    v
Zustand store action (e.g. updateTask)
    |
    | fetch("/api/tasks/:id", { method: "PUT", body: JSON })
    v
API Route Handler
    |
    | Zod validation of request body
    | Ownership check (findFirst with userId)
    | prisma.task.update(...)
    v
PostgreSQL
    |
    v
API Route returns updated object
    |
    v
Store performs optimistic-like update:
    set({ tasks: tasks.map(t => t.id === id ? updated : t) })
    |
    v
React re-renders
```

## State Management

Three Zustand stores manage all client-side state:

### projectStore

| State | Type | Description |
|-------|------|-------------|
| `projects` | `Project[]` | All user projects |
| `currentProject` | `Project \| null` | Currently viewed project (with tasks/milestones) |
| `loading` | `boolean` | Fetch in progress |

Actions: `fetchProjects`, `fetchProject`, `createProject`, `updateProject`, `deleteProject`, `setCurrentProject`

### taskStore

| State | Type | Description |
|-------|------|-------------|
| `tasks` | `Task[]` | Tasks for the current project |
| `selectedTask` | `Task \| null` | Task shown in detail panel |
| `loading` | `boolean` | Fetch in progress |

Actions: `fetchTasks`, `createTask`, `updateTask`, `deleteTask`, `setSelectedTask`, `reorderTasks`

### uiStore

| State | Type | Default | Description |
|-------|------|---------|-------------|
| `viewMode` | `ViewMode` | `"gantt"` | Active view tab |
| `timeScale` | `TimeScale` | `"week"` | Gantt time scale |
| `sidebarOpen` | `boolean` | `true` | Sidebar visibility |
| `taskDetailOpen` | `boolean` | `false` | Task detail sheet open |
| `searchQuery` | `string` | `""` | Global search text |
| `filterStatus` | `string[]` | `[]` | Active status filters |
| `filterPriority` | `string[]` | `[]` | Active priority filters |

All stores use the `create` function from Zustand with no middleware. State updates happen after successful API responses (not optimistic).

## Database Schema

8 models, 3 enums. See `/prisma/schema.prisma` for the full schema.

### Entity Relationships

```
User 1---* Project
User 1---* Task (as assignee)
User 1---* Comment

Project 1---* Task
Project 1---* Milestone

Task 1---* Task (self-referential: parent/subtasks)
Task *---* Tag (through TagOnTask join table)
Task 1---* Comment
Task 1---* TaskDependency (as dependent)
Task 1---* TaskDependency (as dependency)
```

### Key Design Decisions

- **CUID IDs**: All models use `@default(cuid())` for globally unique, URL-safe identifiers.
- **Cascade deletes**: Deleting a Project cascades to its Tasks and Milestones. Deleting a Task cascades to its TagOnTask, Comment, and TaskDependency records.
- **Unique constraints**: User.email, User.cognitoId, Tag.name, TaskDependency[dependentId+dependencyId].
- **Sort order**: Tasks have an explicit `sortOrder` integer field for manual ordering.
- **Dependency types**: The `DependencyType` enum supports all four standard scheduling relationships (FS, SS, FF, SF).

## Component Hierarchy

```
RootLayout
  ThemeProvider (next-themes)
    (auth)/login/page.tsx
    (dashboard)/layout.tsx
      Sidebar
      Header
      Main Content Area
        Dashboard (page.tsx)
          ProjectList > ProjectCard
          Dialog > ProjectForm
        Project Detail ([projectId]/page.tsx)
          ViewModeTabs (gantt | kanban | calendar | list)
          TaskFilters
          GanttChart
            GanttTimeline
            GanttBar (per task, SVG)
            GanttDependencyArrow (per dependency, SVG)
            GanttMilestone (per milestone, SVG)
          KanbanBoard (DndContext)
            KanbanColumn (per status)
              KanbanCard (per task, sortable)
          CalendarView
          ListView
          Sheet > TaskDetail
          Dialog > TaskForm
          ProjectSidebar
            MilestoneManager
            TagManager
```

## Gantt Chart Rendering

The Gantt chart uses a custom SVG rendering approach (no third-party Gantt library):

1. **`useGantt` hook** computes layout data from tasks and milestones:
   - `timelineStart` / `timelineEnd` -- date range with 7-day padding
   - `dayWidth` -- pixel width per day based on time scale (day=40px, week=60/7px, month=80/30px)
   - `taskBars` -- array of `{ task, x, width, y }` for positioning
   - `milestoneMarkers` -- array of `{ milestone, x, y }`
   - `todayX` -- x-coordinate of the today line
   - `getXFromDate` / `getDateFromX` -- coordinate conversion functions

2. **GanttBar** supports:
   - Drag to reschedule (horizontal move, snaps to day grid)
   - Resize from right edge (changes end date)
   - Progress fill overlay
   - Hover tooltip with title, dates, and progress
   - Click to open task detail

3. **GanttDependencyArrow** renders right-angle connector paths between task bars with arrowheads. Supports all four dependency types (FS, SS, FF, SF).

4. **GanttTimeline** renders a two-row SVG header:
   - Top row: month/year groupings
   - Bottom row: individual day/week/month cells
   - Weekend highlighting in day view

## View Modes

| Mode | Component | Features |
|------|-----------|----------|
| Gantt | `GanttChart` | SVG timeline, task bars with drag/resize, dependency arrows, milestones, today line, day/week/month scale |
| Kanban | `KanbanColumn` + `KanbanCard` | dnd-kit sortable columns by status, drag between columns to change status |
| Calendar | `CalendarView` | Month/week grid, tasks shown on due dates, date-click detail panel |
| List | `ListView` | Sortable table with columns: title, status, priority, due date, progress, tags |

## Authentication

Currently uses a demo user system:

- `getOrCreateDemoUser()` finds or creates a user with email `demo@taskflow.local`
- All API routes call this function to get the current user
- Project queries are scoped to `userId` for data isolation
- Designed to be replaced with CC-Auth (Cognito) integration

## Key Libraries and Patterns

- **Zod schemas** validate all API request bodies at the route handler level
- **Prisma singleton** (`src/lib/prisma.ts`) prevents connection exhaustion in development via `globalThis` caching
- **`cn()` utility** merges Tailwind classes using `clsx` + `tailwind-merge` to avoid conflicts
- **shadcn/ui** provides unstyled Radix UI primitives with Tailwind styling, installed as source files in `src/components/ui/`
- **dnd-kit** handles drag-and-drop in Kanban view with `SortableContext` and `useDroppable`/`useSortable` hooks
- **date-fns** handles date formatting, navigation, and calendar grid generation
- **next-themes** provides system-aware dark mode with localStorage persistence
