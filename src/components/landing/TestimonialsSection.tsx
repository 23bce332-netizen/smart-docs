import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Priya Mehta",
    role: "Freelance Designer",
    initials: "PM",
    quote: "I used to lose warranty receipts all the time. DocVault's AI extraction saved me ₹12,000 on a laptop claim I almost forgot about.",
  },
  {
    name: "Arjun Kapoor",
    role: "Small Business Owner",
    initials: "AK",
    quote: "Managing warranties for 40+ office devices was a nightmare. Now I upload once, and DocVault handles the rest — reminders included.",
  },
  {
    name: "Sara Lindgren",
    role: "Product Manager",
    initials: "SL",
    quote: "The AI chatbot is surprisingly helpful. I just ask 'what's expiring this month?' and it gives me a clear rundown. Brilliant.",
  },
  {
    name: "Tom Reeves",
    role: "IT Consultant",
    initials: "TR",
    quote: "Clean interface, fast extraction, secure storage. DocVault checks every box for personal document management.",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 sm:py-32 bg-muted/30">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-16 animate-in-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Testimonials</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by people who hate losing receipts</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md animate-in-up"
            style={{ animationDelay: `${i * 100 + 80}ms` }}
          >
            <blockquote className="text-sm leading-relaxed text-foreground/90 mb-6">
              "{t.quote}"
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {t.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
