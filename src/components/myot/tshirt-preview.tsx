"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwitchCamera } from "lucide-react";
import type { Tshirt } from "@/lib/data";
import { DESIGNS } from "@/lib/data";
import { getImageById } from "@/lib/placeholder-images";
import type { CustomItem } from "./customizer";
import { Rnd } from 'react-rnd';

type TshirtPreviewProps = {
  tshirt: Tshirt;
  items: CustomItem[];
  view: "front" | "back";
  setView: (view: "front" | "back") => void;
  setItems: React.Dispatch<React.SetStateAction<CustomItem[]>>;
};

const placementStyles: { [key: string]: React.CSSProperties } = {
  'front-center': { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' },
  'front-top': { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },
  'front-bottom': { top: '75%', left: '50%', transform: 'translate(-50%, -50%)' },
  'back-center': { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' },
  'back-top': { top: '20%', left: '50%', transform: 'translate(-50%, -50%)' },
  'back-bottom': { top: '75%', left: '50%', transform: 'translate(-50%, -50%)' },
};


export default function TshirtPreview({
  tshirt,
  items,
  view,
  setView,
  setItems
}: TshirtPreviewProps) {
  const imageId = view === "front" ? tshirt.imageFront : tshirt.imageBack;
  const tshirtImage = getImageById(imageId);

  const handleDragStop = (id: string, d: any) => {
    // This is a simplified example. A more robust solution would involve updating placement.
    console.log(`Item ${id} dragged to x: ${d.x}, y: ${d.y}`);
  };

  const handleResizeStop = (id: string, ref: HTMLElement, position: any) => {
    // This is a simplified example.
    console.log(`Item ${id} resized to width: ${ref.style.width}, height: ${ref.style.height}`);
  };


  return (
    <div className="sticky top-24">
      <div className="relative aspect-[3/4] w-full max-w-lg mx-auto bg-muted/30 rounded-lg shadow-xl overflow-hidden">
        {tshirtImage && (
          <Image
            id={`tshirt-img-${view}`}
            src={tshirtImage.imageUrl}
            alt={tshirtImage.description}
            data-ai-hint={tshirtImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0">
          {items
            .filter((item) => item.view === view)
            .map((item) => {
              const placementStyle = placementStyles[item.placementId] || {};
              const itemImage =
                item.type === "design" && item.sourceId
                  ? getImageById(
                      DESIGNS.find((d) => d.id === item.sourceId)
                        ?.image ?? ""
                    )
                  : null;

              return (
                 <Rnd
                    key={item.id}
                    id={`item-${item.id}`}
                    default={{
                        x: placementStyle.left === '50%' ? (512/2 - 100) : 0, // Quick hack for centering
                        y: placementStyle.top === '20%' ? 512 * 0.2 : (placementStyle.top === '40%' ? 512*0.4 : 512 * 0.75),
                        width: 150,
                        height: 150,
                    }}
                    onDragStop={(e, d) => handleDragStop(item.id, d)}
                    onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(item.id, ref, position)}
                    bounds="parent"
                    className="flex items-center justify-center border-2 border-dashed border-transparent hover:border-accent"
                    >
                    
                    {item.type === "design" && item.previewUrl && (
                        <Image
                        src={item.previewUrl}
                        alt="design"
                        width={150}
                        height={150}
                        className="object-contain w-full h-full pointer-events-none"
                        />
                    )}
                    {item.type === "text" && (
                        <span style={{ fontFamily: item.font, color: item.color, fontSize: '24px' }} className="whitespace-pre-wrap text-center">
                        {item.text}
                        </span>
                    )}
                    {item.type === "upload" && item.previewUrl && (
                        <Image
                        src={item.previewUrl}
                        alt="uploaded design"
                        width={150}
                        height={150}
                        className="object-contain w-full h-full pointer-events-none"
                        />
                    )}
                    </Rnd>
              );
            })}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          onClick={() => setView(view === "front" ? "back" : "front")}
        >
          <SwitchCamera className="mr-2 h-4 w-4" />
          Switch to {view === "front" ? "Back" : "Front"} View
        </Button>
      </div>
    </div>
  );
}
