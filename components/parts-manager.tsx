"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  FileText,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Settings,
  Palette,
  Sparkles,
  ShieldCheck,
  Package,
  Clock,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProcessStep } from "@/components/process-step";
import { MaterialStep } from "@/components/material-step";
import { SurfaceFinishStep } from "@/components/surface-finish-step";
import { CoatingStep } from "@/components/coating-step";
import { ExtrasStep } from "./extras-step";

type PartExtras = {
  tolerance?: "standard" | "tight" | "custom";
  customToleranceNote?: string;
  threads?: Array<{ id: string; type: string; size: string; qty?: number }>;
  inspection?: "none" | "basic" | "FAI" | "CMM";
  certificates?: { material?: boolean; finish?: boolean; heatTreat?: boolean };
  serialization?: boolean;
  customMarking?: string;
  cleanRoom?: boolean;
  assembly?: boolean;
  packaging?: { bagPerPart?: boolean; label?: string };
  notes?: string;
};

interface Part {
  id: string;
  name: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string; // Thumbnail image for the 3D file
  drawingFileName?: string; // 2D drawing file name
  drawingFileSize?: number; // 2D drawing file size
  selections: {
    process: string;
    material: string;
    surfaceFinish: string;
    coating: string;
    quantity: number;
    leadTime: string;
    extras?: PartExtras;
  };
  currentStep: number;
  parentId?: string; // For variations - references the parent part
  isVariation?: boolean; // Flag to indicate this is a variation
  variationNumber?: number; // Number of the variation (e.g., 1, 2, 3...)
}

interface PartsManagerProps {
  parts: Part[];
  setParts: (parts: Part[]) => void;
  activePart: string | null;
  setActivePart: (partId: string | null) => void;
  dragOver: boolean;
  setDragOver: (dragOver: boolean) => void;
}

// Pricing data for calculations
const pricingData = {
  process: {
    cnc: 1.0,
    "3d-printing": 0.7,
    "sheet-metal": 0.6,
  },
  material: {
    "6061": 1.0,
    "7075": 1.2,
    "304-stainless": 1.3,
    "316-stainless": 1.5,
    abs: 0.4,
    pla: 0.3,
    brass: 1.6,
    copper: 1.8,
    titanium: 4.5,
    delrin: 0.8,
    nylon: 0.6,
    peek: 8.0,
  },
  surfaceFinish: {
    "as-machined": 1.0,
    "bead-blast": 1.2,
    brushed: 1.4,
    anodized: 1.8,
    polished: 2.5,
    sandblasted: 1.3,
    tumbled: 1.1,
    passivated: 1.6,
  },
  coating: {
    none: 1.0,
    "clear-anodize": 1.4,
    "black-anodize": 1.6,
    "powder-coat": 1.8,
    "zinc-plate": 1.5,
    "nickel-plate": 2.2,
    "chrome-plate": 2.8,
    "gold-plate": 5.0,
    "teflon-coat": 3.2,
  },
};

const leadTimeMultipliers = {
  "1": 2.5,
  "2": 2.1,
  "3": 1.7,
  "5": 1.3,
  "7": 1.0,
};

// Display names for configurations
const displayNames = {
  process: {
    cnc: "CNC Machining",
    "3d-printing": "3D Printing",
    "sheet-metal": "Sheet Metal",
  },
  material: {
    "6061": "Aluminum 6061",
    "7075": "Aluminum 7075",
    "304-stainless": "304 Stainless Steel",
    "316-stainless": "316 Stainless Steel",
    abs: "ABS Plastic",
    pla: "PLA Plastic",
    brass: "Brass",
    copper: "Copper",
    titanium: "Titanium Grade 2",
    delrin: "Delrin (POM)",
    nylon: "Nylon PA6",
    peek: "PEEK",
  },
  surfaceFinish: {
    "as-machined": "As Machined",
    "bead-blast": "Bead Blasted",
    brushed: "Brushed",
    anodized: "Anodized",
    polished: "Polished",
    sandblasted: "Sandblasted",
    tumbled: "Tumbled",
    passivated: "Passivated",
  },
  coating: {
    none: "No Coating",
    "clear-anodize": "Clear Anodize",
    "black-anodize": "Black Anodize",
    "powder-coat": "Powder Coating",
    "zinc-plate": "Zinc Plating",
    "nickel-plate": "Nickel Plating",
    "chrome-plate": "Chrome Plating",
    "gold-plate": "Gold Plating",
    "teflon-coat": "Teflon Coating",
  },
  leadTime: {
    "1": "1 Day",
    "2": "2 Days",
    "3": "3 Days",
    "5": "5 Days",
    "7": "7 Days (Standard)",
  },
};

