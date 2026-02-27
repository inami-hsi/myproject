# TaskFlow API Reference

Base URL: `/api`

All endpoints use JSON request/response bodies. Authentication is handled via a demo user system (cookie-based `userId`). Request validation uses Zod schemas; validation errors return HTTP 400 with details.

---

## Common Error Response

All endpoints return errors in this format:

```json
{
  "error": "Human-readable error message",
  "details": { }  // optional, present on validation errors
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error or missing required parameter |
| 404 | Resource not found or not owned by current user |
| 409 | Conflict (e.g. duplicate tag name) |
| 500 | Internal server error |

---

## Projects

### GET /api/projects

List all projects for the current user.

**Response:** `200 OK`

```json
[
  {
    "id": "clx...",
    "name": "My Project",
    "description": "Optional description",
    "color": "#e07a5f",
    "archived": false,
    "userId": "clx...",
    "_count": { "tasks": 12 },
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T12:00:00.000Z"
  }
]
```

Projects are ordered by `updatedAt` descending.

---

### POST /api/projects

Create a new project.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | min 1 character |
| `description` | string | No | |
| `color` | string | No | Hex color `#RRGGBB` format. Defaults to `#e07a5f` |

**Example Request:**

```json
{
  "name": "Sprint 4",
  "description": "Q1 feature work",
  "color": "#6d8b74"
}
```

**Response:** `201 Created`

```json
{
  "id": "clx...",
  "name": "Sprint 4",
  "description": "Q1 feature work",
  "color": "#6d8b74",
  "archived": false,
  "userId": "clx...",
  "_count": { "tasks": 0 },
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T10:00:00.000Z"
}
```

---

### GET /api/projects/:id

Get a single project with all its tasks and milestones.

**Response:** `200 OK`

```json
{
  "id": "clx...",
  "name": "Sprint 4",
  "description": "Q1 feature work",
  "color": "#6d8b74",
  "archived": false,
  "userId": "clx...",
  "tasks": [
    {
      "id": "clx...",
      "title": "Implement login",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 50,
      "startDate": "2026-02-20T00:00:00.000Z",
      "endDate": "2026-02-28T00:00:00.000Z",
      "dueDate": "2026-02-28T00:00:00.000Z",
      "sortOrder": 1,
      "tags": [
        { "taskId": "clx...", "tagId": "clx...", "tag": { "id": "clx...", "name": "frontend", "color": "#6a9bcc" } }
      ],
      "dependencies": [],
      "dependents": []
    }
  ],
  "milestones": [
    {
      "id": "clx...",
      "name": "Beta Release",
      "date": "2026-03-15T00:00:00.000Z",
      "color": "#8b7ec8"
    }
  ],
  "_count": { "tasks": 1 },
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T12:00:00.000Z"
}
```

Tasks are ordered by `sortOrder` ascending. Milestones are ordered by `date` ascending.

**Errors:** `404` if project not found or not owned by user.

---

### PUT /api/projects/:id

Update a project.

**Request Body (all fields optional):**

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | min 1 character |
| `description` | string \| null | |
| `color` | string | Hex color `#RRGGBB` |
| `archived` | boolean | |

**Response:** `200 OK` -- updated project object with `_count`.

**Errors:** `404` if not found, `400` if validation fails.

---

### DELETE /api/projects/:id

Delete a project and all associated tasks/milestones (cascade).

**Response:** `200 OK`

```json
{ "success": true }
```

**Errors:** `404` if not found.

---

## Tasks

### GET /api/tasks?projectId=:projectId

List all tasks for a project.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | The project to fetch tasks for |

**Response:** `200 OK`

Returns an array of Task objects, each including `tags` (with nested `tag`), `dependencies`, and `dependents`. Ordered by `sortOrder` ascending.

**Errors:** `400` if `projectId` is missing, `404` if project not found.

---

### POST /api/tasks

Create a new task.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | min 1 character |
| `description` | string | No | |
| `status` | enum | No | `TODO` \| `IN_PROGRESS` \| `DONE` \| `ON_HOLD`. Defaults to `TODO` |
| `priority` | enum | No | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW`. Defaults to `MEDIUM` |
| `startDate` | string | No | ISO 8601 datetime |
| `endDate` | string | No | ISO 8601 datetime |
| `dueDate` | string | No | ISO 8601 datetime |
| `projectId` | string | Yes | Target project ID |
| `parentId` | string | No | Parent task ID (for subtasks) |
| `tagIds` | string[] | No | Array of tag IDs to associate |

**Example Request:**

```json
{
  "title": "Design login page",
  "description": "Create mockups for the login flow",
  "status": "TODO",
  "priority": "HIGH",
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-03-05T00:00:00.000Z",
  "projectId": "clx...",
  "tagIds": ["clx..."]
}
```

**Response:** `201 Created` -- created Task object with tags, dependencies, and dependents.

The `sortOrder` is auto-assigned (max existing sortOrder + 1). The current user is auto-assigned as the assignee.

---

### GET /api/tasks/:id

Get a single task with tags, comments (with user), dependencies, and dependents.

**Response:** `200 OK`

```json
{
  "id": "clx...",
  "title": "Design login page",
  "description": "Create mockups",
  "status": "TODO",
  "priority": "HIGH",
  "progress": 0,
  "startDate": "2026-03-01T00:00:00.000Z",
  "endDate": "2026-03-05T00:00:00.000Z",
  "dueDate": null,
  "sortOrder": 1,
  "projectId": "clx...",
  "assigneeId": "clx...",
  "parentId": null,
  "tags": [],
  "comments": [
    {
      "id": "clx...",
      "content": "Started working on this",
      "taskId": "clx...",
      "userId": "clx...",
      "user": { "id": "clx...", "email": "demo@taskflow.local", "name": "Demo User", "avatar": null, "cognitoId": "demo-cognito-id" },
      "createdAt": "2026-02-27T14:00:00.000Z",
      "updatedAt": "2026-02-27T14:00:00.000Z"
    }
  ],
  "dependencies": [],
  "dependents": [],
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T12:00:00.000Z"
}
```

Comments are ordered by `createdAt` descending.

**Errors:** `404` if task not found.

---

### PUT /api/tasks/:id

Update a task. All fields are optional.

**Request Body:**

| Field | Type | Validation |
|-------|------|------------|
| `title` | string | min 1 character |
| `description` | string \| null | |
| `status` | enum | `TODO` \| `IN_PROGRESS` \| `DONE` \| `ON_HOLD` |
| `priority` | enum | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW` |
| `progress` | number | 0-100 |
| `startDate` | string \| null | ISO 8601 datetime |
| `endDate` | string \| null | ISO 8601 datetime |
| `dueDate` | string \| null | ISO 8601 datetime |
| `sortOrder` | integer | |
| `projectId` | string | |
| `parentId` | string \| null | |
| `tagIds` | string[] | Replaces all existing tag associations |

