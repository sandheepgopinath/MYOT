'use client';

import { TSHIRTS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { getImageById } from '@/lib/placeholder-images';

export default function HowItWorks({ scrollY }: { scrollY: number }) {
  // Start fading in after 300px of scroll, fully visible by 700px
  const opacity = Math.max(0, Math.min(1, (scrollY - 300) / 400));
  const transform = `translateY(${30 * (1 - opacity)}px)`;

  const normalFitTees = TSHIRTS.filter((t) => t.fit === 'normal').slice(0, 2);
  const oversizedTees = TSHIRTS.filter((t) => t.fit === 'oversized').slice(0, 2);

  return (
    <section 
      id="how-it-works" 
      className="relative min-h-screen text-text-primary py-20"
      style={{ opacity, transform }}
    >
      <div className="container mx-auto px-4">
        <h2 className="font-tagline text-2xl md:text-3xl font-bold mb-12">
          Step 1 : Choose your tee
        </h2>
        
        <div className="space-y-16">
          <div>
            <h3 className="text-2xl font-heading mb-6">Normal Fit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {normalFitTees.map((tee) => {
                const teeImage = getImageById(tee.imageFront);
                return (
                  <Card key={tee.id} className="glass-card overflow-hidden">
                    <CardHeader>
                      <CardTitle>{tee.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teeImage && (
                        <Image
                          src={teeImage.imageUrl}
                          alt={tee.name}
                          width={400}
                          height={400}
                          className="w-full h-auto object-cover rounded-md"
                          data-ai-hint={teeImage.imageHint}
                        />
                      )}
                      <p className="mt-4 text-text-secondary">{tee.gsm} GSM</p>
                      <p className="text-lg font-bold mt-2">${tee.price}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-heading mb-6">Oversized Fit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {oversizedTees.map((tee) => {
                const teeImage = getImageById(tee.imageFront);
                return (
                  <Card key={tee.id} className="glass-card overflow-hidden">
                    <CardHeader>
                      <CardTitle>{tee.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {teeImage && (
                        <Image
                          src={teeImage.imageUrl}
                          alt={tee.name}
                          width={400}
                          height={400}
                          className="w-full h-auto object-cover rounded-md"
                          data-ai-hint={teeImage.imageHint}
                        />
                      )}
                      <p className="mt-4 text-text-secondary">{tee.gsm} GSM</p>
                      <p className="text-lg font-bold mt-2">${tee.price}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
