import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Recreate the exact Zod schemas from the API route files
// ---------------------------------------------------------------------------

// From: src/app/api/projects/route.ts
const createProjectSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です"),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

// From: src/app/api/tasks/route.ts
const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]);
const priorityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

const createTaskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().min(1, "プロジェクトIDは必須です"),
  parentId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

// From: src/app/api/tags/route.ts
const createTagSchema = z.object({
  name: z.string().min(1, "タグ名は必須です"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

// ---------------------------------------------------------------------------
// createProjectSchema
// ---------------------------------------------------------------------------

describe("createProjectSchema", () => {
  describe("valid inputs", () => {
    it("accepts a minimal valid project (name only)", () => {
      const result = createProjectSchema.safeParse({ name: "My Project" });
      expect(result.success).toBe(true);
    });

    it("accepts a full valid project", () => {
      const result = createProjectSchema.safeParse({
        name: "My Project",
        description: "A description",
        color: "#FF00AA",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project");
        expect(result.data.description).toBe("A description");
        expect(result.data.color).toBe("#FF00AA");
      }
    });

    it("accepts project without optional fields", () => {
      const result = createProjectSchema.safeParse({ name: "Test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
        expect(result.data.color).toBeUndefined();
      }
    });

    it("accepts lowercase hex color", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#abcdef",
      });
      expect(result.success).toBe(true);
    });

    it("accepts uppercase hex color", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#ABCDEF",
      });
      expect(result.success).toBe(true);
    });

    it("accepts mixed case hex color", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#aB12Ef",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("rejects missing name", () => {
      const result = createProjectSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = createProjectSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.name).toBeDefined();
      }
    });

    it("rejects name that is not a string", () => {
      const result = createProjectSchema.safeParse({ name: 123 });
      expect(result.success).toBe(false);
    });

    it("rejects color without # prefix", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "FF0000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects 3-digit hex color", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#FFF",
      });
      expect(result.success).toBe(false);
    });

    it("rejects 8-digit hex color (with alpha)", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#FF0000FF",
      });
      expect(result.success).toBe(false);
    });

    it("rejects color with invalid hex characters", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "#GGHHII",
      });
      expect(result.success).toBe(false);
    });

    it("rejects color that is an empty string", () => {
      const result = createProjectSchema.safeParse({
        name: "P",
        color: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// createTaskSchema
// ---------------------------------------------------------------------------

describe("createTaskSchema", () => {
  const validTask = {
    title: "Implement feature",
    projectId: "proj-123",
  };

  describe("valid inputs", () => {
    it("accepts minimal valid task (title + projectId)", () => {
      const result = createTaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it("accepts a full valid task with all fields", () => {
      const result = createTaskSchema.safeParse({
        title: "Full task",
        description: "Description here",
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: "2026-03-01T00:00:00.000Z",
        endDate: "2026-03-15T00:00:00.000Z",
        dueDate: "2026-03-14T00:00:00.000Z",
        projectId: "proj-abc",
        parentId: "task-parent",
        tagIds: ["tag-1", "tag-2"],
      });
      expect(result.success).toBe(true);
    });

    it("accepts all valid status values", () => {
      for (const status of ["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"]) {
        const result = createTaskSchema.safeParse({
          ...validTask,
          status,
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts all valid priority values", () => {
      for (const priority of ["CRITICAL", "HIGH", "MEDIUM", "LOW"]) {
        const result = createTaskSchema.safeParse({
          ...validTask,
          priority,
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts ISO datetime strings for date fields", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        startDate: "2026-01-15T10:30:00Z",
        endDate: "2026-02-15T23:59:59Z",
        dueDate: "2026-02-14T12:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty tagIds array", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        tagIds: [],
      });
      expect(result.success).toBe(true);
    });

    it("accepts omitted optional fields", () => {
      const result = createTaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
        expect(result.data.status).toBeUndefined();
        expect(result.data.priority).toBeUndefined();
        expect(result.data.startDate).toBeUndefined();
        expect(result.data.endDate).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
        expect(result.data.parentId).toBeUndefined();
        expect(result.data.tagIds).toBeUndefined();
      }
    });
  });

  describe("invalid inputs: missing required fields", () => {
    it("rejects missing title", () => {
      const result = createTaskSchema.safeParse({ projectId: "proj-1" });
      expect(result.success).toBe(false);
    });

    it("rejects empty title", () => {
      const result = createTaskSchema.safeParse({
        title: "",
        projectId: "proj-1",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.title).toBeDefined();
      }
    });

    it("rejects missing projectId", () => {
      const result = createTaskSchema.safeParse({ title: "Task" });
      expect(result.success).toBe(false);
    });

    it("rejects empty projectId", () => {
      const result = createTaskSchema.safeParse({
        title: "Task",
        projectId: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.projectId).toBeDefined();
      }
    });

    it("rejects completely empty input", () => {
      const result = createTaskSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("invalid inputs: wrong enum values", () => {
    it("rejects invalid status", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        status: "PENDING",
      });
      expect(result.success).toBe(false);
    });

    it("rejects lowercase status", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        status: "todo",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid priority", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        priority: "URGENT",
      });
      expect(result.success).toBe(false);
    });

    it("rejects lowercase priority", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        priority: "high",
      });
      expect(result.success).toBe(false);
    });

    it("rejects numeric status", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        status: 1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid inputs: date format", () => {
    it("rejects non-ISO date string for startDate", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        startDate: "2026-03-01",
      });
      expect(result.success).toBe(false);
    });

    it("rejects plain text for endDate", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        endDate: "next week",
      });
      expect(result.success).toBe(false);
    });

    it("rejects date-only format (no time component) for dueDate", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        dueDate: "2026-03-01",
      });
      expect(result.success).toBe(false);
    });

    it("rejects numeric timestamp for startDate", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        startDate: 1709251200000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid inputs: tagIds", () => {
    it("rejects tagIds that is not an array", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        tagIds: "tag-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects tagIds with non-string elements", () => {
      const result = createTaskSchema.safeParse({
        ...validTask,
        tagIds: [1, 2, 3],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("boundary values", () => {
    it("accepts single-character title", () => {
      const result = createTaskSchema.safeParse({
        title: "X",
        projectId: "p",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a very long title", () => {
      const result = createTaskSchema.safeParse({
        title: "A".repeat(1000),
        projectId: "proj-1",
      });
      expect(result.success).toBe(true);
    });

    it("accepts single-character projectId", () => {
      const result = createTaskSchema.safeParse({
        title: "Task",
        projectId: "p",
      });
      expect(result.success).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// taskStatusEnum and priorityEnum (standalone)
// ---------------------------------------------------------------------------

describe("taskStatusEnum", () => {
  it("lists exactly the expected values", () => {
    expect(taskStatusEnum.options).toEqual([
      "TODO",
      "IN_PROGRESS",
      "DONE",
      "ON_HOLD",
    ]);
  });

  it.each(["TODO", "IN_PROGRESS", "DONE", "ON_HOLD"])(
    "accepts %s",
    (value) => {
      expect(taskStatusEnum.safeParse(value).success).toBe(true);
    }
  );

  it.each(["PENDING", "CANCELLED", "todo", "", null, undefined, 0])(
    "rejects %s",
    (value) => {
      expect(taskStatusEnum.safeParse(value).success).toBe(false);
    }
  );
});

describe("priorityEnum", () => {
  it("lists exactly the expected values", () => {
    expect(priorityEnum.options).toEqual([
      "CRITICAL",
      "HIGH",
      "MEDIUM",
      "LOW",
    ]);
  });

  it.each(["CRITICAL", "HIGH", "MEDIUM", "LOW"])("accepts %s", (value) => {
    expect(priorityEnum.safeParse(value).success).toBe(true);
  });

  it.each(["URGENT", "NORMAL", "high", "", null, undefined, 1])(
    "rejects %s",
    (value) => {
      expect(priorityEnum.safeParse(value).success).toBe(false);
    }
  );
});

// ---------------------------------------------------------------------------
// createTagSchema
// ---------------------------------------------------------------------------

describe("createTagSchema", () => {
  describe("valid inputs", () => {
    it("accepts a minimal valid tag (name only)", () => {
      const result = createTagSchema.safeParse({ name: "Bug" });
      expect(result.success).toBe(true);
    });

    it("accepts a tag with color", () => {
      const result = createTagSchema.safeParse({
        name: "Feature",
        color: "#00FF00",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Feature");
        expect(result.data.color).toBe("#00FF00");
      }
    });

    it("accepts single-character name", () => {
      const result = createTagSchema.safeParse({ name: "X" });
      expect(result.success).toBe(true);
    });

    it("accepts a very long name", () => {
      const result = createTagSchema.safeParse({ name: "A".repeat(500) });
      expect(result.success).toBe(true);
    });

    it("accepts name with Unicode characters", () => {
      const result = createTagSchema.safeParse({ name: "バグ修正" });
      expect(result.success).toBe(true);
    });

    it("accepts name with spaces", () => {
      const result = createTagSchema.safeParse({ name: "High Priority" });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid inputs", () => {
    it("rejects missing name", () => {
      const result = createTagSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = createTagSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.name).toBeDefined();
      }
    });

    it("rejects name that is not a string", () => {
      const result = createTagSchema.safeParse({ name: 42 });
      expect(result.success).toBe(false);
    });

    it("rejects color without # prefix", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "FF0000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects 3-digit hex color", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#F00",
      });
      expect(result.success).toBe(false);
    });

    it("rejects 8-digit hex color", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#FF0000FF",
      });
      expect(result.success).toBe(false);
    });

    it("rejects color with invalid characters", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#ZZZZZZ",
      });
      expect(result.success).toBe(false);
    });

    it("rejects rgb() color format", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "rgb(255, 0, 0)",
      });
      expect(result.success).toBe(false);
    });

    it("rejects named color", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "red",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty color string", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("color boundary cases", () => {
    it("accepts all-zero hex color", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#000000",
      });
      expect(result.success).toBe(true);
    });

    it("accepts all-F hex color", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#FFFFFF",
      });
      expect(result.success).toBe(true);
    });

    it("rejects # followed by 5 digits", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#12345",
      });
      expect(result.success).toBe(false);
    });

    it("rejects # followed by 7 digits", () => {
      const result = createTagSchema.safeParse({
        name: "Tag",
        color: "#1234567",
      });
      expect(result.success).toBe(false);
    });
  });
});
