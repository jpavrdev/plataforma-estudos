import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db.ts";
import { sprints, sprintTasks, userSprintTasks, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { XP_PER_SPRINT_POINT } from "../domain/xp.ts";

// The sprint game engine. Tasks are content; the student's progress lives in
// user_sprint_tasks (a row per touched task, holding status and live code).
// A task with no row is backlog; the first not-done task is the unlocked one,
// everything after it is locked.

export type SprintTaskView = {
    id: string;
    position: number;
    trackName: string;
    title: string;
    description: string;
    points: number;
    tag: string;
    status: "backlog" | "doing" | "review" | "done";
    locked: boolean;
};

export type RankEntry = { position: number; name: string; points: number; you: boolean };

export async function currentSprint(userId: string) {
    const [sprint] = await db
        .select()
        .from(sprints)
        .where(eq(sprints.published, true))
        .orderBy(asc(sprints.position))
        .limit(1);
    if (!sprint) throw new AppError(404, "sprint.notFound");

    const tasks = await db
        .select()
        .from(sprintTasks)
        .where(eq(sprintTasks.sprintId, sprint.id))
        .orderBy(asc(sprintTasks.position));

    const mine = await db
        .select()
        .from(userSprintTasks)
        .where(
            and(
                eq(userSprintTasks.userId, userId),
                inArray(
                    userSprintTasks.taskId,
                    tasks.map((t) => t.id),
                ),
            ),
        );
    const mineByTask = new Map(mine.map((row) => [row.taskId, row]));

    // Only the first not-done task is unlocked; the ones after it stay locked.
    let firstOpen = true;
    const taskViews: SprintTaskView[] = tasks.map((task) => {
        const row = mineByTask.get(task.id);
        const done = row?.status === "done";
        const doing = row?.status === "doing";
        let locked = false;
        if (!done && !doing) {
            if (firstOpen) firstOpen = false;
            else locked = true;
        }
        return {
            id: task.id,
            position: task.position,
            trackName: task.trackName,
            title: task.title,
            description: task.description,
            points: task.points,
            tag: task.tag,
            status: done ? "done" : doing ? "doing" : "backlog",
            locked,
        };
    });

    const delivered = taskViews.filter((t) => t.status === "done").length;
    const earned = taskViews
        .filter((t) => t.status === "done")
        .reduce((sum, t) => sum + t.points, 0);
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);

    return {
        sprint: {
            id: sprint.id,
            number: sprint.position,
            product: sprint.product,
            summary: sprint.summary,
            endsAt: sprint.endsAt.toISOString(),
            totalTasks: tasks.length,
            totalPoints,
            delivered,
            earned,
            over: delivered === tasks.length && tasks.length > 0,
        },
        tasks: taskViews,
        ranking: await sprintRanking(userId, sprint.id),
    };
}

// Sprint ranking: delivered points per student, earliest delivery breaking ties.
export async function sprintRanking(userId: string, sprintId: string): Promise<RankEntry[]> {
    const rows = await db
        .select({
            userId: userSprintTasks.userId,
            name: users.name,
            username: users.username,
            points: sql<number>`coalesce(sum(${sprintTasks.points}), 0)::int`,
            lastDone: sql<string>`max(${userSprintTasks.doneAt})`,
        })
        .from(userSprintTasks)
        .innerJoin(sprintTasks, eq(sprintTasks.id, userSprintTasks.taskId))
        .innerJoin(users, eq(users.id, userSprintTasks.userId))
        .where(and(eq(sprintTasks.sprintId, sprintId), eq(userSprintTasks.status, "done")))
        .groupBy(userSprintTasks.userId, users.name, users.username);

    rows.sort((a, b) => b.points - a.points || (a.lastDone < b.lastDone ? -1 : 1));
    return rows.map((row, i) => ({
        position: i + 1,
        name: row.username ?? row.name,
        points: row.points,
        you: row.userId === userId,
    }));
}

