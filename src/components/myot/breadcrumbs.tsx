'use client';

export default function Breadcrumbs() {
  const steps = ['Fabric', 'Personalize', 'Fit', 'Checkout'];
  const activeStep = 'Personalize';

  return (
    <nav className="flex items-center justify-center space-x-4 md:space-x-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="relative py-2">
            <span
              className={`font-heading font-light text-sm transition-colors duration-300 ${
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
            <div className="w-6 md:w-8 h-px bg-glass-border ml-4 md:ml-8"></div>
          )}
        </div>
      ))}
    </nav>
  );
}
