import { useState } from "react";
import { Loader2, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthPanelProps {
  title: string;
  description: string;
}

export default function AuthPanel({ title, description }: AuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Enter your email and password");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || null,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          await supabase.from("student_profiles").upsert({
            id: data.user.id,
            display_name: displayName.trim() || null,
          });
        }

        toast.success("Account created. You can now use your private workspace.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        toast.success("Signed in successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-raised mx-auto max-w-lg p-7 md:p-8">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
        <LockKeyhole className="h-8 w-8" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-6 flex rounded-2xl border border-border bg-secondary p-1">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "signin" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-card text-foreground" : "text-muted-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {mode === "signup" && (
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
            className="input-soft"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="input-soft"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="input-soft"
        />
        <button onClick={submit} disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            <LogIn className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
