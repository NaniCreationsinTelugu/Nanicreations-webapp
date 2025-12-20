"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import {
    getProductOptions,
    saveProductOptions,
    getProductVariants,
    saveProductVariants
} from "@/lib/actions/variants";
import { Separator } from "@/components/ui/separator";

interface VariantsManagerProps {
    productId: number;
}

interface Option {
    id?: number;
    name: string;
    values: string[];
}

interface Variant {
    id?: number;
    price: string;
    stock: number;
    sku: string;
    image: string;
    optionValues: { optionName: string; value: string; optionValueId?: number }[];
    optionValueIds?: number[]; // For saving
}

export default function VariantsManager({ productId }: VariantsManagerProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [productId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const fetchedOptions = await getProductOptions(productId);
            const fetchedVariants = await getProductVariants(productId);

            // Map DB structure to UI state
            // Map DB structure to UI state
            const mappedOptions = fetchedOptions.map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                values: opt.values.map((v: any) => v.name)
            }));

            const mappedVariants = fetchedVariants.map((v: any) => ({
                id: v.id,
                price: v.price?.toString() || "",
                stock: v.stock,
                sku: v.sku || "",
                image: v.image || "",
                optionValues: v.optionValues.map((ov: any) => ({
                    optionName: ov.optionValue.option.name,
                    value: ov.optionValue.name,
                    optionValueId: ov.optionValue.id
                }))
            }));

            setOptions(mappedOptions);
            setVariants(mappedVariants);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load variants data");
        } finally {
            setLoading(false);
        }
    };

    const addOption = () => {
        setOptions([...options, { name: "", values: [] }]);
    };

    const removeOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const updateOptionName = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    const addValueToOption = (index: number, value: string) => {
        if (!value.trim()) return;
        const newOptions = [...options];
        if (!newOptions[index].values.includes(value)) {
            newOptions[index].values.push(value);
        }
        setOptions(newOptions);
    };

    const removeValueFromOption = (optIndex: number, valIndex: number) => {
        const newOptions = [...options];
        newOptions[optIndex].values.splice(valIndex, 1);
        setOptions(newOptions);
    };

    const handleSaveOptions = async () => {
        setLoading(true);
        try {
            // Validate
            if (options.some(o => !o.name || o.values.length === 0)) {
                toast.error("All options must have a name and at least one value");
                setLoading(false);
                return;
            }

            await saveProductOptions(productId, options);
            toast.success("Options saved successfully");
            await loadData(); // Reload to get IDs
        } catch (error) {
            toast.error("Failed to save options");
        } finally {
            setLoading(false);
        }
    };

    const generateVariants = async () => {
        if (variants.length > 0) {
            if (!confirm("This will replace existing variants. Continue?")) return;
        }

        // Helper to generate cartesian product
        const cartesian = (args: string[][]) => {
            const r: string[][] = [];
            const max = args.length - 1;
            function helper(arr: string[], i: number) {
                for (let j = 0, l = args[i].length; j < l; j++) {
                    const a = arr.slice(0);
                    a.push(args[i][j]);
                    if (i === max) r.push(a);
                    else helper(a, i + 1);
                }
            }
            helper([], 0);
            return r;
        };

        const values = options.map(o => o.values);
        if (values.length === 0) return;

        const combinations = cartesian(values);

        // We need to fetch ID mappings again to be safe, but we rely on current state assuming it's synced
        // A better way is to rely on values matching name logic or ensure options are saved first.
        // For now, we insist on saving options first.
        const freshOptions = await getProductOptions(productId);

        const newVariants: any[] = combinations.map(combo => {
            const optionValueIds: number[] = [];
            const userFriendlyOptions: any[] = [];

            combo.forEach((valName, idx) => {
                const opt = freshOptions[idx];
                const valObj = opt.values.find(v => v.name === valName);
                if (valObj) {
                    optionValueIds.push(valObj.id);
                    userFriendlyOptions.push({
                        optionName: opt.name,
                        value: valObj.name
                    });
                }
            });

            return {
                price: "", // Inherit from parent product ideally, but blank for now
                stock: 0,
                sku: "",
                image: "",
                optionValueIds,
                optionValues: userFriendlyOptions
            };
        });

        setVariants(newVariants);
    };

    const handleSaveVariants = async () => {
        setLoading(true);
        try {
            await saveProductVariants(productId, variants);
            toast.success("Variants saved successfully");
            loadData();
        } catch (error) {
            toast.error("Failed to save variants");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pt-4">
            {/* Options Management */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Product Options</h3>
                    <Button onClick={addOption} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add Option
                    </Button>
                </div>

                {options.map((opt, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-muted/20 space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Option Name (e.g. Size, Kit Type)"
                                value={opt.name}
                                onChange={(e) => updateOptionName(idx, e.target.value)}
                            />
                            <Button onClick={() => removeOption(idx)} variant="destructive" size="icon">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {opt.values.map((val, vIdx) => (
                                <span key={vIdx} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center">
                                    {val}
                                    <button onClick={() => removeValueFromOption(idx, vIdx)} className="ml-2 hover:text-red-500">
                                        &times;
                                    </button>
                                </span>
                            ))}
                            <Input
                                className="w-40 h-8"
                                placeholder="Add Value + Enter"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addValueToOption(idx, e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </div>
                    </div>
                ))}

                {options.length > 0 && (
                    <Button onClick={handleSaveOptions} disabled={loading} className="w-full">
                        Save Options
                    </Button>
                )}
            </div>

            <Separator />

            {/* Variants Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Variants Preview</h3>
                    <Button onClick={generateVariants} size="sm" variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" /> Generate Variants
                    </Button>
                </div>

                {variants.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="p-3">Variant</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">SKU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((variant: Variant, idx: number) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-3 font-medium">
                                            {variant.optionValues.map(ov => ov.value).join(" / ")}
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                value={variant.price}
                                                onChange={(e) => {
                                                    const newV = [...variants];
                                                    newV[idx].price = e.target.value;
                                                    setVariants(newV);
                                                }}
                                                placeholder="Override Price"
                                                className="w-24"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                value={variant.stock}
                                                type="number"
                                                onChange={(e) => {
                                                    const newV = [...variants];
                                                    newV[idx].stock = parseInt(e.target.value) || 0;
                                                    setVariants(newV);
                                                }}
                                                className="w-20"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <Input
                                                value={variant.sku}
                                                onChange={(e) => {
                                                    const newV = [...variants];
                                                    newV[idx].sku = e.target.value;
                                                    setVariants(newV);
                                                }}
                                                placeholder="SKU"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No variants generated. Add options and click Generate.
                    </div>
                )}

                {variants.length > 0 && (
                    <Button onClick={handleSaveVariants} disabled={loading} className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Save Variants
                    </Button>
                )}
            </div>
        </div>
    );
}
