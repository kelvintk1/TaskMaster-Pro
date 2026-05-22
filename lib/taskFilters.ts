// Shared task filtering utilities
export function filterTasksByTab(tasks: any[], tab: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  const isOverdue = (task: any) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(":");
      due.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      due.setHours(23, 59, 59, 999);
    }
    return due.getTime() < Date.now();
  };

  const activeTasks = tasks.filter((task) => !isOverdue(task));
  let filtered: any[] = [];

  switch (tab) {
    case "today":
      filtered = activeTasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === todayTime;
      });
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      break;
    case "upcoming":
      filtered = activeTasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate > today && taskDate <= endOfWeek;
      });
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      break;
    case "priority":
      filtered = activeTasks.filter((task) => task.priority === true);
      filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      break;
    case "timetable":
      filtered = activeTasks.filter((task) => task.source === "timetable");
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      break;
    default:
      filtered = activeTasks;
      filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  return filtered;
}

export function getFilteredTasks(allTasks: any[], activeTab: string) {
  const activeOnly = allTasks.filter((t) => !t.completed);
  return filterTasksByTab(activeOnly, activeTab);
}
