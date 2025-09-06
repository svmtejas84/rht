import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedFeatures?: string[];
  onFeaturesChange?: (features: string[]) => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  showBiodegradableOnly?: boolean;
  onBiodegradableChange?: (value: boolean) => void;
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "Clothing", label: "Clothing" },
  { value: "Home & Garden", label: "Home & Garden" },
  { value: "Electronics", label: "Electronics" },
  { value: "Beauty", label: "Beauty & Personal Care" },
  { value: "Food & Beverages", label: "Food & Beverages" },
  { value: "Sports & Outdoors", label: "Sports & Outdoors" },
];

const sustainabilityFeatures = [
  "Organic",
  "Recycled Materials",
  "Carbon Neutral",
  "Fair Trade",
  "Renewable Energy",
  "Zero Waste",
  "Biodegradable",
  "Vegan",
  "Non-Toxic",
  "Local Sourcing",
];

export default function ProductFilters({
  selectedCategory,
  onCategoryChange,
  selectedFeatures = [],
  onFeaturesChange = () => {},
  priceRange = [0, 10000],
  onPriceRangeChange = () => {},
  showBiodegradableOnly = false,
  onBiodegradableChange = () => {},
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      onFeaturesChange([...selectedFeatures, feature]);
    } else {
      onFeaturesChange(selectedFeatures.filter(f => f !== feature));
    }
  };

  const clearAllFilters = () => {
    onCategoryChange("");
    onFeaturesChange([]);
    onPriceRangeChange([0, 10000]);
    onBiodegradableChange(false);
    setLocalPriceRange([0, 10000]);
  };

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    selectedFeatures.length + 
    (showBiodegradableOnly ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0);

  return (
    <Card className="h-fit" data-testid="product-filters">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="active-filters-count">
                {activeFiltersCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
                data-testid="clear-all-filters"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={selectedCategory === category.value}
                  onCheckedChange={() => onCategoryChange(category.value)}
                  data-testid={`filter-category-${category.value || 'all'}`}
                />
                <Label
                  htmlFor={`category-${category.value}`}
                  className="text-sm cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h3 className="font-medium mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider
              value={localPriceRange}
              onValueChange={setLocalPriceRange}
              onValueCommit={onPriceRangeChange}
              max={10000}
              step={100}
              className="w-full"
              data-testid="price-range-slider"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="price-min">₹{localPriceRange[0].toLocaleString()}</span>
              <span data-testid="price-max">₹{localPriceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Eco-Friendly Options */}
        <div>
          <h3 className="font-medium mb-3">Eco-Friendly</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="biodegradable-only"
                checked={showBiodegradableOnly}
                onCheckedChange={onBiodegradableChange}
                data-testid="filter-biodegradable"
              />
              <Label htmlFor="biodegradable-only" className="text-sm cursor-pointer">
                Biodegradable only
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sustainability Features */}
        <div>
          <h3 className="font-medium mb-3">Sustainability Features</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sustainabilityFeatures.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={selectedFeatures.includes(feature)}
                  onCheckedChange={(checked) => handleFeatureToggle(feature, !!checked)}
                  data-testid={`filter-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label
                  htmlFor={`feature-${feature}`}
                  className="text-sm cursor-pointer"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium mb-3">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.value === selectedCategory)?.label}
                  </Badge>
                )}
                {selectedFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {showBiodegradableOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Biodegradable
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <Badge variant="secondary" className="text-xs">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
