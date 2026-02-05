'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Upload, Palette, Shirt, ShoppingCart, Type, Sparkles } from 'lucide-react';
import CraftHeader from '@/components/craft/header';
import { Label } from '@/components/ui/label';
import { useTShirtsData } from '@/hooks/use-tshirts';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CraftPage() {
  const { uniqueTypes, getPrice, getGsmsForType, isLoading } = useTShirtsData();

  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedGsm, setSelectedGsm] = useState<string>('');

  // Get available GSMs for the currently selected type
  const availableGsms = selectedType ? getGsmsForType(selectedType) : [];

  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [userDesignUrl, setUserDesignUrl] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  // Drag and drop state
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Initialize filtered selection when data loads or type changes
  useEffect(() => {
    if (uniqueTypes.length > 0 && !selectedType) {
      setSelectedType(uniqueTypes[0].type);
    }
  }, [uniqueTypes, selectedType]);

  // Update GSM selection when type changes or available GSMs update
  useEffect(() => {
    if (availableGsms.length > 0) {
      // If current selectedGsm is not valid for this type, select the first available one
      if (!selectedGsm || !availableGsms.includes(selectedGsm)) {
        setSelectedGsm(availableGsms[0]);
      }
    } else {
      setSelectedGsm('');
    }
  }, [availableGsms, selectedGsm]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Constraint check (optional, but keeping it inside the T-shirt area roughly)
    setPosition({
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserDesignUrl(url);
      setSelectedDesign(null); // Clear signature design if uploading
    }
  };

  const currentPrice = selectedType && selectedGsm ? getPrice(selectedType, selectedGsm) : 0;
  const designPrice = selectedDesign?.price || (userDesignUrl ? 10 : 0); // Flat 10 for custom upload maybe?
  const totalPrice = (currentPrice || 0) + designPrice;

  const currentTypeImage = uniqueTypes.find(t => t.type === selectedType)?.imageUrl || '/placeholder.png';
  const designImage = selectedDesign ? getImageById(selectedDesign.image) : null;
  const activeDesignUrl = designImage?.imageUrl || userDesignUrl;

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
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center py-2 sm:py-6 relative min-h-[60vh] lg:min-h-0">
          <div
            ref={previewRef}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Show T-shirt Image */}
            {selectedType && (
              <Image
                src={currentTypeImage}
                alt={`T-shirt ${selectedType}`}
                fill
                className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none transition-all duration-700 animate-in fade-in zoom-in-95"
                draggable={false}
                priority
              />
            )}

            {/* Draggable Design Overlay */}
            {activeDesignUrl && (
              <div
                className={`absolute w-1/3 h-1/3 cursor-move flex items-center justify-center group transition-transform ${isDragging ? 'scale-105' : 'hover:scale-102'}`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  touchAction: 'none'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                <div className={`relative w-full h-full border-2 ${isDragging ? 'border-primary/50' : 'border-transparent group-hover:border-white/20'} rounded-lg transition-colors`}>
                  <Image
                    src={activeDesignUrl}
                    alt="Custom Design"
                    fill
                    className="object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                  {/* Visual Drag Handle Hint */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm p-1 rounded-full border border-white/20">
                      <Palette size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 z-10 transition-all hover:bg-black/60">
            <Button
              variant={view === 'front' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('front')}
              className={`rounded-full px-6 transition-all ${view === 'front' ? 'bg-primary text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Front
            </Button>
            <Button
              variant={view === 'back' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('back')}
              className={`rounded-full px-6 transition-all ${view === 'back' ? 'bg-primary text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
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
                  {availableGsms.length > 0 ? (
                    availableGsms.map((gsm) => (
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
                    ))
                  ) : (
                    <p className="text-white/50 text-sm italic">No GSM options available for this type.</p>
                  )}
                </div>
              </div>

              <Separator className="bg-glass-border" />

              {/* Personalize Section */}
              <div>
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Palette size={20} /> Personalize
                </Label>

                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: Signature Designs */}
                  <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left group">
                        <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                          <Sparkles className="text-primary w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold">Signature Designs</p>
                          <p className="text-xs text-white/50">Browse our curated collection</p>
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle>Select a Signature Design</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-6">
                        {['Zodiac', 'Thrissur', 'Abstract'].map(category => (
                          <div key={category}>
                            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">{category}</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {DESIGNS.filter(d => d.category === category).map(design => {
                                const img = getImageById(design.image);
                                return img ? (
                                  <button
                                    key={design.id}
                                    onClick={() => {
                                      setSelectedDesign(design);
                                      setUserDesignUrl(null);
                                      setIsSignatureDialogOpen(false);
                                    }}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedDesign?.id === design.id
                                      ? 'border-primary'
                                      : 'border-transparent hover:border-white/20'
                                      }`}
                                  >
                                    <Image src={img.imageUrl} alt={design.name} fill className="object-cover" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1">
                                      <p className="text-[10px] text-center truncate">{design.name}</p>
                                    </div>
                                  </button>
                                ) : null;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Option 2: Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      id="design-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleDesignUpload}
                    />
                    <label
                      htmlFor="design-upload"
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group"
                    >
                      <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <Upload className="text-blue-400 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Upload Your Design</p>
                        <p className="text-xs text-white/50">PNG, JPG or SVG (Max 5MB)</p>
                      </div>
                    </label>
                  </div>

                  {/* Option 3: Add Text */}
                  <button className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left group grayscale opacity-50 cursor-not-allowed">
                    <div className="p-3 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                      <Type className="text-emerald-400 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Add Custom Text</p>
                      <p className="text-xs text-white/50">Coming soon</p>
                    </div>
                  </button>
                </div>
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
                  {userDesignUrl && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">
                        Custom Upload Fee:
                      </span>
                      <span>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(10)}
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
      </main >
    </div >
  );
}
