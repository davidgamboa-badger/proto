"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Clock,
  Info,
  Minus,
  Plus,
  FileText,
  Package,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Mock pricing data based on configurations
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

const leadTimeOptions = [
  {
    value: "1",
    label: "1 Day",
    type: "expedited",
    multiplier: 2.5,
    description: "Express",
  },
  {
    value: "2",
    label: "2 Days",
    type: "expedited",
    multiplier: 2.1,
    description: "Rush",
  },
  {
    value: "3",
    label: "3 Days",
    type: "expedited",
    multiplier: 1.7,
    description: "Fast",
  },
  {
    value: "5",
    label: "5 Days",
    type: "expedited",
    multiplier: 1.3,
    description: "Quick",
  },
  {
    value: "7",
    label: "7 Days",
    type: "standard",
    multiplier: 1.0,
    description: "Standard",
  },
];

const leadTimeMultipliers = {
  "1": 2.5,
  "2": 2.1,
  "3": 1.7,
  "5": 1.3,
  "7": 1.0,
};

// Additional Requirements Categories
const requirementCategories = [
  {
    id: "material-finish-compliance",
    name: "Material and Finish Compliance",
    options: [
      { id: "astm", name: "ASTM" },
      { id: "reach", name: "REACH" },
      { id: "rohs", name: "ROHS" },
      { id: "finish-cert", name: "Finish Certificate" },
      { id: "coating-cert", name: "Coating Certificate" },
      { id: "heat-treat-cert", name: "Heat Treat Certificate" },
      { id: "material-cert", name: "Material Certificate" },
    ],
  },
  {
    id: "material-drawing",
    name: "Material and Drawing Requirements",
    options: [
      { id: "first-article", name: "First Article Inspection" },
      { id: "cmm-report", name: "CMM Report" },
      { id: "drawing-review", name: "Drawing Review" },
      { id: "material-traceability", name: "Material Traceability" },
    ],
  },
  {
    id: "government",
    name: "Government Restrictions",
    options: [
      { id: "itar", name: "ITAR Compliance" },
      { id: "dfar", name: "DFAR" },
      { id: "far", name: "FAR" },
      { id: "nato", name: "NATO Compliance" },
    ],
  },
  {
    id: "quality",
    name: "Quality Requirements",
    options: [
      { id: "iso-9001", name: "ISO 9001" },
      { id: "as9100", name: "AS9100" },
      { id: "iso-13485", name: "ISO 13485" },
      { id: "ppap", name: "PPAP Documentation" },
      { id: "inspection-report", name: "Inspection Report" },
    ],
  },
  {
    id: "shipping",
    name: "Shipping Requirements",
    options: [
      { id: "special-packaging", name: "Special Packaging" },
      { id: "expedited-shipping", name: "Expedited Shipping" },
      { id: "white-glove", name: "White Glove Delivery" },
      { id: "international", name: "International Shipping" },
    ],
  },
  {
    id: "certificate",
    name: "Certificate Requirements",
    options: [
      { id: "coc", name: "Certificate of Conformance" },
      { id: "calibration", name: "Calibration Certificate" },
      { id: "test-cert", name: "Test Certificate" },
      { id: "origin-cert", name: "Certificate of Origin" },
    ],
  },
  {
    id: "misc",
    name: "Miscellaneous Requirements",
    options: [
      { id: "clean-room", name: "Clean Room Assembly" },
      { id: "serialization", name: "Part Serialization" },
      { id: "custom-marking", name: "Custom Marking" },
      { id: "assembly", name: "Assembly Services" },
    ],
  },
];

interface Part {
  id: string;
  name: string;
  fileName?: string;
  fileSize?: number;
  selections: {
    process: string;
    material: string;
    surfaceFinish: string;
    coating: string;
    quantity: number;
    leadTime: string;
  };
}

interface QuoteSidebarProps {
  selections: any;
  setSelections: (selections: any) => void;
  parts?: Part[];
  activePart?: string | null;
}