const steps = [
  { id: 0, name: "Process", icon: Settings, component: "process" },
  { id: 1, name: "Material", icon: Package, component: "material" },
  { id: 2, name: "Surface Finish", icon: Sparkles, component: "surface" },
  { id: 3, name: "Coating", icon: ShieldCheck, component: "coating" },
  { id: 4, name: "Extras", icon: CheckCircle, component: "extras" },
];

export function PartsManager({
  parts,
  setParts,
  activePart,
  setActivePart,
  dragOver,
  setDragOver,
}: PartsManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  const leadTimeOptions = [
    { value: "1", label: "1 Day", multiplier: 2.5 },
    { value: "2", label: "2 Days", multiplier: 2.1 },
    { value: "3", label: "3 Days", multiplier: 1.7 },
    { value: "5", label: "5 Days", multiplier: 1.3 },
    { value: "7", label: "7 Days (Standard)", multiplier: 1.0 },
  ];

  // Listen for custom event from welcome card to trigger file upload
  useEffect(() => {
    const handleTriggerUpload = () => {
      fileInputRef.current?.click();
    };

    const handleFilesDropped = (e: any) => {
      if (e.detail) {
        handleFileUpload(e.detail);
      }
    };

    window.addEventListener("triggerFileUpload", handleTriggerUpload);
    window.addEventListener("filesDropped", handleFilesDropped);
    return () => {
      window.removeEventListener("triggerFileUpload", handleTriggerUpload);
      window.removeEventListener("filesDropped", handleFilesDropped);
    };
  }, [parts]);

  // Calculate price for a part
  const calculatePartPrice = (part: Part) => {
    const basePrice = 75; // Base manufacturing cost

    const processMultiplier =
      pricingData.process[
        part.selections.process as keyof typeof pricingData.process
      ] || 1;
    const materialMultiplier =
      pricingData.material[
        part.selections.material as keyof typeof pricingData.material
      ] || 1;
    const finishMultiplier =
      pricingData.surfaceFinish[
        part.selections.surfaceFinish as keyof typeof pricingData.surfaceFinish
      ] || 1;
    const coatingMultiplier =
      pricingData.coating[
        part.selections.coating as keyof typeof pricingData.coating
      ] || 1;
    const leadTimeMultiplier =
      leadTimeMultipliers[
        part.selections.leadTime as keyof typeof leadTimeMultipliers
      ] || 1;

    return (
      basePrice *
      processMultiplier *
      materialMultiplier *
      finishMultiplier *
      coatingMultiplier *
      leadTimeMultiplier *
      part.selections.quantity
    );
  };
const firstIncompleteStepIndex = (p: Part) => {
  const c = getStepCompletion(p);
  if (!c.process)  return 0;
  if (!c.material) return 1;
  if (!c.surface)  return 2;
  if (!c.coating)  return 3;
  // extras optional; leave where user left off if all required are done
  return p.currentStep ?? 0;
};

const togglePartExpansion = (partId: string, e?: React.MouseEvent) => {
  if (e) e.stopPropagation();
  setExpandedParts(prev => {
    const s = new Set(prev);
    if (s.has(partId)) s.delete(partId); else s.add(partId);
    return s;
  });
  const p = parts.find(p => p.id === partId);
  if (p && !expandedParts.has(partId)) {
    setPartStep(partId, firstIncompleteStepIndex(p));
  }
};


  const setPartStep = (partId: string, stepIndex: number) => {
    setParts(
      parts.map((p) => (p.id === partId ? { ...p, currentStep: stepIndex } : p))
    );
  };

  const nextStep = (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (part && part.currentStep < steps.length - 1) {
      setPartStep(partId, part.currentStep + 1);
    }
  };

  const prevStep = (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (part && part.currentStep > 0) {
      setPartStep(partId, part.currentStep - 1);
    }
  };

  const createNewPart = (
    name: string,
    fileName?: string,
    fileSize?: number
  ): Part => ({
    id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    fileName,
    fileSize,
    currentStep: 0,
    selections: {
      process: "",
      material: "",
      surfaceFinish: "",
      coating: "",
      quantity: 1,
      leadTime: "7",
      extras: {},
    },
  });


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

const addEmptyPart = () => {
  const part = createNewPart(`Part ${parts.length + 1}`);
  setParts([...parts, part]);
  expandAndFocus(part.id);
};

const handleFileUpload = (files: FileList | null) => {
  if (!files) return;
  const newParts: Part[] = [];
  Array.from(files).forEach((file) => {
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    newParts.push(createNewPart(baseName, file.name, file.size));
  });
  const all = [...parts, ...newParts];
  setParts(all);
  // open the first of the newly added files
  if (newParts.length > 0) expandAndFocus(newParts[0].id);
};

const duplicatePart = (partId: string) => {
  const src = parts.find(p => p.id === partId);
  if (!src) return;
  const newPart = {
    ...src,
    id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${src.name} Copy`,
    fileName: undefined,
    fileSize: undefined,
  };
  setParts([...parts, newPart]);
  expandAndFocus(newPart.id);
};

const createVariation = (partId: string) => {
  // ...your existing logic...
  setParts(newParts);
  expandAndFocus(newVariation.id);
};


  const removePart = (partId: string) => {
    const newParts = parts.filter((p) => p.id !== partId);
    setParts(newParts);
    if (activePart === partId) {
      setActivePart(newParts.length > 0 ? newParts[0].id : null);
    }
  };




  const removeVariation = (variationId: string) => {
    const variation = parts.find((p) => p.id === variationId);
    if (!variation || !variation.isVariation) return;

    const newParts = parts.filter((p) => p.id !== variationId);

    // Renumber remaining variations
    const parentId = variation.parentId;
    let variationCount = 1;
    const updatedParts = newParts.map((p) => {
      if (p.parentId === parentId && p.isVariation) {
        return {
          ...p,
          variationNumber: variationCount++,
          name: `Variant #${variationCount - 1}`,
        };
      }
      return p;
    });

    setParts(updatedParts);

    if (activePart === variationId) {
      setActivePart(updatedParts.length > 0 ? updatedParts[0].id : null);
    }
  };

  const updatePartName = (partId: string, newName: string) => {
    setParts(parts.map((p) => (p.id === partId ? { ...p, name: newName } : p)));
  };

  const handle2DDrawingUpload = (partId: string, file: File) => {
    setParts(
      parts.map((p) =>
        p.id === partId
          ? {
              ...p,
              drawingFileName: file.name,
              drawingFileSize: file.size,
            }
          : p
      )
    );
  };

  const remove2DDrawing = (partId: string) => {
    setParts(
      parts.map((p) =>
        p.id === partId
          ? {
              ...p,
              drawingFileName: undefined,
              drawingFileSize: undefined,
            }
          : p
      )
    );
  };

  const updatePartSelections = (partId: string, newSelections: any) => {
    console.log("💾 updatePartSelections called:", { partId, newSelections });
    setParts(
      parts.map((p) =>
        p.id === partId ? { ...p, selections: newSelections } : p
      )
    );
  };

  const updatePartSelectionsWithScroll = (
    partId: string,
    newSelections: any,
    stepName: string
  ) => {
    console.log("🔍 updatePartSelectionsWithScroll called:", {
      partId,
      stepName,
      coating: newSelections.coating,
      process: newSelections.process,
      material: newSelections.material,
      surfaceFinish: newSelections.surfaceFinish,
    });

    setParts(
      parts.map((p) =>
        p.id === partId ? { ...p, selections: newSelections } : p
      )
    );

    // If coating is selected and part is configured, scroll to quantity section
    const shouldScroll =
      stepName === "coating" &&
      newSelections.coating &&
      newSelections.process &&
      newSelections.material &&
      newSelections.surfaceFinish;
    console.log("📊 Should scroll?", shouldScroll);

    if (shouldScroll) {
      console.log("✅ Scroll conditions met, preparing to scroll...");

      // Ensure part is expanded before scrolling
      setExpandedParts((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.add(partId);
        console.log("📂 Part expanded in set");
        return newExpanded;
      });

      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          const quantitySection = document.querySelector(
            `#quantity-section-${partId}`
          ) as HTMLElement;
          console.log("🎯 Quantity section found?", !!quantitySection);

          if (quantitySection) {
            console.log("🚀 Scrolling to quantity section...");
            // Add a visual highlight effect before scrolling
            quantitySection.style.transition = "all 0.3s ease";
            quantitySection.style.transform = "scale(1.02)";
            quantitySection.style.boxShadow =
              "0 8px 25px -5px rgba(59, 130, 246, 0.3)";

            // Scroll with better positioning
            quantitySection.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });

            // Remove highlight after scroll
            setTimeout(() => {
              quantitySection.style.transform = "scale(1)";
              quantitySection.style.boxShadow = "";
            }, 1000);
          } else {
            console.error("❌ Quantity section not found for part:", partId);
            console.log(
              "Available elements with quantity-section:",
              document.querySelectorAll('[id*="quantity-section"]')
            );
          }
        }, 300);
      });
    }
  };

  const updatePartQuantity = (partId: string, quantity: number) => {
    setParts(
      parts.map((p) =>
        p.id === partId
          ? { ...p, selections: { ...p.selections, quantity } }
          : p
      )
    );
  };

  const updatePartLeadTime = (partId: string, leadTime: string) => {
    setParts(
      parts.map((p) =>
        p.id === partId
          ? { ...p, selections: { ...p.selections, leadTime } }
          : p
      )
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // helper to expand + focus a part
const expandAndFocus = (id: string) => {
  setActivePart(id);
  setExpandedParts(prev => {
    const s = new Set(prev);
    s.add(id);
    return s;
  });
};

const isExtrasPicked = (ex?: Part["selections"]["extras"]) => {
  if (!ex) return false;
  return Boolean(
    (ex.tolerance && ex.tolerance !== "standard") ||
    (ex.threads && ex.threads.length > 0) ||
    (ex.inspection && ex.inspection !== "none") ||
    (ex.certificates && (ex.certificates.material || ex.certificates.finish || ex.certificates.heatTreat)) ||
    ex.serialization ||
    ex.customMarking ||
    (ex.packaging && (ex.packaging.bagPerPart || ex.packaging.label))
  );
};

const getStepCompletion = (p: Part) => ({
  process: !!p.selections.process,
  material: !!p.selections.material,
  surface: !!p.selections.surfaceFinish,
  coating: !!p.selections.coating,
  extras: isExtrasPicked(p.selections.extras),
});



  return (
    <>
      {/* Hidden file input - always mounted for programmatic triggering */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".stl,.step,.stp,.obj,.3mf,.ply"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Show PartsManager only when parts exist */}
      {parts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Parts Manager</h2>
            <p className="text-slate-300 text-sm mt-1">
              Upload 3D files or add parts manually
            </p>
          </div>

          <div className="p-6">
            {/* Parts List */}
            {parts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">
                    Parts ({parts.length})
                  </h3>
                  <Button
                    onClick={addEmptyPart}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Part
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {parts.map((part) => {
                      const isExpanded = expandedParts.has(part.id);
                      const isComplete =
                        part.selections.process &&
                        part.selections.material &&
                        part.selections.surfaceFinish &&
                        part.selections.coating;
                      const totalPrice = isComplete
                        ? calculatePartPrice(part)
                        : 0;
                      const currentStep = steps[part.currentStep || 0];

                      return (
                        <motion.div
                          key={part.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`${part.isVariation ? "ml-8" : ""}`}
                        >
                          <div
                            className={`rounded-lg border-2 transition-all ${
                              activePart === part.id
                                ? "border-blue-500 bg-blue-50"
                                : part.isVariation
                                ? "border-green-200 bg-green-50 hover:border-green-300"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            {/* Part Header - Always Visible */}
                            <div className="p-3">
                              {/* Part Name and File Info - Top Row */}
                              <div className="flex items-start justify-between gap-3 mb-3">
                                {/* Left: Thumbnail (only when collapsed) + Name & File Info */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Thumbnail - Small when collapsed */}
                                  {!isExpanded && (
                                    <div
                                      className="flex-shrink-0 cursor-pointer"
                                      onClick={() => {
                                        setActivePart(part.id);
                                        togglePartExpansion(part.id);
                                      }}
                                    >
                                      <div
                                        className="rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-100"
                                        style={{
                                          width: "48px",
                                          height: "48px",
                                        }}
                                      >
                                        <img
                                          src={
                                            part.thumbnailUrl ||
                                            "/default-thumbnail.png"
                                          }
                                          alt={part.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Name and File Info */}
                                  <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => {
                                      setActivePart(part.id);
                                      togglePartExpansion(part.id);
                                    }}
                                  >
                                    {/* Part Name */}
                                    <div className="flex items-center gap-2 mb-1">
                                      {activePart === part.id &&
                                      !part.isVariation ? (
                                        <Input
                                          value={part.name}
                                          onChange={(e) =>
                                            updatePartName(
                                              part.id,
                                              e.target.value
                                            )
                                          }
                                          className="text-base font-semibold border-0 p-0 h-auto bg-transparent focus:ring-0 flex-1"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <h4
                                          className={`text-base font-semibold truncate ${
                                            part.isVariation
                                              ? "text-green-700"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {part.isVariation && "+ "}
                                          {part.name}
                                        </h4>
                                      )}
                                    </div>

                                    {/* File Info */}
                                    {part.fileName && (
                                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 w-fit">
                                        <FileText className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">
                                          {part.fileName}
                                        </span>
                                        {part.fileSize && (
                                          <>
                                            <span className="text-slate-300">
                                              •
                                            </span>
                                            <span className="whitespace-nowrap">
                                              {formatFileSize(part.fileSize)}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Action buttons */}
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  {!part.isVariation && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          duplicatePart(part.id);
                                        }}
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        title="Duplicate (new file)"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          createVariation(part.id);
                                        }}
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50"
                                        title="Add New Variation"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (part.isVariation) {
                                        removeVariation(part.id);
                                      } else {
                                        removePart(part.id);
                                      }
                                    }}
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Bottom Row: Steps + Price/Status + Expand Button */}
                              <div className="flex items-start justify-between gap-3">
                                {isExpanded ? (
                                  /* When Expanded: Show large thumbnail, 2D button, and steps */
                                  <div className="flex gap-3 items-start flex-1">
                                    {/* Thumbnail and 2D Drawing Column */}
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                      {/* 3D Thumbnail */}
                                      <div
                                        className="rounded-lg overflow-hidden border-2 border-slate-300 bg-slate-100"
                                        style={{
                                          width: "120px",
                                          height: "120px",
                                        }}
                                      >
                                        <img
                                          src={
                                            part.thumbnailUrl ||
                                            "/default-thumbnail.png"
                                          }
                                          alt={part.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>

                                      {/* 2D Drawing Upload Button */}
                                      {!part.drawingFileName ? (
                                        <label className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-slate-600 border border-dashed border-slate-300 rounded hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                                          <Upload className="w-3 h-3" />
                                          <span>2D Drawing</span>
                                          <input
                                            type="file"
                                            accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                                            className="hidden"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                handle2DDrawingUpload(
                                                  part.id,
                                                  file
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      ) : (
                                        <div className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-green-50 border border-green-200 rounded">
                                          <FileText className="w-3 h-3 text-green-600" />
                                          <span className="text-xs text-green-700 truncate flex-1">
                                            {part.drawingFileName}
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              remove2DDrawing(part.id);
                                            }}
                                            className="text-green-600 hover:text-red-600 flex-shrink-0"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Step Progress Indicator - to the right of thumbnail */}
                                    <div className="flex flex-row flex-wrap gap-2 flex-1">
                                      {steps.map((step, index) => {
                                        const StepIcon = step.icon;
                                        const isCurrentStep =
                                          index === (part.currentStep || 0);
                                        const completed = getStepCompletion(part);
const isCompleted =
  (step.component === "process"  && completed.process)  ||
  (step.component === "material" && completed.material) ||
  (step.component === "surface"  && completed.surface)  ||
  (step.component === "coating"  && completed.coating)  ||
  (step.component === "extras"   && completed.extras);


                                        // Get selected value for this step
                                        let selectedValue = "";
                                        if (
                                          step.component === "process" &&
                                          part.selections.process
                                        ) {
                                          selectedValue =
                                            displayNames.process[
                                              part.selections
                                                .process as keyof typeof displayNames.process
                                            ];
                                        } else if (
                                          step.component === "material" &&
                                          part.selections.material
                                        ) {
                                          selectedValue =
                                            displayNames.material[
                                              part.selections
                                                .material as keyof typeof displayNames.material
                                            ];
                                        } else if (
                                          step.component === "surface" &&
                                          part.selections.surfaceFinish
                                        ) {
                                          selectedValue =
                                            displayNames.surfaceFinish[
                                              part.selections
                                                .surfaceFinish as keyof typeof displayNames.surfaceFinish
                                            ];
                                        } else if (
                                          step.component === "coating" &&
                                          part.selections.coating
                                        ) {
                                          selectedValue =
                                            displayNames.coating[
                                              part.selections
                                                .coating as keyof typeof displayNames.coating
                                            ];
                                        } // after coating case:
                                        else if (
                                          step.component === "extras" &&
                                          part.selections.extras
                                        ) {
                                          const ex = part.selections.extras;
                                          // count a few meaningful picks to show a short label
                                          const count =
                                            (ex.tolerance &&
                                            ex.tolerance !== "standard"
                                              ? 1
                                              : 0) +
                                            ((ex.threads?.length || 0) > 0
                                              ? 1
                                              : 0) +
                                            (ex.inspection &&
                                            ex.inspection !== "none"
                                              ? 1
                                              : 0) +
                                            (ex.certificates &&
                                            (ex.certificates.material ||
                                              ex.certificates.finish ||
                                              ex.certificates.heatTreat)
                                              ? 1
                                              : 0) +
                                            (ex.serialization ? 1 : 0) +
                                            (ex.customMarking ? 1 : 0) +
                                            (ex.packaging &&
                                            (ex.packaging.bagPerPart ||
                                              ex.packaging.label)
                                              ? 1
                                              : 0);

                                          selectedValue =
                                            count > 0
                                              ? `${count} option${
                                                  count > 1 ? "s" : ""
                                                }`
                                              : "";
                                        }

                                        return (
                                          <div
                                            key={step.id}
                                            className="flex flex-col items-center gap-2"
                                          >
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPartStep(part.id, index);
                                                // togglePartExpansion(part.id, e)
                                              }}
                                              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                                                isCurrentStep
                                                  ? "bg-blue-500 text-white"
                                                  : isCompleted
                                                  ? "bg-green-500 text-white"
                                                  : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                                              }`}
                                            >
                                              <StepIcon className="w-3.5 h-3.5" />
                                              <span className="text-xs font-medium">
                                                {step.name}
                                              </span>
                                            </button>
                                            {selectedValue && (
                                              <span className="text-xs text-slate-600">
                                                {selectedValue}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  /* When Collapsed: Show steps horizontally */
                                  <div className="flex-1 min-w-0">
                                    {/* Step Progress Indicators */}
                                    <div className="flex items-start gap-0 mb-3">
                                      {steps.map((step, index) => {
                                        const StepIcon = step.icon;
                                        const isCurrentStep =
                                          index === (part.currentStep || 0);
                                        const isCompleted =
                                          index < (part.currentStep || 0) ||
                                          (step.component === "process" &&
                                            !!part.selections.process) ||
                                          (step.component === "material" &&
                                            !!part.selections.material) ||
                                          (step.component === "surface" &&
                                            !!part.selections.surfaceFinish) ||
                                          (step.component === "coating" &&
                                            !!part.selections.coating) ||
                                          (step.component === "extras" &&
                                            !!part.selections.extras &&
                                            Object.keys(part.selections.extras)
                                              .length > 0); // optional

                                        // Get selected value for this step
                                        let selectedValue = "";
                                        if (
                                          step.component === "process" &&
                                          part.selections.process
                                        ) {
                                          selectedValue =
                                            displayNames.process[
                                              part.selections
                                                .process as keyof typeof displayNames.process
                                            ];
                                        } else if (
                                          step.component === "material" &&
                                          part.selections.material
                                        ) {
                                          selectedValue =
                                            displayNames.material[
                                              part.selections
                                                .material as keyof typeof displayNames.material
                                            ];
                                        } else if (
                                          step.component === "surface" &&
                                          part.selections.surfaceFinish
                                        ) {
                                          selectedValue =
                                            displayNames.surfaceFinish[
                                              part.selections
                                                .surfaceFinish as keyof typeof displayNames.surfaceFinish
                                            ];
                                        } else if (
                                          step.component === "coating" &&
                                          part.selections.coating
                                        ) {
                                          selectedValue =
                                            displayNames.coating[
                                              part.selections
                                                .coating as keyof typeof displayNames.coating
                                            ];
                                        } else if (
                                          step.component === "extras" &&
                                          part.selections.extras
                                        ) {
                                          const ex = part.selections.extras;
                                          // count a few meaningful picks to show a short label
                                          const count =
                                            (ex.tolerance &&
                                            ex.tolerance !== "standard"
                                              ? 1
                                              : 0) +
                                            ((ex.threads?.length || 0) > 0
                                              ? 1
                                              : 0) +
                                            (ex.inspection &&
                                            ex.inspection !== "none"
                                              ? 1
                                              : 0) +
                                            (ex.certificates &&
                                            (ex.certificates.material ||
                                              ex.certificates.finish ||
                                              ex.certificates.heatTreat)
                                              ? 1
                                              : 0) +
                                            (ex.serialization ? 1 : 0) +
                                            (ex.customMarking ? 1 : 0) +
                                            (ex.packaging &&
                                            (ex.packaging.bagPerPart ||
                                              ex.packaging.label)
                                              ? 1
                                              : 0);

                                          selectedValue =
                                            count > 0
                                              ? `${count} option${
                                                  count > 1 ? "s" : ""
                                                }`
                                              : "";
                                        }

                                        // Step colors - only apply when selected
                                        const stepColors = {
                                          process: "bg-green-500",
                                          material: "bg-green-500",
                                          surface: "bg-green-500",
                                          coating: "bg-blue-500",
                                          extras: "bg-purple-500",
                                        };

                                        // Check if this step has been selected
                                        const hasSelection =
                                          selectedValue !== "";

                                        return (
                                          <div
                                            key={step.id}
                                            className="flex items-center flex-1 min-w-0"
                                          >
                                            <div className="flex flex-col items-start flex-1 min-w-0">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPartStep(part.id, index);
                                                  if (!isExpanded) {
                                                    togglePartExpansion(
                                                      part.id,
                                                      e
                                                    );
                                                  }
                                                }}
                                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all mb-1 ${
                                                  hasSelection
                                                    ? `${
                                                        stepColors[
                                                          step.component as keyof typeof stepColors
                                                        ]
                                                      } text-white hover:opacity-90`
                                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                }`}
                                              >
                                                <StepIcon className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold whitespace-nowrap">
                                                  {step.name}
                                                </span>
                                              </button>
                                              <div
                                                className={`text-sm font-medium pl-1 truncate w-full ${
                                                  hasSelection
                                                    ? "text-slate-700"
                                                    : "text-slate-400"
                                                }`}
                                              >
                                                {selectedValue || "-"}
                                              </div>
                                            </div>
                                            {index < steps.length - 1 && (
                                              <div
                                                className="h-px bg-slate-300 flex-shrink-0 mx-2"
                                                style={{
                                                  width: "60px",
                                                  marginTop: "-16px",
                                                }}
                                              />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Quantity & Lead Time Section - Show when collapsed and fully configured */}
                                    {isComplete && totalPrice > 0 && (
                                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                                        {/* Quantity and Price Row */}
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                          {/* Quantity Input */}
                                          <div className="flex items-center gap-2">
                                            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                              Quantity:
                                            </label>
                                            <input
                                              type="number"
                                              min="1"
                                              value={part.selections.quantity}
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                const newQuantity = Math.max(
                                                  1,
                                                  parseInt(e.target.value) || 1
                                                );
                                                updatePartQuantity(
                                                  part.id,
                                                  newQuantity
                                                );
                                              }}
                                              className="w-20 px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                            />
                                          </div>

                                          {/* Total Price */}
                                          <div className="text-right">
                                            <div className="text-2xl font-bold text-green-700 leading-tight">
                                              ${totalPrice.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                              $
                                              {(
                                                totalPrice /
                                                part.selections.quantity
                                              ).toFixed(2)}{" "}
                                              per unit
                                            </div>
                                          </div>
                                        </div>

                                        {/* Lead Time Options */}
                                        <div>
                                          <div className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1.5">
                                            Lead Time Options
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(
                                              leadTimeMultipliers
                                            ).map(([days, multiplier]) => {
                                              const leadTimePrice =
                                                calculatePartPrice({
                                                  ...part,
                                                  selections: {
                                                    ...part.selections,
                                                    leadTime: days,
                                                  },
                                                });
                                              const isSelected =
                                                part.selections.leadTime ===
                                                days;
                                              return (
                                                <button
                                                  key={days}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    updatePartLeadTime(
                                                      part.id,
                                                      days
                                                    );
                                                  }}
                                                  className={`flex flex-col items-center px-3 py-1.5 rounded transition-all ${
                                                    isSelected
                                                      ? "bg-green-600 text-white shadow-md"
                                                      : "bg-white text-slate-700 hover:bg-green-100 border border-slate-200"
                                                  }`}
                                                >
                                                  <div
                                                    className={`text-xs font-bold ${
                                                      isSelected
                                                        ? "text-white"
                                                        : "text-green-600"
                                                    }`}
                                                  >
                                                    {days}d
                                                  </div>
                                                  <div
                                                    className={`text-[10px] font-medium ${
                                                      isSelected
                                                        ? "text-green-100"
                                                        : "text-slate-600"
                                                    }`}
                                                  >
                                                    ${leadTimePrice.toFixed(2)}
                                                  </div>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Expand/Collapse Button */}
                                <div className="flex items-center flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) =>
                                      togglePartExpansion(part.id, e)
                                    }
                                    className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Expandable Step Content */}
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-slate-200 bg-slate-50"
                              >
                                <div className="p-4">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Left side - Configuration Steps */}
                                    <div className="lg:col-span-2">
                                      {/* Step Content */}
                                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                                        {(() => {
                                          switch (currentStep.component) {
                                            case "process":
                                              return (
                                                <ProcessStep
                                                  selections={part.selections}
                                                  setSelections={(
                                                    newSelections
                                                  ) =>
                                                    updatePartSelections(
                                                      part.id,
                                                      newSelections
                                                    )
                                                  }
                                                  onNext={() =>
                                                    nextStep(part.id)
                                                  }
                                                />
                                              );
                                            case "material":
                                              return (
                                                <MaterialStep
                                                  selections={part.selections}
                                                  setSelections={(
                                                    newSelections
                                                  ) =>
                                                    updatePartSelections(
                                                      part.id,
                                                      newSelections
                                                    )
                                                  }
                                                  onNext={() =>
                                                    nextStep(part.id)
                                                  }
                                                  onPrev={() =>
                                                    prevStep(part.id)
                                                  }
                                                />
                                              );
                                            case "surface":
                                              return (
                                                <SurfaceFinishStep
                                                  selections={part.selections}
                                                  setSelections={(
                                                    newSelections
                                                  ) =>
                                                    updatePartSelections(
                                                      part.id,
                                                      newSelections
                                                    )
                                                  }
                                                  onNext={() =>
                                                    nextStep(part.id)
                                                  }
                                                  onPrev={() =>
                                                    prevStep(part.id)
                                                  }
                                                />
                                              );
                                            case "coating":
                                              return (
                                                <CoatingStep
                                                  selections={part.selections}
                                                  setSelections={(
                                                    newSelections
                                                  ) =>
                                                    updatePartSelectionsWithScroll(
                                                      part.id,
                                                      newSelections,
                                                      "coating"
                                                    )
                                                  }
                                                  onNext={() =>
                                                    nextStep(part.id)
                                                  }
                                                  onPrev={() =>
                                                    prevStep(part.id)
                                                  }
                                                />
                                              );
                                            case "extras":
                                              return (
                                                <ExtrasStep
                                                  selections={part.selections}
                                                  setSelections={(
                                                    newSelections
                                                  ) =>
                                                    updatePartSelections(
                                                      part.id,
                                                      newSelections
                                                    )
                                                  }
                                                  onNext={() =>
                                                    nextStep(part.id)
                                                  }
                                                  onPrev={() =>
                                                    prevStep(part.id)
                                                  }
                                                />
                                              );

                                            default:
                                              return null;
                                          }
                                        })()}

                                        {/* Step Navigation */}
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                                          <Button
                                            variant="outline"
                                            onClick={() => prevStep(part.id)}
                                            disabled={
                                              (part.currentStep || 0) === 0
                                            }
                                            className="flex items-center space-x-2"
                                          >
                                            <ArrowLeft className="w-4 h-4" />
                                            <span>Previous</span>
                                          </Button>

                                          <div className="text-sm text-slate-500">
                                            Step {(part.currentStep || 0) + 1}{" "}
                                            of {steps.length}
                                          </div>

                                          <Button
                                            onClick={() => nextStep(part.id)}
                                            disabled={
                                              (part.currentStep || 0) ===
                                              steps.length - 1
                                            }
                                            className="flex items-center space-x-2"
                                          >
                                            <span>Next</span>
                                            <ArrowRight className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right side - Quantity & Lead Time */}
                                    <div className="lg:col-span-1">
                                      <div
                                        id={`quantity-section-${part.id}`}
                                        className="bg-white rounded-lg border-2 border-blue-200 shadow-sm sticky top-4"
                                      >
                                        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                                          <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <span>Quantity & Lead Time</span>
                                          </h3>
                                          <p className="text-slate-600 text-sm mt-1">
                                            Adjust to see pricing comparisons
                                          </p>
                                        </div>

                                        <div className="p-4 space-y-4">
                                          {/* Quantity Section */}
                                          <div>
                                            <h4 className="text-sm font-semibold text-slate-800 mb-2">
                                              Quantity
                                            </h4>
                                            <Input
                                              type="number"
                                              min="1"
                                              max="10000"
                                              value={
                                                part.selections.quantity || 1
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  parseInt(e.target.value) || 1;
                                                updatePartQuantity(
                                                  part.id,
                                                  Math.max(
                                                    1,
                                                    Math.min(10000, value)
                                                  )
                                                );
                                              }}
                                              className="w-full text-center"
                                            />
                                          </div>

                                          {/* Lead Time Options */}
                                          <div className="space-y-3">
                                            <div>
                                              <h4 className="text-sm font-semibold text-slate-800 mb-1">
                                                Lead Time Options:
                                              </h4>
                                              <p className="text-xs text-slate-500">
                                                All Expedited options expire at:
                                                09-05-2025 03:00 PM (CST)
                                              </p>
                                            </div>

                                            <div className="space-y-2">
                                              {leadTimeOptions.map((option) => {
                                                const isSelected =
                                                  part.selections.leadTime ===
                                                  option.value;
                                                const basePrice =
                                                  calculatePartPrice({
                                                    ...part,
                                                    selections: {
                                                      ...part.selections,
                                                      leadTime: "7",
                                                    },
                                                  }) / leadTimeMultipliers["7"];
                                                const optionPrice =
                                                  basePrice * option.multiplier;
                                                const pricePerUnit =
                                                  optionPrice;
                                                const totalPrice =
                                                  pricePerUnit *
                                                  (part.selections.quantity ||
                                                    1);

                                                // Determine badge type
                                                const isExpedited = [
                                                  "1",
                                                  "2",
                                                  "3",
                                                  "5",
                                                ].includes(option.value);
                                                const badgeColor =
                                                  option.value === "7"
                                                    ? "bg-green-500"
                                                    : "bg-blue-500";
                                                const badgeLabel =
                                                  option.value === "7"
                                                    ? "Standard"
                                                    : "Expedited";

                                                return (
                                                  <button
                                                    key={option.value}
                                                    onClick={() =>
                                                      updatePartLeadTime(
                                                        part.id,
                                                        option.value
                                                      )
                                                    }
                                                    className={`w-full relative rounded-lg border-2 transition-all p-3 text-left ${
                                                      isSelected
                                                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300"
                                                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                                    }`}
                                                  >
                                                    {/* Radio button indicator */}
                                                    <div className="absolute top-3 left-3">
                                                      <div
                                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                          isSelected
                                                            ? "border-blue-600 bg-blue-600"
                                                            : "border-slate-300 bg-white"
                                                        }`}
                                                      >
                                                        {isSelected && (
                                                          <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                      </div>
                                                    </div>

                                                    <div className="pl-6">
                                                      <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-slate-700">
                                                          {option.label}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                          $
                                                          {pricePerUnit.toFixed(
                                                            2
                                                          )}{" "}
                                                          ea.
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center justify-between">
                                                        <span
                                                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${badgeColor}`}
                                                        >
                                                          {badgeLabel}
                                                        </span>
                                                        <span
                                                          className={`text-lg font-bold ${
                                                            isSelected
                                                              ? "text-blue-600"
                                                              : "text-slate-900"
                                                          }`}
                                                        >
                                                          $
                                                          {totalPrice.toFixed(
                                                            2
                                                          )}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 mb-6 transition-colors ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-2">
                      Drag & drop your 3D files here, or{" "}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports STL, STEP, OBJ, and more
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
