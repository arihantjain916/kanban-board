import { useMemo, useState } from "react";
import { Plusicon } from "../icons/Plusicon";
import { Column, Id, Task } from "../type";
import { ColumnContainer } from "./ColumnContainer";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskContainer } from "./TaskContainer";

export const KanbanBoard = () => {
  const [columns, setNewColumns] = useState<Column[]>([]);
  const [task, setTask] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  function createNewColumn() {
    const ColumnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setNewColumns([...columns, ColumnToAdd]);
  }
  function generateId() {
    return Math.floor(Math.random() * 10000);
  }
  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((column) => column.id !== id);
    setNewColumns(filteredColumns);
    const newTask = task.filter((task) => task.columnId !== id);
    setTask(newTask);
  }

  function updateColumn(id: Id, value: string) {
    const updatedColumns = columns.map((column) => {
      if (column.id === id) {
        return {
          ...column,
          title: value,
        };
      }
      return column;
    });
    setNewColumns(updatedColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }
  function onDragEnd(event: DragStartEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeColId = active.id;
    const overColId = over?.id;

    if (activeColId === overColId) return;

    setNewColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColId
      );
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const activeId = active.id;
    const overId = over?.id;
    const isActive = active.data.current?.type === "task";
    const isOver = over?.data.current?.type === "task";
    const isOverACol = over?.data.current?.type === "column";

    if (!over) return;
    if (activeId === overId) return;
    if (!isActive) return;
    if (isActive && isOver) {
      setTask((task) => {
        const activeIndex = task.findIndex((task) => task.id === activeId);
        const overIndex = task.findIndex((task) => task.id === overId);
        if (task[activeIndex].columnId !== task[overIndex].columnId) {
          task[activeIndex].columnId = task[overIndex].columnId;
          return arrayMove(task, activeIndex, overIndex - 1);
        }
        return arrayMove(task, activeIndex, overIndex);
      });
    }
    

    if (isActive && isOverACol) {
      setTask((task) => {
        const activeIndex = task.findIndex((task) => task.id === activeId);
        task[activeIndex].columnId = overId
        return arrayMove(task, activeIndex, activeIndex);
      });
    }
  }

  function createTask(id: Id) {
    const newTask: Task = {
      id: generateId(),
      content: `Task ${task.length + 1}`,
      columnId: id,
    };
    setTask([...task, newTask]);
  }

  function deleteTask(id: Id) {
    const filteredTasks = task.filter((task) => task.id !== id);
    setTask(filteredTasks);
  }

  function updateTask(id: number, value: string) {
    const updatedTasks = task.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          content: value,
        };
      }
      return task;
    });
    setTask(updatedTasks);
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        sensors={sensors}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4 m-auto">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={task.filter((task) => task.columnId === column.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="flex gap-2 h-[60px] w-[350px] max-w-[350px] cursor-pointer rounded-lg bg-mainBgColor border-2 border-columnBgColor p-4 ring-rose-500 hover:ring-2"
          >
            <Plusicon /> Add Column
          </button>
        </div>
        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={task.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && (
              <TaskContainer
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};