export function QuoteSidebar({
  selections,
  setSelections,
  parts = [],
  activePart,
}: QuoteSidebarProps) {
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [requirementsExpanded, setRequirementsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [expediteOnly, setExpediteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [orderZip, setOrderZip] = useState("");
  const TAX_RATE = 0.0875; // keep hardcoded for now
  const zipTouched = orderZip.length > 0;
  const isZipValid = /^\d{5}(-\d{4})?$/.test(orderZip); // simple US ZIP/ZIP+4

  // Handle option toggle
  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  // Filter options based on search
  const getFilteredOptions = (category: (typeof requirementCategories)[0]) => {
    if (!searchQuery) return category.options;
    return category.options.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

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

  const completeParts = parts.filter(
    (p) =>
      p.selections.process &&
      p.selections.material &&
      p.selections.surfaceFinish &&
      p.selections.coating
  );
  const subtotal = completeParts.reduce(
    (sum, part) => sum + calculatePartPrice(part),
    0
  );

  const tax = zipTouched ? subtotal * TAX_RATE : 0;
  const total = subtotal + tax;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-slate-900">
          <FileText className="w-5 h-5" />
          <span>Quote Summary</span>
        </CardTitle>
        <p className="text-sm text-slate-500">
          {parts.length} part{parts.length !== 1 ? "s" : ""} •{" "}
          {completeParts.length} configured
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parts List */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Parts</span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {parts.length > 0 ? (
              parts.map((part) => {
                const isComplete =
                  part.selections.process &&
                  part.selections.material &&
                  part.selections.surfaceFinish &&
                  part.selections.coating;
                const partPrice = isComplete ? calculatePartPrice(part) : 0;

                return (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {part.name}
                      </p>
                      {isComplete ? (
                        <p className="text-xs text-slate-500">
                          Qty: {part.selections.quantity} • $
                          {(partPrice / part.selections.quantity).toFixed(2)}{" "}
                          each
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600">
                          Configuration incomplete
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {isComplete ? (
                        <div className="text-sm font-semibold text-slate-900">
                          ${partPrice.toFixed(2)}
                        </div>
                      ) : (
                        <div className={`w-3 h-3 rounded-full bg-slate-300`} />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No parts added yet</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Requirements (Order-wide) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Order Requirements</span>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                applies to all parts
              </span>
            </h4>
            {selectedOptions.size > 0 && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                {selectedOptions.size} selected
              </span>
            )}
          </div>

          <button
            onClick={() => setRequirementsExpanded(!requirementsExpanded)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            aria-expanded={requirementsExpanded}
          >
            <div className="flex items-center gap-2">
              {requirementsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium text-slate-800">
                Configure order-wide requirements
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              ITAR, ISO, shipping, certificates…
            </span>
          </button>

          <AnimatePresence>
            {requirementsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Search and Expedite Toggle */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search requirements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <Switch
                      checked={expediteOnly}
                      onCheckedChange={setExpediteOnly}
                      id="expedite-only"
                    />
                    <label
                      htmlFor="expedite-only"
                      className="text-sm text-slate-700 cursor-pointer"
                    >
                      Expedite Only
                    </label>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {requirementCategories.map((category) => {
                    const filteredOptions = getFilteredOptions(category);
                    if (searchQuery && filteredOptions.length === 0)
                      return null;

                    return (
                      <div key={category.id} className="space-y-2">
                        {/* Category Radio Button */}
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="requirement-category"
                            checked={selectedCategory === category.id}
                            onChange={() =>
                              setSelectedCategory(
                                selectedCategory === category.id
                                  ? null
                                  : category.id
                              )
                            }
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900 font-medium">
                            {category.name}
                          </span>
                        </label>

                        {/* Category Options (show when category is selected) */}
                        <AnimatePresence>
                          {selectedCategory === category.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-6 space-y-1.5 overflow-hidden"
                            >
                              {filteredOptions.map((option) => (
                                <label
                                  key={option.id}
                                  className="flex items-center space-x-2 cursor-pointer group py-1"
                                >
                                  <Checkbox
                                    checked={selectedOptions.has(option.id)}
                                    onCheckedChange={() =>
                                      toggleOption(option.id)
                                    }
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-slate-600 group-hover:text-slate-900">
                                    {option.name}
                                  </span>
                                </label>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Requirements Summary */}
                {selectedOptions.size > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">
                      Selected Requirements:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(selectedOptions).map((optionId) => {
                        const option = requirementCategories
                          .flatMap((cat) => cat.options)
                          .find((opt) => opt.id === optionId);
                        if (!option) return null;
                        return (
                          <span
                            key={optionId}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex items-center space-x-1"
                          >
                            <span>{option.name}</span>
                            <button
                              onClick={() => toggleOption(optionId)}
                              className="hover:bg-blue-700 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Enter any other special requirements or notes..."
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Tax Location */}
        <div className="space-y-2">
          <h4 className="font-medium text-slate-900 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>Tax Location</span>
          </h4>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter ZIP (e.g., 60601)"
              value={orderZip}
              onChange={(e) => setOrderZip(e.target.value.trim())}
              className="h-9"
              inputMode="numeric"
              aria-label="ZIP code"
            />
            <span
              className={`text-xs ${
                zipTouched && !isZipValid ? "text-amber-700" : "text-slate-500"
              }`}
            >
              {zipTouched
                ? isZipValid
                  ? "ZIP received. Estimating tax…"
                  : "Invalid ZIP format"
                : "Enter ZIP to estimate sales tax"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Prototype preview uses a fixed {Math.round(TAX_RATE * 1000) / 10}%
            rate.
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Pricing Summary</h4>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Estimated Shipping</span>
              <span className="font-medium text-slate-900">$25.00</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Sales Tax {zipTouched && isZipValid ? `(ZIP ${orderZip})` : ""}
              </span>
              <span className="font-medium text-slate-900">
                {zipTouched && isZipValid ? `$${tax.toFixed(2)}` : "—"}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-lg font-semibold text-slate-900">
                Total
              </span>
              <span className="text-2xl font-bold text-blue-600">
                $
                {(subtotal + (zipTouched && isZipValid ? tax + 25 : 0)).toFixed(
                  2
                )}
              </span>
            </div>
          </div>

          {completeParts.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 flex items-center justify-center space-x-1">
                <Info className="w-4 h-4" />
                <span>Configure parts to see pricing</span>
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={completeParts.length === 0}
            onClick={() => {
              // Generate quote ID and navigate to checkout
              const quoteId = `QUOTE-${Date.now()}`;
              window.location.href = `/checkout?quoteId=${quoteId}`;
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Request Quote ({completeParts.length} part
            {completeParts.length !== 1 ? "s" : ""})
          </Button>
          <p className="text-[11px] text-slate-500 text-center">
            Order Requirements apply to the entire quote.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              alert("Save quote functionality would be implemented here.");
            }}
          >
            Save Quote
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Questions? Contact our team for custom quotes and volume pricing
          </p>
          <Button
            variant="link"
            className="text-xs text-blue-600 p-0 h-auto"
            onClick={() => {
              alert("Contact form functionality would be implemented here.");
            }}
          >
            Get Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
