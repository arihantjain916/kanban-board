import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Deleteicon } from "../icons/Deleteicon";
import { Column, Id, Task } from "../type";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Plusicon } from "../icons/Plusicon";
import { TaskContainer } from "./TaskContainer";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, value: string) => void;
  createTask: (columnId: Id) => void;
  tasks: Task[];
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, value: string) => void;
}

export const ColumnContainer = (props: Props) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    tasks,
    createTask,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const taskId = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  if (isDragging) {
    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          className=" opacity-60 border-2 border-rose-50 bg-columnBgColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
        ></div>
      </>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBgColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="bg-mainBgColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBgColor border-4 flex items-center justify-between"
      >
        <div className="flex gap-2">
          <div className="flex items-center justify-center px-2 py-1 text-sm rounded-full bg-columnBgColor">
            {column.id}
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="px-2 bg-black border rounded outline-none focus:border-red-500"
              type="text"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              autoFocus
              onBlur={() => setEditMode(false)}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="px-1 py-2 rounded stroke-gray-500 hover:stroke-white hover:bg-columnBgColor"
        >
          <Deleteicon />
        </button>
      </div>
      <div className="flex flex-col flex-grow gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={taskId}>
          {tasks.map((task) => (
            <TaskContainer
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      <button
        onClick={() => {
          createTask(column.id);
        }}
        className="flex items-center gap-2 p-4 border-2 rounded-md border-columnBgColor border-x-columnBgColor hover:bg-mainBgColor hover:text-rose-500 active:bg-black"
      >
        <Plusicon />
        Add Task
      </button>
    </div>
  );
};
