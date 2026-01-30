'use client';

export default function Breadcrumbs() {
  const steps = ['Fabric', 'Personalize', 'Fit', 'Checkout'];
  const activeStep = 'Personalize';

  return (
    <nav className="flex items-center justify-center space-x-4 md:space-x-8 py-4 mb-8 md:mb-12">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <span
            className={`uppercase tracking-widest text-xs ${
              step === activeStep
                ? 'text-text-primary font-medium'
                : 'text-text-secondary/70'
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className="w-6 md:w-8 h-px bg-glass-border ml-4 md:ml-8"></div>
          )}
        </div>
      ))}
    </nav>
  );
}
