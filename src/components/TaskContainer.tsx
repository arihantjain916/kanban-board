import { useState } from "react";
import { Deleteicon } from "../icons/Deleteicon";
import { Id, Task } from "../type";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, value: string) => void;
}
export const TaskContainer = (props: Props) => {
  const { task, deleteTask, updateTask } = props;
  const [mouseIsOver, setmouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <>
        <div
          ref={setNodeRef}
          style={style}
          className="opacity-50 relative cursor-grab p-2.5 h-[50px] bg-mainBgColor min-h-[80px] items-center flex text-left rounded-xl border-red-500 border-2 "
        ></div>
      </>
    );
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setmouseIsOver(false);
  };

  if (editMode) {
    return (
      <div
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="relative p-2.5 h-[100px] bg-mainBgColor min-h-[100px] items-center flex text-left rounded-xl hover:ring-red-500 hover:ring-2 hover:ring-inset"
      >
        <textarea
          className="h-[90%] w-full outline-none bg-transparent resize-none border-none rounded text-white"
          value={task.content}
          onChange={(e) => updateTask(task.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          autoFocus
          onBlur={() => setEditMode(false)}
        ></textarea>
      </div>
    );
  }

  return (
    <div
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => {
        setmouseIsOver(true);
      }}
      onMouseLeave={() => {
        setmouseIsOver(false);
      }}
      className="relative cursor-grab p-2.5 h-[50px] bg-mainBgColor min-h-[80px] items-center flex text-left rounded-xl hover:ring-red-500 hover:ring-2 hover:ring-inset task"
    >
      <p className="my-auto whitespace-pre-wrap h-[90%] w-full overflow-y-auto overflow-x-hidden">
        {task.content}
      </p>

      {mouseIsOver && (
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="absolute p-2 -translate-y-1/2 rounded hover:opacity-100 opacity-60 stroke-white right-4 top-1/2 bg-columnBgColor"
        >
          <Deleteicon />
        </button>
      )}
    </div>
  );
};
