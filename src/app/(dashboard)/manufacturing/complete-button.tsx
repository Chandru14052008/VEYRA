"use client";

import { useState } from "react";
import { completeWorkOrderAction } from "@/lib/actions/manufacturing";

export default function CompleteButton({ workOrderId }: { workOrderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const res = await completeWorkOrderAction(workOrderId);
          if (res?.error) setError(res.error);
          setPending(false);
        }}
        className="text-xs font-semibold text-[#0EA5B7]"
      >
        {pending ? "Completing..." : "Mark completed (consumes materials, adds finished stock)"}
      </button>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
