"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TSHIRTS, DESIGNS, PLACEMENTS, Design } from "@/lib/data";
import type { Tshirt } from "@/lib/data";
import type { CustomItem } from "./customizer";
import Image from "next/image";
import { getImageById } from "@/lib/placeholder-images";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type OptionsPanelProps = {
  tshirt: Tshirt;
  setTshirt: (tshirt: Tshirt) => void;
  items: CustomItem[];
  setItems: React.Dispatch<React.SetStateAction<CustomItem[]>>;
  view: "front" | "back";
};

export default function OptionsPanel({
  tshirt,
  setTshirt,
  items,
  setItems,
  view,
}: OptionsPanelProps) {

  const handleFitChange = (fit: "normal" | "oversized") => {
    const newTshirt = TSHIRTS.find(
      (t) => t.fit === fit && t.gsm === tshirt.gsm
    );
    if (newTshirt) setTshirt(newTshirt);
  };

  const handleGsmChange = (gsm: string) => {
    const newTshirt = TSHIRTS.find(
      (t) => t.fit === tshirt.fit && t.gsm === parseInt(gsm)
    );
    if (newTshirt) setTshirt(newTshirt);
  };

  const handleAddDesign = (design: Design) => {
    const designImage = getImageById(design.image);
    if (!designImage) return;

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: "design",
        sourceId: design.id,
        placementId: view === 'front' ? 'front-center' : 'back-center',
        view,
        previewUrl: designImage.imageUrl,
      },
    ]);
  };
  
  const handleAddText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('customText') as string;
    if (!text.trim()) return;

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: "text",
        text,
        placementId: view === 'front' ? 'front-center' : 'back-center',
        view,
        font: 'Belleza, sans-serif',
        color: '#FFFFFF',
      },
    ]);
    e.currentTarget.reset();
  };
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: "upload",
        file,
        previewUrl,
        placementId: view === 'front' ? 'front-center' : 'back-center',
        view,
      },
    ]);
  };

  const designCategories = [...new Set(DESIGNS.map((d) => d.category))];

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
      className="w-full"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="font-headline text-lg">
          1. T-Shirt Style
        </AccordionTrigger>
        <AccordionContent className="space-y-6">
          <div>
            <Label className="font-semibold mb-2 block">Fit</Label>
            <RadioGroup
              value={tshirt.fit}
              onValueChange={(val: "normal" | "oversized") => handleFitChange(val)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="fit-normal" />
                <Label htmlFor="fit-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oversized" id="fit-oversized" />
                <Label htmlFor="fit-oversized">Oversized</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label className="font-semibold mb-2 block">Fabric Weight (GSM)</Label>
            <RadioGroup
              value={tshirt.gsm.toString()}
              onValueChange={handleGsmChange}
              className="flex gap-4"
            >
              {[100, 200, 220].map((gsm) => (
                <div key={gsm} className="flex items-center space-x-2">
                  <RadioGroupItem value={gsm.toString()} id={`gsm-${gsm}`} />
                  <Label htmlFor={`gsm-${gsm}`}>{gsm}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="font-headline text-lg">
          2. Library Designs
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {designCategories.map((category) => (
              <div key={category}>
                <h4 className="font-semibold mb-2 text-muted-foreground">{category}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {DESIGNS.filter((d) => d.category === category).map(
                    (design) => {
                      const img = getImageById(design.image);
                      return (
                        <button
                          key={design.id}
                          onClick={() => handleAddDesign(design)}
                          className="border rounded-md p-1 aspect-square relative hover:border-primary transition-all group"
                        >
                          {img && (
                            <Image
                              src={img.imageUrl}
                              alt={design.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-contain"
                              data-ai-hint={img.imageHint}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs text-center p-1">
                            Add
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="font-headline text-lg">
          3. Custom Text
        </AccordionTrigger>
        <AccordionContent>
          <form onSubmit={handleAddText} className="space-y-4">
            <Textarea name="customText" placeholder="Your Text Here" required />
            <Button type="submit" className="w-full">Add Text</Button>
          </form>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="font-headline text-lg">
          4. Upload Your Design
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
            <Input id="upload" type="file" accept="image/*" onChange={handleUpload}/>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="mass-production" />
              <Label htmlFor="mass-production" className="text-sm text-muted-foreground">
                Submit this design to the MYOT collection for profit sharing.
              </Label>
            </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
