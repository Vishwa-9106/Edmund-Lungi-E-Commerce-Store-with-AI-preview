import { useEffect, useRef, useState } from "react";
import { supabase } from "@/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  material: string | null;
  color: string | null;
  sizes: string[] | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [toggleBusyIds, setToggleBusyIds] = useState<Record<string, boolean>>({});

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>("");
  const [formCategory, setFormCategory] = useState("");
  const [formStockQuantity, setFormStockQuantity] = useState<string>("0");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    let alive = true;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (!alive) return;

        const { data, error } = await supabase.from("products").select("*");

        if (!alive) return;
        if (error) {
          setError(error.message || "Failed to load products");
          setProducts([]);
          return;
        }

        const rows = Array.isArray(data) ? (data as ProductRow[]) : [];
        setProducts(rows);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load products");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const resetAddForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormCategory("");
    setFormStockQuantity("0");
    setFormImageUrl("");
    setFormIsActive(true);
    setAddError(null);
  };

  const handleAddProduct = async () => {
    setAddError(null);

    const name = formName.trim();
    const priceNumber = Number(formPrice);

    if (!name) {
      setAddError("Product Name is required");
      return;
    }

    if (!Number.isFinite(priceNumber)) {
      setAddError("Price is required");
      return;
    }

    const stockNumber = formStockQuantity.trim() === "" ? 0 : Number(formStockQuantity);
    const originalPriceNumber = formOriginalPrice.trim() === "" ? null : Number(formOriginalPrice);

    if (!Number.isFinite(stockNumber)) {
      setAddError("Stock Quantity must be a number");
      return;
    }

    if (originalPriceNumber !== null && !Number.isFinite(originalPriceNumber)) {
      setAddError("Original Price must be a number");
      return;
    }

    setIsAdding(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setAddError(sessionError.message || "Failed to validate session");
        return;
      }

      if (!sessionData.session?.access_token) {
        setAddError("You must be logged in to add products");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          name,
          description: formDescription.trim() === "" ? null : formDescription,
          price: priceNumber,
          original_price: originalPriceNumber,
          category: formCategory.trim() === "" ? null : formCategory,
          stock_quantity: stockNumber,
          image_url: formImageUrl.trim() === "" ? null : formImageUrl,
          is_active: formIsActive,
        })
        .select("*")
        .single();

      if (error || !data) {
        setAddError(error?.message || "Failed to add product");
        return;
      }

      const created = data as ProductRow;

      setProducts((prev) => [created, ...prev]);
      setIsAddOpen(false);
      resetAddForm();
    } catch (e: any) {
      setAddError(e?.message || "Failed to add product");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    let previous: ProductRow[] | null = null;
    setDeleteBusyId(id);
    setProducts((prev) => {
      previous = prev;
      return prev.filter((p) => p.id !== id);
    });

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        if (previous) setProducts(previous);
        setError(error.message || "Failed to delete product");
      }
    } catch (e: any) {
      if (previous) setProducts(previous);
      setError(e?.message || "Failed to delete product");
    } finally {
      setDeleteBusyId((v) => (v === id ? null : v));
    }
  };

  const handleToggleVisible = async (id: string, next: boolean) => {
    const prevRow = products.find((p) => p.id === id);
    if (!prevRow) return;

    setToggleBusyIds((m) => ({ ...m, [id]: true }));
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: next } : p)));

    try {
      const { error } = await supabase.from("products").update({ is_active: next }).eq("id", id);
      if (error) {
        setProducts((prev) => prev.map((p) => (p.id === id ? prevRow : p)));
        setError(error.message || "Failed to update product");
      }
    } catch (e: any) {
      setProducts((prev) => prev.map((p) => (p.id === id ? prevRow : p)));
      setError(e?.message || "Failed to update product");
    } finally {
      setToggleBusyIds((m) => ({ ...m, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-2xl shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-end pb-4">
              <Button
                type="button"
                onClick={() => {
                  resetAddForm();
                  setIsAddOpen(true);
                }}
              >
                Add Product
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                {error ? <div className="pb-4 text-sm text-destructive">{error}</div> : null}

                {products.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No products found</div>
                ) : (
                  <>
                    <div className="grid gap-3 md:hidden">
                      {products.map((p) => (
                        <div key={p.id} className="rounded-xl border bg-background p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium text-foreground">{p.price}</span>
                                {p.original_price != null ? (
                                  <span className="ml-2 text-muted-foreground line-through">{p.original_price}</span>
                                ) : null}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <Switch
                                checked={p.is_active}
                                disabled={!!toggleBusyIds[p.id]}
                                onCheckedChange={(next) => handleToggleVisible(p.id, next)}
                                aria-label="Visible"
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Category</div>
                              <div className="truncate">{p.category ?? ""}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Color</div>
                              <div className="truncate">{p.color ?? ""}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">Stock</div>
                              <div className="truncate">{p.stock_quantity}</div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-muted-foreground">ID</div>
                              <div className="truncate">{p.id}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                  disabled={deleteBusyId === p.id}
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this product?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProduct(p.id)}
                                    disabled={deleteBusyId === p.id}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="hidden md:block">
                      <div className="w-full overflow-x-auto overscroll-x-contain [scrollbar-gutter:stable]">
                        <div className="min-w-max">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="p-2 lg:p-4">ID</TableHead>
                                <TableHead className="p-2 lg:p-4">Name</TableHead>
                                <TableHead className="p-2 lg:p-4">Description</TableHead>
                                <TableHead className="p-2 lg:p-4">Price</TableHead>
                                <TableHead className="p-2 lg:p-4">Original Price</TableHead>
                                <TableHead className="p-2 lg:p-4">Category</TableHead>
                                <TableHead className="p-2 lg:p-4">Material</TableHead>
                                <TableHead className="p-2 lg:p-4">Color</TableHead>
                                <TableHead className="p-2 lg:p-4">Sizes</TableHead>
                                <TableHead className="p-2 lg:p-4">Stock</TableHead>
                                <TableHead className="p-2 lg:p-4">Image URL</TableHead>
                                <TableHead className="p-2 lg:p-4">Visible</TableHead>
                                <TableHead className="p-2 lg:p-4">Created At</TableHead>
                                <TableHead className="p-2 lg:p-4 text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {products.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{p.id}</TableCell>
                                  <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{p.name}</TableCell>
                                  <TableCell className="max-w-[320px] p-2 lg:p-4">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className="block truncate cursor-default"
                                          tabIndex={0}
                                          role="button"
                                        >
                                          {p.description ?? ""}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[320px] whitespace-pre-wrap break-words">
                                        {p.description ?? ""}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.price}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.original_price ?? ""}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.category ?? ""}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.material ?? ""}</TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.color ?? ""}</TableCell>
                                  <TableCell className="max-w-[240px] p-2 lg:p-4">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className="block truncate cursor-default"
                                          tabIndex={0}
                                          role="button"
                                        >
                                          {p.sizes?.join(", ") ?? ""}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[320px] whitespace-pre-wrap break-words">
                                        {p.sizes?.join(", ") ?? ""}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell className="p-2 lg:p-4">{p.stock_quantity}</TableCell>
                                  <TableCell className="max-w-[260px] p-2 lg:p-4">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className="block truncate cursor-default"
                                          tabIndex={0}
                                          role="button"
                                        >
                                          {p.image_url ?? ""}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[320px] whitespace-pre-wrap break-words">
                                        {p.image_url ?? ""}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell className="p-2 lg:p-4">
                                    <Switch
                                      checked={p.is_active}
                                      disabled={!!toggleBusyIds[p.id]}
                                      onCheckedChange={(next) => handleToggleVisible(p.id, next)}
                                      aria-label="Visible"
                                    />
                                  </TableCell>
                                  <TableCell className="max-w-[220px] truncate p-2 lg:p-4">{p.created_at}</TableCell>
                                  <TableCell className="p-2 lg:p-4 text-right">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="max-w-full whitespace-nowrap"
                                          disabled={deleteBusyId === p.id}
                                        >
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this product?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteProduct(p.id)}
                                            disabled={deleteBusyId === p.id}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <Dialog
              open={isAddOpen}
              onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) resetAddForm();
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Product</DialogTitle>
                  <DialogDescription>Fill in the details below to create a new product.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product-description">Description</Label>
                    <Textarea
                      id="product-description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="product-original-price">Original Price</Label>
                      <Input
                        id="product-original-price"
                        type="number"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="product-category">Category</Label>
                      <Input
                        id="product-category"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="product-stock">Stock Quantity</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        value={formStockQuantity}
                        onChange={(e) => setFormStockQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="product-image-url">Image URL</Label>
                    <Input
                      id="product-image-url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                    <Label htmlFor="product-active">Active Status</Label>
                    <Switch id="product-active" checked={formIsActive} onCheckedChange={setFormIsActive} />
                  </div>

                  {addError ? <div className="text-sm text-destructive">{addError}</div> : null}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddOpen(false);
                      resetAddForm();
                    }}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddProduct} disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
