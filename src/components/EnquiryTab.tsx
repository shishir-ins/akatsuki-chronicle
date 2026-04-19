import { useCallback, useEffect, useState } from "react";
import { enquiriesStore, type Enquiry } from "@/lib/store";
import { HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function EnquiryTab() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  const refresh = useCallback(() => {
    setEnquiries(enquiriesStore.getAll());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = () => {
    if (!name.trim() || !message.trim()) {
      toast.error("Please fill in your name and message");
      return;
    }

    enquiriesStore.add(name.trim(), message.trim());
    toast.success("Enquiry sent to admin");
    setName("");
    setMessage("");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <HelpCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Ask the <span className="text-primary">admin</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send your queries, requests, or suggestions from here.
        </p>
      </div>

      <div className="surface p-5 space-y-3">
        <input
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input-soft"
        />
        <textarea
          placeholder="Type your question or request..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="input-soft resize-none"
        />
        <button
          onClick={handleSubmit}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send enquiry
        </button>
      </div>

      {enquiries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Recent enquiries
          </h3>
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="surface p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {enquiry.name}
                  </span>
                  <p className="mt-2 text-sm text-foreground">{enquiry.message}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(enquiry.createdAt).toLocaleDateString()}
                </span>
              </div>

              {enquiry.reply && (
                <div className="rounded-[1.2rem] border border-primary/15 bg-primary/8 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                    Admin reply
                  </span>
                  <p className="mt-2 text-sm text-foreground">{enquiry.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
