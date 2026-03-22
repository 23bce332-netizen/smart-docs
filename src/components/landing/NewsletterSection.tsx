import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate subscription
    setTimeout(() => {
      toast.success("You're subscribed! We'll keep you posted.");
      setEmail("");
      setLoading(false);
    }, 800);
  };

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center animate-in-up">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Stay in the loop</h2>
          <p className="text-muted-foreground mb-8">
            Get product updates, warranty management tips, and new feature announcements. No spam, unsubscribe anytime.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 flex-1"
            />
            <Button type="submit" className="h-11 px-6 active:scale-[0.97] transition-transform" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing you agree to our privacy policy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
