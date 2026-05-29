"use client";
import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  due_date: string;
  completed: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchTasks();
  }, []);

const fetchTasks = async () => {
    const res = await fetch("/api/parse-task");
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  };
  const addTask = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setTasks([data, ...tasks]);
      setInput("");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

 const toggleTask = async (id: string, completed: boolean) => {
  const res = await fetch("/api/parse-task", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, completed: !completed }),
  });
  const data = await res.json();
  if (data.error) {
    console.error("Toggle failed:", data.error);
    return;
  }
  setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
};

  const deleteTask = async (id: string) => {
    await fetch("/api/parse-task", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const priorityColor = (priority: string) => {
    if (priority === "High") return "#ff6584";
    if (priority === "Medium") return "#f6a623";
    return "#43e97b";
  };

  const filteredTasks = tasks
    .filter(t => filter === "All" ? true : t.priority === filter)
    .sort((a, b) => {
      if (sort === "newest") return 0;
      if (sort === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return 0;
    });

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        AI Task Manager
      </h1>
      <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
        Describe your task in plain English — AI handles the rest
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total", value: total, color: "#6c63ff" },
          { label: "Pending", value: pending, color: "#f6a623" },
          { label: "Done", value: completed, color: "#43e97b" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "12px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="e.g. Call client before Friday EOD, high priority"
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={addTask}
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            background: "#6c63ff",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {loading ? "..." : "Add"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", "High", "Medium", "Low"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${filter === f ? "#6c63ff" : "#333"}`,
              background: filter === f ? "#6c63ff22" : "transparent",
              color: filter === f ? "#6c63ff" : "#666",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {f}
          </button>
        ))}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#666",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <option value="newest">Newest First</option>
          <option value="priority">By Priority</option>
        </select>
      </div>

      {/* Tasks */}
      {filteredTasks.length === 0 && (
        <p style={{ color: "#555", textAlign: "center", marginTop: 60 }}>
          No tasks yet. Add your first task above.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredTasks.map(task => (
          <div
            key={task.id}
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              borderLeft: task.completed ? "3px solid #43e97b" : "1px solid #2a2a2a",
              opacity: task.completed ? 0.6 : 1,                
              color: task.completed ? "#555" : "#fff",
              textDecoration: task.completed ? "line-through" : "none",       
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, task.completed)}
              style={{ marginTop: 3, cursor: "pointer", accentColor: "#6c63ff" }}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                fontWeight: 600,
                fontSize: 15,
                textDecoration: task.completed ? "line-through" : "none",
                marginBottom: 6,
              }}>
                {task.title}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: `${priorityColor(task.priority)}22`,
                  color: priorityColor(task.priority),
                  fontWeight: 600,
                }}>
                  {task.priority}
                </span>
                <span style={{ fontSize: 12, color: "#666" }}>
                  Due: {task.due_date}
                </span>
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "none",
                border: "none",
                color: "#555",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}