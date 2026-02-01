'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DESIGNS, Design } from '@/lib/data'; // Keep designs static for now or move to DB later
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
import { useTShirtsData } from '@/hooks/use-tshirts';
import { Loader2 } from 'lucide-react';

export default function CraftPage() {
  const { uniqueTypes, uniqueGsms, getPrice, isLoading } = useTShirtsData();

  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedGsm, setSelectedGsm] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');

  // Initialize selection when data loads
  useEffect(() => {
    if (uniqueTypes.length > 0 && !selectedType) {
      setSelectedType(uniqueTypes[0].type);
    }
  }, [uniqueTypes, selectedType]);

  useEffect(() => {
    if (uniqueGsms.length > 0 && !selectedGsm) {
      setSelectedGsm(uniqueGsms[0]);
    }
  }, [uniqueGsms, selectedGsm]);

  const currentPrice = selectedType && selectedGsm ? getPrice(selectedType, selectedGsm) : 0;
  const totalPrice = (currentPrice || 0) + (selectedDesign?.price || 0);

  const currentTypeImage = uniqueTypes.find(t => t.type === selectedType)?.imageUrl || '/placeholder.png';
  const designImage = selectedDesign ? getImageById(selectedDesign.image) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <CraftHeader />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6">
        {/* Left Side: T-Shirt Preview */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center py-10">
          <div className="relative w-full max-w-[500px] aspect-1">
            {/* Show T-shirt Image (using currentTypeImage for front, back logic can be added later if DB supports it) */}
            {/* Note: Currently simplified to show same image as we don't have separate front/back in simplified DB schema yet. 
                 If needed, we can ask user to add front/back images or assume one image for now. */}
            {selectedType && (
              <Image
                src={currentTypeImage}
                alt={`T-shirt ${selectedType}`}
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
            {/* View controls simplified for now as DB only has 1 image per item currently */}
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

              {/* T-Shirt Type Selection */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Shirt size={20} /> T-Shirt Type
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {uniqueTypes.map((t) => (
                    <div
                      key={t.type}
                      onClick={() => setSelectedType(t.type)}
                      className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all ${selectedType === t.type
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                    >
                      <div className="relative w-16 h-16">
                        {t.imageUrl ? (
                          <Image src={t.imageUrl} alt={t.type} fill className="object-contain" />
                        ) : (
                          <div className="w-full h-full bg-white/10 rounded-md flex items-center justify-center text-xs">No Img</div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-center">{t.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GSM Selection */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  Fabric Quality (GSM)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {uniqueGsms.map((gsm) => (
                    <Button
                      key={gsm}
                      variant={selectedGsm === gsm ? 'default' : 'outline'}
                      onClick={() => setSelectedGsm(gsm)}
                      className={`flex-1 min-w-[3rem] ${selectedGsm === gsm
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'btn-outline border-white/20 text-white hover:bg-white/10'
                        }`}
                    >
                      {gsm}
                    </Button>
                  ))}
                </div>
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
                            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedDesign?.id === design.id
                                ? 'border-primary shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                                : 'border-transparent hover:border-white/20'
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
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-white/50 mb-2" />
                      <p className="text-sm text-white/70 mb-2">
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
                      {selectedType} ({selectedGsm} GSM):
                    </span>
                    <span>
                      {currentPrice
                        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(currentPrice)
                        : 'Unavailable'}
                    </span>
                  </div>
                  {selectedDesign && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        {selectedDesign.name} Design:
                      </span>
                      <span>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(selectedDesign.price)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2 bg-glass-border" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-text-primary">Total:</span>
                    <span>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full btn-login-glow text-white font-bold"
                disabled={!currentPrice}
              >
                {currentPrice ? 'Add to Cart' : 'Select Valid Options'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
