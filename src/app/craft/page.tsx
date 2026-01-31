'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TSHIRTS, DESIGNS, Tshirt, Design } from '@/lib/data';
import { getImageById } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Palette, Shirt, ShoppingCart } from 'lucide-react';
import CraftHeader from '@/components/craft/header';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CraftPage() {
  const [selectedTshirt, setSelectedTshirt] = useState<Tshirt>(TSHIRTS[0]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');

  const tshirtImage = getImageById(
    view === 'front' ? selectedTshirt.imageFront : selectedTshirt.imageBack
  );
  const designImage = selectedDesign ? getImageById(selectedDesign.image) : null;

  const totalPrice = (selectedTshirt.price || 0) + (selectedDesign?.price || 0);

  return (
    <div className="flex flex-col min-h-screen">
      <CraftHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
        {/* Left Side: T-Shirt Preview */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center py-10">
          <div className="relative w-full max-w-[500px] aspect-1">
            {tshirtImage && (
              <Image
                src={tshirtImage.imageUrl}
                alt={`T-shirt ${view}`}
                fill
                className="object-contain drop-shadow-2xl"
              />
            )}
            {designImage && view === 'front' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4">
                <Image
                  src={designImage.imageUrl}
                  alt={selectedDesign!.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <Button
              variant={view === 'front' ? 'default' : 'outline'}
              onClick={() => setView('front')}
              className="btn-outline"
            >
              Front
            </Button>
            <Button
              variant={view === 'back' ? 'default' : 'outline'}
              onClick={() => setView('back')}
              className="btn-outline"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Controls */}
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="glass-card">
            <CardContent className="space-y-6 pt-6">
              {/* T-Shirt Selection */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Shirt size={20} /> T-Shirt
                </Label>
                <RadioGroup
                  value={selectedTshirt.id}
                  onValueChange={(id) =>
                    setSelectedTshirt(
                      TSHIRTS.find((t) => t.id === id) || TSHIRTS[0]
                    )
                  }
                  className="space-y-2"
                >
                  {TSHIRTS.map((tshirt) => (
                    <Label
                      key={tshirt.id}
                      className="flex items-center justify-between p-3 rounded-md border border-transparent hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 transition-all cursor-pointer"
                    >
                      <span>{tshirt.name}</span>
                      <span className="font-bold">
                        ${tshirt.price.toFixed(2)}
                      </span>
                      <RadioGroupItem
                        value={tshirt.id}
                        id={tshirt.id}
                        className="sr-only"
                      />
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="bg-glass-border" />

              {/* Personalize Section */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Palette size={20} /> Design
                </Label>
                <Tabs defaultValue="designs" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="designs">Designs</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="designs" className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {DESIGNS.map((design) => {
                        const img = getImageById(design.image);
                        return img ? (
                          <button
                            key={design.id}
                            onClick={() => setSelectedDesign(design)}
                            className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                              selectedDesign?.id === design.id
                                ? 'border-primary'
                                : 'border-transparent'
                            }`}
                          >
                            <Image
                              src={img.imageUrl}
                              alt={design.name}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ) : null;
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="upload" className="mt-4">
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-md">
                      <Upload className="w-8 h-8 text-text-secondary mb-2" />
                      <p className="text-sm text-text-secondary mb-2">
                        Drop your design here
                      </p>
                      <Button
                        variant="outline"
                        className="btn-outline text-xs"
                      >
                        Browse Files
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator className="bg-glass-border" />

              {/* Order Summary Section */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <ShoppingCart size={20} /> Order Summary
                </Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      {selectedTshirt.name}:
                    </span>
                    <span>${selectedTshirt.price.toFixed(2)}</span>
                  </div>
                  {selectedDesign && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        {selectedDesign.name} Design:
                      </span>
                      <span>${selectedDesign.price.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2 bg-glass-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-text-primary">Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
