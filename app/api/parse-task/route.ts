import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Supabase error:", error);
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.log("GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  const prompt = `
You are a task parser. Extract details from this task and return ONLY a valid JSON object.

Task: "${input}"

Rules:
- title: clean task title
- priority: "High" for urgent/critical/important, "Low" for sometime/whenever, else "Medium"
- dueDate: extract any date or time mentioned, if none write "No due date"

Return exactly this format with no extra text:
{"title": "task title", "priority": "High", "dueDate": "date here"}
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: parsed.title,
        priority: parsed.priority,
        due_date: parsed.dueDate,
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      title: input,
      priority: "Medium",
      due_date: "No due date",
      completed: false,
    });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, completed } = await req.json();
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}