export async function taskDetail(userId: string, taskId: string) {
    const [task] = await db.select().from(sprintTasks).where(eq(sprintTasks.id, taskId));
    if (!task) throw new AppError(404, "sprint.taskNotFound");

    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, task.sprintId));
    const [row] = await db
        .select()
        .from(userSprintTasks)
        .where(and(eq(userSprintTasks.userId, userId), eq(userSprintTasks.taskId, taskId)));

    return {
        id: task.id,
        position: task.position,
        trackName: task.trackName,
        title: task.title,
        description: task.description,
        points: task.points,
        tag: task.tag,
        criteria: task.criteria,
        tests: task.tests,
        starterCode: task.starterCode,
        // The student's live file, or the starter on first open.
        code: row?.code ?? task.starterCode,
        status: row?.status ?? "backlog",
        sprint: {
            id: task.sprintId,
            number: sprint?.position ?? 1,
            product: sprint?.product ?? "",
            endsAt: sprint?.endsAt.toISOString() ?? new Date().toISOString(),
            totalTasks: await db
                .select({ id: sprintTasks.id })
                .from(sprintTasks)
                .where(eq(sprintTasks.sprintId, task.sprintId))
                .then((all) => all.length),
        },
    };
}

export async function saveCode(userId: string, taskId: string, code: string) {
    const task = await findTaskOrFail(taskId);
    await db
        .insert(userSprintTasks)
        .values({ userId, taskId, status: "doing", code })
        .onConflictDoUpdate({
            target: [userSprintTasks.userId, userSprintTasks.taskId],
            set: { code, updatedAt: new Date() },
        });
    return { saved: true };
}

export async function claimTask(userId: string, taskId: string) {
    const task = await findTaskOrFail(taskId);
    const [row] = await db
        .select()
        .from(userSprintTasks)
        .where(and(eq(userSprintTasks.userId, userId), eq(userSprintTasks.taskId, taskId)));
    if (row?.status === "done") throw new AppError(409, "sprint.alreadyDone");

    await db
        .insert(userSprintTasks)
        .values({ userId, taskId, status: "doing", code: row?.code ?? task.starterCode })
        .onConflictDoUpdate({
            target: [userSprintTasks.userId, userSprintTasks.taskId],
            set: { status: "doing", updatedAt: new Date() },
        });
    return { status: "doing" };
}

export async function returnTask(userId: string, taskId: string) {
    const [row] = await db
        .select()
        .from(userSprintTasks)
        .where(and(eq(userSprintTasks.userId, userId), eq(userSprintTasks.taskId, taskId)));
    if (!row || row.status !== "doing") throw new AppError(409, "sprint.notDoing");
    // The saved code stays, so picking the task up again resumes where it left.
    await db
        .update(userSprintTasks)
        .set({ status: "backlog", updatedAt: new Date() })
        .where(eq(userSprintTasks.id, row.id));
    return { status: "backlog" };
}

export async function completeTask(userId: string, taskId: string) {
    const task = await findTaskOrFail(taskId);
    const [row] = await db
        .select()
        .from(userSprintTasks)
        .where(and(eq(userSprintTasks.userId, userId), eq(userSprintTasks.taskId, taskId)));
    if (row?.status === "done") throw new AppError(409, "sprint.alreadyDone");
    if (row?.status !== "doing") throw new AppError(409, "sprint.notDoing");

    const xpEarned = task.points * XP_PER_SPRINT_POINT;
    await db
        .update(userSprintTasks)
        .set({ status: "done", xpEarned, doneAt: new Date(), updatedAt: new Date() })
        .where(eq(userSprintTasks.id, row.id));

    const ranking = await sprintRanking(userId, task.sprintId);
    return { xpEarned, points: task.points, ranking };
}

async function findTaskOrFail(taskId: string) {
    const [task] = await db.select().from(sprintTasks).where(eq(sprintTasks.id, taskId));
    if (!task) throw new AppError(404, "sprint.taskNotFound");
    return task;
}
