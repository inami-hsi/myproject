import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@taskflow.dev' },
    update: {},
    create: {
      email: 'demo@taskflow.dev',
      name: 'Demo User',
      cognitoId: 'demo-cognito-id',
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'TaskFlow v1.0',
      description: 'Task management application with Gantt, Kanban, Calendar, and List views.',
      color: '#e07a5f',
      userId: user.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Marketing Campaign',
      description: 'Q1 marketing campaign planning and execution.',
      color: '#6a9bcc',
      userId: user.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Design System',
      description: 'Component library and design tokens for the product.',
      color: '#788c5d',
      userId: user.id,
    },
  });

  // Create tags
  const tagFrontend = await prisma.tag.create({ data: { name: 'Frontend', color: '#6a9bcc' } });
  const tagBackend = await prisma.tag.create({ data: { name: 'Backend', color: '#788c5d' } });
  const tagDesign = await prisma.tag.create({ data: { name: 'Design', color: '#d97757' } });
  const tagBug = await prisma.tag.create({ data: { name: 'Bug', color: '#c44e4e' } });
  const tagUX = await prisma.tag.create({ data: { name: 'UX', color: '#9b5de5' } });

  // Create milestones for project1
  const now = new Date();
  await prisma.milestone.createMany({
    data: [
      { name: 'Alpha Release', date: new Date(now.getTime() + 14 * 86400000), color: '#d97757', projectId: project1.id },
      { name: 'Beta Release', date: new Date(now.getTime() + 45 * 86400000), color: '#6a9bcc', projectId: project1.id },
      { name: 'v1.0 Launch', date: new Date(now.getTime() + 90 * 86400000), color: '#788c5d', projectId: project1.id },
    ],
  });

  // Helper to create date
  const d = (daysFromNow) => new Date(now.getTime() + daysFromNow * 86400000);

  // Project 1 tasks
  const tasks1 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Gantt Chart drag & drop',
        description: 'Implement drag to reschedule and resize to change duration on Gantt bars.',
        status: 'DONE',
        priority: 'HIGH',
        progress: 100,
        startDate: d(-10),
        endDate: d(-3),
        dueDate: d(-2),
        sortOrder: 0,
        projectId: project1.id,
        assigneeId: user.id,
        tags: { create: [{ tagId: tagFrontend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Kanban board with dnd-kit',
        description: 'Sortable kanban columns with drag-and-drop cards using dnd-kit.',
        status: 'DONE',
        priority: 'HIGH',
        progress: 100,
        startDate: d(-8),
        endDate: d(-2),
        dueDate: d(-1),
        sortOrder: 1,
        projectId: project1.id,
        assigneeId: user.id,
        tags: { create: [{ tagId: tagFrontend.id }, { tagId: tagUX.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Calendar view implementation',
        description: 'Month and week views showing tasks by due date with date-fns.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        progress: 75,
        startDate: d(-5),
        endDate: d(3),
        dueDate: d(3),
        sortOrder: 2,
        projectId: project1.id,
        assigneeId: user.id,
        tags: { create: [{ tagId: tagFrontend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'API endpoint: task CRUD',
        description: 'REST API endpoints for creating, reading, updating, and deleting tasks.',
        status: 'DONE',
        priority: 'CRITICAL',
        progress: 100,
        startDate: d(-14),
        endDate: d(-7),
        dueDate: d(-7),
        sortOrder: 3,
        projectId: project1.id,
        assigneeId: user.id,
        tags: { create: [{ tagId: tagBackend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Task dependency arrows',
        description: 'Draw SVG arrows between dependent tasks in the Gantt chart.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        progress: 40,
        startDate: d(-2),
        endDate: d(5),
        dueDate: d(5),
        sortOrder: 4,
        projectId: project1.id,
        tags: { create: [{ tagId: tagFrontend.id }, { tagId: tagDesign.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Dark mode theme',
        description: 'Complete dark mode support using next-themes and CSS variables.',
        status: 'TODO',
        priority: 'LOW',
        progress: 0,
        startDate: d(5),
        endDate: d(12),
        dueDate: d(14),
        sortOrder: 5,
        projectId: project1.id,
        tags: { create: [{ tagId: tagDesign.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Performance optimization',
        description: 'Lazy loading, memoization, and bundle size reduction.',
        status: 'TODO',
        priority: 'MEDIUM',
        progress: 0,
        startDate: d(8),
        endDate: d(16),
        dueDate: d(18),
        sortOrder: 6,
        projectId: project1.id,
        tags: { create: [{ tagId: tagFrontend.id }, { tagId: tagBackend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix: Gantt bar overlap on resize',
        description: 'When resizing bars in the Gantt chart, adjacent bars should not overlap.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 30,
        startDate: d(-1),
        endDate: d(2),
        dueDate: d(2),
        sortOrder: 7,
        projectId: project1.id,
        tags: { create: [{ tagId: tagBug.id }, { tagId: tagFrontend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'User authentication with CC-Auth',
        description: 'Integrate Cognito-based authentication for user login/signup.',
        status: 'ON_HOLD',
        priority: 'HIGH',
        progress: 10,
        startDate: d(10),
        endDate: d(20),
        dueDate: d(22),
        sortOrder: 8,
        projectId: project1.id,
        tags: { create: [{ tagId: tagBackend.id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Responsive mobile layout',
        description: 'Ensure all views are usable on mobile devices with touch gestures.',
        status: 'TODO',
        priority: 'MEDIUM',
        progress: 0,
        startDate: d(12),
        endDate: d(22),
        dueDate: d(25),
        sortOrder: 9,
        projectId: project1.id,
        tags: { create: [{ tagId: tagFrontend.id }, { tagId: tagUX.id }] },
      },
    }),
  ]);

  // Add dependencies
  await prisma.taskDependency.create({
    data: { dependentId: tasks1[4].id, dependencyId: tasks1[0].id, type: 'FS' },
  });
  await prisma.taskDependency.create({
    data: { dependentId: tasks1[6].id, dependencyId: tasks1[2].id, type: 'FS' },
  });

  // Add comments
  await prisma.comment.createMany({
    data: [
      { content: 'Gantt drag is working smoothly now! Good job.', taskId: tasks1[0].id, userId: user.id },
      { content: 'Calendar needs week view navigation polish.', taskId: tasks1[2].id, userId: user.id },
      { content: 'This is blocking the performance work. Needs priority.', taskId: tasks1[4].id, userId: user.id },
    ],
  });

  // Project 2 tasks
  await Promise.all([
    prisma.task.create({
      data: { title: 'Content strategy document', status: 'DONE', priority: 'HIGH', progress: 100, startDate: d(-20), endDate: d(-14), dueDate: d(-14), sortOrder: 0, projectId: project2.id, assigneeId: user.id },
    }),
    prisma.task.create({
      data: { title: 'Social media campaign plan', status: 'IN_PROGRESS', priority: 'HIGH', progress: 60, startDate: d(-7), endDate: d(7), dueDate: d(7), sortOrder: 1, projectId: project2.id, assigneeId: user.id },
    }),
    prisma.task.create({
      data: { title: 'Landing page design', status: 'IN_PROGRESS', priority: 'MEDIUM', progress: 45, startDate: d(-3), endDate: d(10), dueDate: d(10), sortOrder: 2, projectId: project2.id, tags: { create: [{ tagId: tagDesign.id }] } },
    }),
    prisma.task.create({
      data: { title: 'Email newsletter templates', status: 'TODO', priority: 'LOW', progress: 0, startDate: d(5), endDate: d(15), dueDate: d(15), sortOrder: 3, projectId: project2.id },
    }),
  ]);

  // Project 3 tasks
  await Promise.all([
    prisma.task.create({
      data: { title: 'Button component variants', status: 'DONE', priority: 'HIGH', progress: 100, startDate: d(-15), endDate: d(-10), dueDate: d(-10), sortOrder: 0, projectId: project3.id, tags: { create: [{ tagId: tagDesign.id }, { tagId: tagFrontend.id }] } },
    }),
    prisma.task.create({
      data: { title: 'Color token system', status: 'DONE', priority: 'CRITICAL', progress: 100, startDate: d(-18), endDate: d(-12), dueDate: d(-12), sortOrder: 1, projectId: project3.id, tags: { create: [{ tagId: tagDesign.id }] } },
    }),
    prisma.task.create({
      data: { title: 'Typography scale definition', status: 'IN_PROGRESS', priority: 'MEDIUM', progress: 80, startDate: d(-5), endDate: d(2), dueDate: d(2), sortOrder: 2, projectId: project3.id, tags: { create: [{ tagId: tagDesign.id }] } },
    }),
  ]);

  console.log(`Seeded: ${3} projects, ${17} tasks, ${5} tags, ${3} milestones, ${3} comments, ${2} dependencies`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
