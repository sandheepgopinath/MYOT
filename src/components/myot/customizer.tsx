"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { TSHIRTS, DESIGNS } from "@/lib/data";
import type { Tshirt, Design } from "@/lib/data";
import TshirtPreview from "./tshirt-preview";
import OptionsPanel from "./options-panel";
import PriceSummary from "./price-summary";
import { Button } from "@/components/ui/button";
import { Loader, Send, ShieldCheck, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitForReview } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export type CustomItem = {
  id: string;
  type: "design" | "text" | "upload";
  sourceId?: string; // from DESIGNS
  text?: string;
  font?: string;
  color?: string;
  placementId: string;
  view: "front" | "back";
  file?: File;
  previewUrl?: string;
};

export default function Customizer() {
  const [tshirt, setTshirt] = useState<Tshirt>(TSHIRTS[1]);
  const [items, setItems] = useState<CustomItem[]>([]);
  const [view, setView] = useState<"front" | "back">("front");
  const [reviewState, setReviewState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    isSafe?: boolean;
    reason?: string;
  }>({ status: "idle" });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const totalPrice = useMemo(() => {
    let price = tshirt.price;
    items.forEach((item) => {
      if (item.type === "design" && item.sourceId) {
        const design = DESIGNS.find((d) => d.id === item.sourceId);
        if (design) price += design.price;
      } else if (item.type === "text") {
        price += 2; // Flat rate for text for now
      } else if (item.type === "upload") {
        price += 10; // Flat rate for upload
      }
    });
    return price;
  }, [tshirt, items]);

  const handleReview = useCallback(async () => {
    setReviewState({ status: "loading" });
    toast({
      title: "Submitting for review...",
      description: "Our AI is checking your design for compliance.",
    });

    const canvas = canvasRef.current;
    const customTextItems = items.filter((item) => item.type === "text");
    const customText = customTextItems.map((item) => item.text).join("\n");
    if (!canvas) {
      setReviewState({ status: "error", reason: "Canvas not available." });
      return;
    }

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      
      const tShirtImage = new Image();
      tShirtImage.crossOrigin = "anonymous";
      tShirtImage.src = document.getElementById(`tshirt-img-${view}`)?.getAttribute('src') || '';
      await tShirtImage.decode();

      canvas.width = tShirtImage.width;
      canvas.height = tShirtImage.height;

      ctx.drawImage(tShirtImage, 0, 0);

      for (const item of items) {
        if (item.view !== view) continue;

        const placementEl = document.getElementById(`item-${item.id}`);
        if (!placementEl) continue;

        const { offsetLeft, offsetTop, clientWidth, clientHeight } = placementEl;
        
        if (item.type === "design" && item.previewUrl) {
          const designImg = new Image();
          designImg.crossOrigin = "anonymous";
          designImg.src = item.previewUrl;
          await designImg.decode();
          ctx.drawImage(designImg, offsetLeft, offsetTop, clientWidth, clientHeight);
        } else if (item.type === "text" && item.text) {
          ctx.font = "30px Arial";
          ctx.fillStyle = item.color || 'white';
          ctx.fillText(item.text, offsetLeft, offsetTop + 20); // Basic positioning
        } else if (item.type === "upload" && item.previewUrl) {
          const uploadImg = new Image();
          uploadImg.crossOrigin = "anonymous";
          uploadImg.src = item.previewUrl;
          await uploadImg.decode();
          ctx.drawImage(uploadImg, offsetLeft, offsetTop, clientWidth, clientHeight);
        }
      }

      const designDataUri = canvas.toDataURL("image/png");

      const result = await submitForReview({ designDataUri, customText });

      if (result.success) {
        setReviewState({ status: "success", isSafe: result.isSafe, reason: result.reason });
        toast({
          title: result.isSafe ? "Design Approved!" : "Design Rejected",
          description: result.isSafe ? "You can now proceed to payment." : result.reason,
          variant: result.isSafe ? "default" : "destructive",
        });
      } else {
        throw new Error(result.reason);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "An unknown error occurred.";
      setReviewState({ status: "error", reason });
      toast({
        title: "Review Failed",
        description: reason,
        variant: "destructive",
      });
    }
  }, [items, toast, view]);

  return (
    <section id="customizer" className="py-12">
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <TshirtPreview
            tshirt={tshirt}
            items={items}
            view={view}
            setView={setView}
            setItems={setItems}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <OptionsPanel
            tshirt={tshirt}
            setTshirt={setTshirt}
            items={items}
            setItems={setItems}
            view={view}
          />
          <PriceSummary price={totalPrice} />

          <div className="space-y-4">
            <Button
              onClick={handleReview}
              disabled={reviewState.status === "loading" || items.length === 0}
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {reviewState.status === "loading" ? (
                <Loader className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              Review Design
            </Button>
            {reviewState.status === "success" && reviewState.isSafe && (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Design Approved!</AlertTitle>
                <AlertDescription>
                  {reviewState.reason || "Your design is compliant. You can proceed to payment."}
                </AlertDescription>
              </Alert>
            )}
            {reviewState.status === "success" && !reviewState.isSafe && (
              <Alert variant="destructive">
                <ShieldX className="h-4 w-4" />
                <AlertTitle>Design Rejected</AlertTitle>
                <AlertDescription>
                  <strong>Reason:</strong> {reviewState.reason || "Contains inappropriate content."}
                </AlertDescription>
              </Alert>
            )}
             {reviewState.status === "error" && (
              <Alert variant="destructive">
                <ShieldX className="h-4 w-4" />
                <AlertTitle>Review Error</AlertTitle>
                <AlertDescription>
                  {reviewState.reason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
