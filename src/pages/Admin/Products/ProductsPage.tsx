import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    toast({
      title: "Product deleted",
      description: "The product has been removed.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button className="btn-primary gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.material}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-secondary rounded-full text-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                  <td className="px-4 py-4">{product.rating}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-semibold mb-6">Add New Product</h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
                <input type="text" className="input-field w-full" placeholder="Enter product name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <input type="number" className="input-field w-full" placeholder="999" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="input-field w-full">
                    <option>Silk</option>
                    <option>Cotton</option>
                    <option>Premium</option>
                    <option>Designer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <input type="text" className="input-field w-full" placeholder="Maroon" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <input type="text" className="input-field w-full" placeholder="Pure Silk" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea className="input-field w-full" rows={3} placeholder="Product description..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input type="text" className="input-field w-full" placeholder="https://..." />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary">
                  Add Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
