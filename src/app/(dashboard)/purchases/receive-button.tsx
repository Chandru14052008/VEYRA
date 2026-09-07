"use client";

import { useState } from "react";
import { markPurchaseReceivedAction } from "@/lib/actions/purchases";

export default function ReceiveButton({ purchaseId }: { purchaseId: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button
      disabled={pending}
      onClick={async () => { setPending(true); await markPurchaseReceivedAction(purchaseId); setPending(false); }}
      className="text-xs font-semibold text-[#0EA5B7] mt-1"
    >
      {pending ? "Updating..." : "Mark received"}
    </button>
  );
}
