"use client";

type PriceSummaryProps = {
  price: number;
};

export default function PriceSummary({ price }: PriceSummaryProps) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-headline font-semibold">Total Price:</span>
        <span className="text-2xl font-bold text-primary font-headline tracking-tight">
          ${price.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
