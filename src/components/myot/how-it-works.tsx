'use client';

import { TSHIRTS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  // Start fading in after 400px of scroll, fully visible by 900px
  const opacity = Math.max(0, Math.min(1, (scrollY - 400) / 500));
  
  // To prevent interaction when invisible
  const pointerEvents = opacity > 0 ? 'auto' : 'none';

  const normalFitTees = TSHIRTS.filter((t) => t.fit === 'normal');
  const oversizedTees = TSHIRTS.filter((t) => t.fit === 'oversized');

  return (
    <section 
      id="how-it-works" 
      className="absolute inset-0 text-text-primary py-20 flex"
      style={{ opacity, pointerEvents }}
    >
      <div className="container mx-auto px-4">
        <h2 className="font-tagline text-xl md:text-2xl font-bold mb-12 text-center">
          Step 1 : Choose your tee
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="glass-card p-6 text-center">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Normal Fit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-text-secondary">
                {normalFitTees.map((tee) => (
                  <li key={tee.id} className="text-base">
                    {tee.gsm} GSM - <span className="font-bold text-text-primary">${tee.price}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card p-6 text-center">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Oversized Fit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-text-secondary">
                {oversizedTees.map((tee) => (
                  <li key={tee.id} className="text-base">
                    {tee.gsm} GSM - <span className="font-bold text-text-primary">${tee.price}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
