import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  SquarePen,
  ShoppingCart,
  ClipboardCheck,
  ArrowLeft,
  Plus,
  Edit2,
  Clipboard,
  EyeOff,
  Trash2,
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { toast } from "sonner";
import { useGetTheShopItemsQuery, useDeleteShopItemMutation } from "@/features/club/api/shopApiSlice";
import { useForClubOwnerOrderListQuery } from "@/features/club/api/shopOrderApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";
import { useClubPermissions } from "@/hooks/useClubPermissions";

const formatProductImage = (img?: string | null): string => {
  if (!img || img === 'null' || img.trim() === '') return '/Images/BottleImage.png';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) {
    if (img.startsWith('/Images/')) return img;
    return `https://api.ridewithpals.com${img}`;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

interface ProductType {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: string;
  status: "IN STOCK" | "LIMITED";
  image: string;
  gallery: string[];
  units?: number;
  sales?: string;
  code?: string;
}

const Product = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : 0;
  const permissions = useClubPermissions(clubId);

  const { data: shopData, isLoading } = useGetTheShopItemsQuery(
    { clubId, limit: 50, offset: 0 },
    { skip: !clubId }
  );

  const { data: ordersData } = useForClubOwnerOrderListQuery(
    { clubId, limit: 50, offset: 0 },
    { skip: !clubId }
  );

  const [deleteShopItem] = useDeleteShopItemMutation();

  const products = useMemo<ProductType[]>(() => {
    const rows = shopData?.rows || [];
    return rows.map((p) => {
      const formattedImg = formatProductImage(p.image);
      return {
        id: p.id,
        name: p.name || "Unnamed Item",
        sku: `SKU-${p.id}`,
        code: `PROD-${p.id}`,
        category: p.size || "General",
        price: p.price?.toString() || "0.00",
        status: p.isActive ? "IN STOCK" : "LIMITED",
        image: formattedImg,
        gallery: [formattedImg],
        units: 0,
        sales: "0"
      };
    });
  }, [shopData]);

  const activeOrdersCount = useMemo(() => {
    const rows = ordersData?.rows || [];
    return rows.filter((r) => r.statusName !== 'Cancelled' && r.statusName !== 'Delivered').length;
  }, [ordersData]);

  const pendingAuditCount = useMemo(() => {
    const rows = ordersData?.rows || [];
    return rows.filter((r) => r.statusName === 'Pending' || r.statusName === 'Processing').length;
  }, [ordersData]);

  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0).toFixed(2);
  }, [products]);

  const handleDelete = async (id: number) => {
    try {
      await deleteShopItem({ shopItemId: id }).unwrap();
      toast.success("Product deleted successfully!");
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete product.");
    }
  };

  const navigate = useNavigate();

  const handleSelectProduct = (product: ProductType) => {
    setSelectedProduct(product);
    setActiveImage(product.image);
    window.scrollTo(0, 0);
  };

  const columns = useMemo<Column<ProductType>[]>(() => {
    const baseCols: Column<ProductType>[] = [
      {
        key: "name",
        label: "Asset Description",
        sortable: true,
        render: (p) => (
          <div className="flex items-center gap-4">
            <img
              src={p.image}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover border border-border"
              alt={p.name}
            />
            <div>
              <p className="font-bold text-xs text-text-main">{p.name}</p>
              <p className="text-[9px] text-text-muted hidden md:block">{p.sku}</p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        label: "Classification",
        sortable: true,
        render: (p) => (
          <span className="bg-surface px-3 py-1 rounded w-fit text-[10px] border border-border hidden md:block text-text-muted">
            {p.category}
          </span>
        ),
      },
      {
        key: "price",
        label: "Unit Value",
        sortable: true,
        render: (p) => <span className="font-bold text-sm text-[#c99277]">${p.price}</span>,
      },
      {
        key: "status",
        label: "Inventory Status",
        sortable: true,
        render: (p) => (
          <div
            className={`px-2 py-0.5 rounded-full w-fit border text-[9px] ${p.status === "LIMITED" ? "text-orange-500 border-orange-500/30" : "text-green-500 border-green-500/30"}`}
          >
            {p.status}
          </div>
        ),
      },
    ];

    if (permissions.isAdmin) {
      baseCols.push({
        key: "actions",
        label: "",
        sortable: false,
        render: (p) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectProduct(p);
              }}
              className="bg-surface p-2 rounded-lg hover:bg-[#EB712B] hover:text-white text-text-muted transition-all cursor-pointer border border-border"
            >
              <SquarePen size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(p.id);
              }}
              className="bg-surface p-2 rounded-lg hover:bg-red-500 hover:text-white text-text-muted transition-all cursor-pointer border border-border"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      });
    }

    return baseCols;
  }, [permissions.isAdmin, selectedProduct]);

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
          <div className="w-10 h-10 rounded-lg bg-[#222]" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-[#222] rounded" />
            <div className="w-1/5 h-3 bg-[#222] rounded" />
          </div>
          <div className="w-16 h-4 bg-[#222] rounded" />
          <div className="w-20 h-6 bg-[#222] rounded-full" />
        </div>
      ))}
    </div>
  );

  if (selectedProduct) {
    return (
      <div className="bg-main-bg min-h-screen text-text-main p-6 md:p-12">
        <button
          onClick={() => setSelectedProduct(null)}
          className="text-text-muted mb-8 hover:text-text-main flex items-center gap-2 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to All Gear
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="bg-surface p-4 rounded-3xl border border-border">
              <img
                src={activeImage || selectedProduct.image}
                className="rounded-2xl w-full h-[300px] md:h-[400px] object-cover"
                alt={selectedProduct.name}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {selectedProduct.gallery.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`bg-surface p-2 rounded-2xl border cursor-pointer hover:border-[#EB712B] transition-colors ${activeImage === img ? "border-[#EB712B]" : "border-border"}`}
                >
                  <img
                    src={img}
                    className="rounded-xl w-full h-20 md:h-24 object-cover"
                    alt="thumbnail"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-text-main">
              {selectedProduct.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl md:text-4xl font-bold text-[#EB712B]">
                $ {selectedProduct.price}
              </span>
              <span className="bg-[#1a332a] text-green-500 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
                ● IN STOCK: {selectedProduct.units || 42} UNITS
              </span>
            </div>

            <p className="text-text-muted mb-8 leading-relaxed text-sm md:text-base">
              Engineered for elite performance. Our triple-insulated stainless
              steel construction keeps hydration at temperature for 24 hours,
              even in extreme environments.
            </p>

            {/* Display Club Code */}
            {selectedProduct.code && (
              <div className="mb-6 bg-surface px-4 py-3 rounded-xl border border-border w-fit">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Club Product Code</p>
                <p className="font-mono text-sm font-bold text-[#EB712B]">{selectedProduct.code}</p>
              </div>
            )}

            {/* Owner Info Grid */}
            <div className="grid grid-cols-3 gap-4 mb-10 pt-6 bg-surface p-6 rounded-2xl border border-border">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">
                  SKU
                </p>
                <p className="font-mono font-bold text-[#EB712B]">
                  {selectedProduct.sku || "EB-BOT-001"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">
                  TOTAL SALES
                </p>
                <p className="font-bold text-lg text-text-main">
                  {selectedProduct.sales || "1,248"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">
                  LAST MODIFIED
                </p>
                <p className="font-bold text-sm text-text-main">2 hours ago</p>
              </div>
            </div>

            {/* Owner Controls */}
            {permissions.isAdmin && (
              <>
                <div className="flex flex-wrap gap-4 pt-8">
                  <button
                    onClick={() => {
                      const productToEdit = {
                        ...selectedProduct,
                        image: activeImage,
                      };

                      navigate("/add-product", {
                        state: { product: productToEdit },
                      });
                    }}
                    className="flex-1 bg-surface border border-border hover:border-[#EB712B] text-text-main py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit2 size={18} /> Edit
                  </button>
                  <button className="flex-1 bg-surface border border-border hover:border-[#EB712B] text-text-main py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Clipboard size={18} /> Stock
                  </button>
                </div>

                <div className="pt-15">
                  <button className="w-full mt-4 py-4 border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <EyeOff size={18} /> Deactivate Listing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-text-main font-sans max-w-[1400px] mx-auto bg-main-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-text-main">
          High Performance <span className="text-[#EB712B]">Gear</span>
        </h1>
        {permissions.isAdmin && (
          <Link to="/add-product">
            <button className="bg-[#EB712B] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm cursor-pointer hover:bg-[#d66525]">
              <Plus size={18} /> Add new Product
            </button>
          </Link>
        )}
      </div>

      <div className="bg-surface p-4 md:p-6 rounded-2xl mb-8 border border-border overflow-hidden shadow-2xl">
        {isLoading ? <TableSkeleton /> : <DataTable data={products} columns={columns} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface p-6 rounded-2xl border border-border shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-main">Catalog & Inventory Summary</h3>
              <span className="text-[10px] font-extrabold bg-[#EB712B]/10 text-[#EB712B] px-3 py-1 rounded-full border border-[#EB712B]/20">
                Live Data
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center py-2">
              <div className="bg-hover p-4 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-text-muted">Total Products</p>
                <h4 className="text-xl md:text-2xl font-black text-text-main mt-1">{products.length}</h4>
              </div>
              <div className="bg-hover p-4 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-text-muted">Active Catalog Value</p>
                <h4 className="text-xl md:text-2xl font-black text-[#EB712B] mt-1">${totalCatalogValue}</h4>
              </div>
              <div className="bg-hover p-4 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-text-muted">Total Club Orders</p>
                <h4 className="text-xl md:text-2xl font-black text-text-main mt-1">{ordersData?.count || 0}</h4>
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4">
            Manage your club's official apparel, gear, and merchandise listings. Active orders are synced directly with your club shop orders API.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-surface p-6 rounded-2xl border border-[#EB712B]/30 flex justify-between items-center shadow-lg hover:border-[#EB712B]/60 transition-all">
            <div>
              <p className="text-text-muted text-xs uppercase font-bold">Active Orders</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 text-text-main">{activeOrdersCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center">
              <ShoppingCart className="text-[#EB712B]" size={22} />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-emerald-500/30 flex justify-between items-center shadow-lg hover:border-emerald-500/60 transition-all">
            <div>
              <p className="text-text-muted text-xs uppercase font-bold">Pending Audit</p>
              <h3 className="text-2xl md:text-3xl font-bold mt-1 text-text-main">{pendingAuditCount.toString().padStart(2, '0')}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ClipboardCheck className="text-emerald-500" size={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
