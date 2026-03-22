import { Upload, Brain, BellRing } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload your documents",
    description: "Drag and drop receipts, invoices, or warranty cards. We support PDF, JPG, and PNG files up to 10 MB.",
  },
  {
    icon: Brain,
    title: "AI extracts the details",
    description: "Our AI reads your document and automatically fills in the product name, purchase date, and warranty duration.",
  },
  {
    icon: BellRing,
    title: "Get timely reminders",
    description: "Set custom reminders and receive email alerts before your warranties expire, so you never miss a claim.",
  },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-16 animate-in-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Three steps to total coverage</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border shadow-sm transition-shadow hover:shadow-md animate-in-up"
            style={{ animationDelay: `${i * 100 + 80}ms` }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md">
              {i + 1}
            </div>
            <div className="mt-4 mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
