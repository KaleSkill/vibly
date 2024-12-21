'use client';

import { useProducts } from "@/contexts/ProductContext";
import { useRouter, useSearchParams } from "next/navigation";

export function ColorFilter() {
  const { colors, selectedColors, setSelectedColors } = useProducts();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleColorChange = (color: { _id: string; name: string; value: string }) => {
    const newColors = selectedColors.includes(color._id)
      ? selectedColors.filter((c) => c !== color._id)
      : [...selectedColors, color._id];

    setSelectedColors(newColors);

    const params = new URLSearchParams(searchParams.toString());
    if (newColors.length === 0) {
      params.delete("color");
    } else {
      params.set("color", newColors.join(","));
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Colors</h3>
      <div className="grid grid-cols-2 gap-2">
        {colors.map((color) => (
          <button
            key={color._id}
            onClick={() => handleColorChange(color)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              selectedColors.includes(color._id)
                ? "bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color.value }}
            />
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
} 