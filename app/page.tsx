"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Column } from "./components/Column";
import { TaskCard } from "./components/TaskCard";

type Task = {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  columnId: number;
};

type Column = {
  id: number;
  name: string;
  order: number;
  boardId: number;
  tasks: Task[];
};

type Board = {
  id: number;
  name: string;
  columns: Column[];
};

export default function Home() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState<Record<number, string>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const board = useMemo(() => (boards && boards[0]) ?? null, [boards]);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetch("/api/boards", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch boards");
      const data: Board[] = await res.json();
      if (data.length === 0) {
        // Seed a default board with 3 columns
        const created = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "My Board" }),
        });
        if (!created.ok) throw new Error("Failed to seed board");
        const seeded: Board = await created.json();
        const defaults = [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ];
        for (const d of defaults) {
          await fetch("/api/columns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ boardId: seeded.id, name: d.name, order: d.order }),
          });
        }
        // re-fetch boards
        const r2 = await fetch("/api/boards", { cache: "no-store" });
        const d2 = await r2.json();
        setBoards(d2);
      } else {
        setBoards(data);
      }
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function addColumn() {
    if (!board || !newColumnName.trim()) return;
    const name = newColumnName.trim();
    await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: board.id, name, order: board.columns.length }),
    });
    setNewColumnName("");
    await refresh();
  }

  async function addTask(columnId: number) {
    const title = (newTaskTitle[columnId] ?? "").trim();
    if (!title) return;
    const col = board?.columns.find((c) => c.id === columnId);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, title, order: col ? col.tasks.length : 0 }),
    });
    setNewTaskTitle((prev) => ({ ...prev, [columnId]: "" }));
    await refresh();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function moveTask(task: Task, toColumnId: number) {
    if (task.columnId === toColumnId) return;
    const toCol = board?.columns.find((c) => c.id === toColumnId);
    const order = toCol ? toCol.tasks.length : 0;
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: toColumnId, order }),
    });
    await refresh();
  }

  async function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const taskId = active.id as number;
    setActiveTask(
      board?.columns
        .flatMap((c) => c.tasks)
        .find((t) => t.id === taskId) || null
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !active) return;

    const taskId = active.id as number;
    const toColumnId = over.id as number;

    setBoards((prevBoards) => {
      if (!prevBoards) return null;
      const newBoards = [...prevBoards];
      const board = newBoards[0];
      if (!board) return prevBoards;

      const activeColumn = board.columns.find((c) =>
        c.tasks.some((t) => t.id === taskId)
      );
      const overColumn = board.columns.find((c) => c.id === toColumnId);
      if (!activeColumn || !overColumn) return prevBoards;

      const task = activeColumn.tasks.find((t) => t.id === taskId);
      if (!task) return prevBoards;

      // Optimistic update
      task.columnId = toColumnId;
      activeColumn.tasks = activeColumn.tasks.filter((t) => t.id !== taskId);
      overColumn.tasks.push(task);

      // Trigger API call
      moveTask(task, toColumnId);

      return newBoards;
    });
    setActiveTask(null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="h-8 w-48 rounded bg-indigo-100 dark:bg-indigo-500/20 animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-white/70 dark:bg-indigo-950/30 backdrop-blur p-4 shadow-sm">
                <div className="h-5 w-32 rounded bg-indigo-100 dark:bg-indigo-500/20 animate-pulse mb-3" />
                <div className="space-y-2">
                  {[0, 1, 2].map((k) => (
                    <div key={k} className="h-16 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 px-4 py-3">
          Error: {error}
        </div>
      </div>
    );
  if (!board)
    return <div className="min-h-screen flex items-center justify-center">No board</div>;

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{board.name}</h1>
            <div className="flex gap-2">
              <input
                className="border border-indigo-200 dark:border-indigo-500/30 rounded-md px-3 py-2 text-sm bg-white dark:bg-indigo-950/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30"
                placeholder="New column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <button
                onClick={addColumn}
                className="text-sm rounded-md bg-indigo-600 text-white px-4 py-2 shadow hover:bg-indigo-500 active:bg-indigo-600/90 transition"
              >
                Add Column
              </button>
            </div>
          </div>

          {/* Columns */}
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {board.columns.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                name={col.name}
                tasksCount={col.tasks.length}
              >
                {/* Tasks */}
                <SortableContext
                  items={col.tasks.map((t) => t.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="space-y-3">
                    {col.tasks.map((t) => (
                      <TaskCard key={t.id} id={t.id}>
                        <div className="text-sm font-medium tracking-tight">{t.title}</div>
                        {t.description ? (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {t.description}
                          </div>
                        ) : null}
                        <div className="mt-3 flex gap-2 items-center">
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </TaskCard>
                    ))}
                  </div>
                </SortableContext>

                {/* Add task */}
                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 border border-indigo-950/10 dark:border-white/10 rounded-md px-3 py-2 text-sm bg-white dark:bg-indigo-950/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30"
                    placeholder="New task title"
                    value={newTaskTitle[col.id] ?? ""}
                    onChange={(e) => setNewTaskTitle((prev) => ({ ...prev, [col.id]: e.target.value }))}
                  />
                  <button
                    onClick={() => addTask(col.id)}
                    className="text-sm rounded-md bg-indigo-600 text-white px-3 py-2 shadow hover:bg-indigo-500 active:bg-indigo-600/90 transition"
                  >
                    Add
                  </button>
                </div>
              </Column>
            ))}
          </div>
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeTask ? (
            <TaskCard id={activeTask.id}>
              <div className="text-sm font-medium tracking-tight">
                {activeTask.title}
              </div>
              {activeTask.description ? (
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {activeTask.description}
                </div>
              ) : null}
            </TaskCard>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
