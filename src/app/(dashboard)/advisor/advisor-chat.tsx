"use client";

import { useState } from "react";
import { askVeyraAction } from "@/lib/actions/advisor";
import type { AdvisorResponse } from "@/lib/advisor";
import { Card, inputClass } from "@/components/ui";
import { ArrowRight } from "lucide-react";

type Msg = { role: "user"; text: string } | { role: "assistant"; data: AdvisorResponse };

const PROMPTS = ["What should I reorder?", "Which supplier should I choose?", "Where am I losing money?", "How is my business doing?"];

export default function AdvisorChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", data: {
      recommendation: "Ask me anything about your stock, suppliers, profit or cash — I'll answer using your business data.",
      why: "", numbers: "", risk: "", action: "",
    }},
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function send(text: string) {
    if (!text.trim() || pending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setPending(true);
    const data = await askVeyraAction(text);
    setMessages((m) => [...m, { role: "assistant", data }]);
    setPending(false);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 210px)" }}>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="self-end bg-[#12213E] text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-sm max-w-[82%]">
              {m.text}
            </div>
          ) : (
            <Card key={i} className="max-w-[92%]">
              <div className="text-sm font-bold">{m.data.recommendation}</div>
              {m.data.why && <div className="mt-2 text-xs text-[#5B6472]"><b className="text-[#0B1324]">Why: </b>{m.data.why}</div>}
              {m.data.numbers && <div className="mt-1.5 text-xs text-[#5B6472]"><b className="text-[#0B1324]">Numbers: </b>{m.data.numbers}</div>}
              {m.data.risk && <div className="mt-1.5 text-xs text-[#5B6472]"><b className="text-[#0B1324]">Risk: </b>{m.data.risk}</div>}
              {m.data.action && <div className="mt-2 text-xs font-semibold text-[#0EA5B7]">→ {m.data.action}</div>}
            </Card>
          )
        )}
        {pending && <div className="text-xs text-[#5B6472]">Thinking...</div>}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {PROMPTS.map((p) => (
          <button key={p} onClick={() => send(p)} className="text-[11.5px] font-semibold text-[#0EA5B7] bg-[#E3F6F8] rounded-full px-2.5 py-1.5">
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about stock, suppliers, profit, cash..."
          className={inputClass + " flex-1"}
        />
        <button onClick={() => send(input)} className="bg-[#12213E] text-white rounded-lg px-4">
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="text-[10.5px] text-[#5B6472] text-center mt-2">
        Estimates based on your data — not professional financial advice.
      </div>
    </div>
  );
}
