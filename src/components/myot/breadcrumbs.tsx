'use client';

export default function Breadcrumbs({ activeStep }: { activeStep: string }) {
  const steps = ['Fabric', 'Personalize', 'Review & Ship'];

  return (
    <nav className="flex items-center justify-center space-x-2 md:space-x-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="relative py-2">
            <span
              className={`font-heading font-light text-xs transition-colors duration-300 whitespace-nowrap ${
                step === activeStep
                  ? 'gold-gradient'
                  : 'text-text-secondary/60 hover:text-text-secondary'
              }`}
            >
              {step}
            </span>
            {step === activeStep && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 gold-underline-glow rounded-full" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="w-4 md:w-6 h-px bg-border ml-2 md:ml-4"></div>
          )}
        </div>
      ))}
    </nav>
  );
}
