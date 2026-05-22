export function getTasksWithDates(tasks: any[]) {
  return tasks.map((task: any) => ({
    ...task,
    dateCreated: task.dateCreated ? new Date(task.dateCreated) : new Date(),
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    reminderDate: task.reminderDate ? new Date(task.reminderDate) : null,
    completedAt: task.completedAt ? new Date(task.completedAt) : new Date()
  }));
}