When `tagIds` is provided, all existing tag associations are removed and replaced with the new set.

**Response:** `200 OK` -- updated Task object.

**Errors:** `404` if not found, `400` if validation fails.

---

### DELETE /api/tasks/:id

Delete a task. Cascade-deletes associated tags, comments, and dependency records.

**Response:** `200 OK`

```json
{ "success": true }
```

**Errors:** `404` if not found.

---

## Comments

### GET /api/tasks/:id/comments

List all comments for a task.

**Response:** `200 OK`

```json
[
  {
    "id": "clx...",
    "content": "Looks good!",
    "taskId": "clx...",
    "userId": "clx...",
    "user": { "id": "clx...", "email": "demo@taskflow.local", "name": "Demo User", "avatar": null, "cognitoId": "..." },
    "createdAt": "2026-02-27T14:00:00.000Z",
    "updatedAt": "2026-02-27T14:00:00.000Z"
  }
]
```

Comments are ordered by `createdAt` descending.

**Errors:** `404` if task not found.

---

### POST /api/tasks/:id/comments

Add a comment to a task.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `content` | string | Yes | min 1 character |

**Example Request:**

```json
{
  "content": "This task is blocked by the API changes."
}
```

**Response:** `201 Created`

```json
{
  "id": "clx...",
  "content": "This task is blocked by the API changes.",
  "taskId": "clx...",
  "userId": "clx...",
  "user": { "id": "clx...", "email": "demo@taskflow.local", "name": "Demo User", "avatar": null, "cognitoId": "..." },
  "createdAt": "2026-02-27T14:30:00.000Z",
  "updatedAt": "2026-02-27T14:30:00.000Z"
}
```

**Errors:** `404` if task not found, `400` if validation fails.

---

## Milestones

### GET /api/milestones?projectId=:projectId

List all milestones for a project.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `projectId` | string | Yes | The project to fetch milestones for |

**Response:** `200 OK`

```json
[
  {
    "id": "clx...",
    "name": "Beta Release",
    "date": "2026-03-15T00:00:00.000Z",
    "color": "#8b7ec8",
    "projectId": "clx...",
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
]
```

Milestones are ordered by `date` ascending.

**Errors:** `400` if `projectId` is missing, `404` if project not found.

---

### POST /api/milestones

Create a new milestone.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | min 1 character |
| `date` | string | Yes | ISO 8601 datetime |
| `color` | string | No | Hex color `#RRGGBB`. Defaults to `#8b7ec8` |
| `projectId` | string | Yes | Target project ID |

**Example Request:**

```json
{
  "name": "v1.0 Release",
  "date": "2026-04-01T00:00:00.000Z",
  "color": "#6d8b74",
  "projectId": "clx..."
}
```

**Response:** `201 Created` -- created Milestone object.

---

### PUT /api/milestones/:id

Update a milestone.

**Request Body (all fields optional):**

| Field | Type | Validation |
|-------|------|------------|
| `name` | string | min 1 character |
| `date` | string | ISO 8601 datetime |
| `color` | string | Hex color `#RRGGBB` |

**Response:** `200 OK` -- updated Milestone object.

**Errors:** `404` if not found, `400` if validation fails.

---

### DELETE /api/milestones/:id

Delete a milestone.

**Response:** `200 OK`

```json
{ "success": true }
```

**Errors:** `404` if not found.

---

## Tags

### GET /api/tags

List all tags (global, not project-scoped).

**Response:** `200 OK`

```json
[
  {
    "id": "clx...",
    "name": "frontend",
    "color": "#6a9bcc"
  }
]
```

Tags are ordered by `name` ascending.

---

### POST /api/tags

Create a new tag.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | min 1 character, must be unique |
| `color` | string | No | Hex color `#RRGGBB`. Defaults to `#9ca3af` |

**Example Request:**

```json
{
  "name": "design",
  "color": "#d97757"
}
```

**Response:** `201 Created` -- created Tag object.

**Errors:** `409` if a tag with the same name already exists.

---

## Enums Reference

### TaskStatus

| Value | Label |
|-------|-------|
| `TODO` | Not Started |
| `IN_PROGRESS` | In Progress |
| `DONE` | Done |
| `ON_HOLD` | On Hold |

### Priority

| Value | Label |
|-------|-------|
| `CRITICAL` | Critical |
| `HIGH` | High |
| `MEDIUM` | Medium |
| `LOW` | Low |

### DependencyType

| Value | Description |
|-------|-------------|
| `FS` | Finish-to-Start (default) |
| `SS` | Start-to-Start |
| `FF` | Finish-to-Finish |
| `SF` | Start-to-Finish |
