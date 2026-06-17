import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  SquarePen, ChevronRight, 
  ChevronLeft, ShoppingCart, ClipboardCheck, ArrowLeft, 
   Plus, Edit2, Clipboard, EyeOff 
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const chartData = [
  { name: 'Jan', val1: 40, val2: 24 },
  { name: 'Feb', val1: 30, val2: 13 },
  { name: 'Mar', val1: 60, val2: 30 },
  { name: 'Apr', val1: 20, val2: 20 },
  { name: 'May', val1: 80, val2: 45 },
  { name: 'Jun', val1: 50, val2: 30 },
  { name: 'Jul', val1: 90, val2: 55 },
];

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
}

const products: ProductType[] = [
  { id: 1, name: "Water Bottle", sku: "SKU-01", category: "EQUIPMENT", price: "20.00", status: "IN STOCK", image: "/Images/BottleImage.png", gallery: ["/Images/BottleImage.png", "/Images/BottleImage2.png", "/Images/BottleImage4.png"] },
  { id: 2, name: "Bicycle Helmet", sku: "SKU-02", category: "SAFETY", price: "20.00", status: "LIMITED", image: "/Images/headImage.png", gallery: ["/Images/headImage.png", "/Images/HelmetImage3.jpg", "/Images/HelmetImage4.jpg"] },
  { id: 3, name: "Pro Gloves", sku: "SKU-03", category: "APPAREL", price: "20.00", status: "IN STOCK", image: "/Images/cyclingGloveImage.png", gallery: ["/Images/cyclingGloveImage.png", "/Images/CycleGloves.jfif", "/Images/CycleGloves2.jfif"] },
  { id: 4, name: "Tech Jersey", sku: "SKU-04", category: "APPAREL", price: "45.00", status: "IN STOCK", image: "/Images/cycleJeresyImage.jfif", gallery: ["/Images/cycleJeresyImage.jfif"] },
  { id: 5, name: "Cycling Shoes", sku: "SKU-05", category: "EQUIPMENT", price: "120.00", status: "IN STOCK", image: "/Images/shoesImage.png", gallery: ["/Images/shoesImage.png"] },
  { id: 6, name: "Repair Kit", sku: "SKU-06", category: "EQUIPMENT", price: "15.00", status: "IN STOCK", image: "/Images/repairImage.jpg", gallery: ["/Images/repairImage.jpg"] },
  { id: 7, name: "Speed Glasses", sku: "SKU-07", category: "SAFETY", price: "35.00", status: "LIMITED", image: "/Images/SpeedGlassesImage.jpg", gallery: ["/Images/SpeedGlassesImage.jpg"] },
  { id: 8, name: "Smart Watch", sku: "SKU-08", category: "EQUIPMENT", price: "199.00", status: "LIMITED", image: "/Images/SmartWatch.jpg", gallery: ["/Images/SmartWatch.jpg"] },
  { id: 9, name: "Bike Pump", sku: "SKU-09", category: "EQUIPMENT", price: "30.00", status: "IN STOCK", image: "/Images/CyclePump.jpg", gallery: ["/Images/CyclePump.jpg"] },
  { id: 10, name: "Cycle", sku: "SKU-09", category: "Ride", price: "100.00", status: "LIMITED", image: "/Images/cycleImage6.png", gallery: ["/Images/cycleImage6.png"] }
];

const Product = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const handleSelectProduct = (product: ProductType) => {
    setSelectedProduct(product);
    setActiveImage(product.image);
    window.scrollTo(0, 0);
  };

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage]);

  if (selectedProduct) {
    return (
      <div className="bg-[#111111] min-h-screen text-white p-6 md:p-12">
        <button onClick={() => setSelectedProduct(null)} className="text-gray-400 mb-8 hover:text-white flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to All Gear
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="bg-[#111111] p-4 rounded-3xl border border-white/5">
              <img src={activeImage || selectedProduct.image} className="rounded-2xl w-full h-[300px] md:h-[400px] object-cover" alt={selectedProduct.name} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {selectedProduct.gallery.map((img, i) => (
                <div key={i} onClick={() => setActiveImage(img)} className={`bg-[#111111] p-2 rounded-2xl border cursor-pointer hover:border-[#EB712B] transition-colors ${activeImage === img ? 'border-[#EB712B]' : 'border-white/5'}`}>
                  <img src={img} className="rounded-xl w-full h-20 md:h-24 object-cover" alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>

         <div>
  <h1 className="text-3xl md:text-5xl font-bold mb-2">{selectedProduct.name}</h1>
  
  <div className="flex items-center gap-4 mb-6">
    <span className="text-2xl md:text-4xl font-bold text-[#EB712B]">$ {selectedProduct.price}</span>
    <span className="bg-[#1a332a] text-green-500 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
      ● IN STOCK: {selectedProduct.units || 42} UNITS
    </span>
  </div>

  <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
    Engineered for elite performance. Our triple-insulated stainless steel construction keeps hydration at temperature for 24 hours, even in extreme environments.
  </p>

  {/* Owner Info Grid */}
  <div className="grid grid-cols-3 gap-4 mb-10 pt-10 bg-[#111111] p-6 rounded-2xl border border-white/5">
    <div>
      <p className="text-[10px] text-gray-500 uppercase font-bold">SKU</p>
      <p className="font-mono font-bold text-[#EB712B]">{selectedProduct.sku || 'EB-BOT-001'}</p>
    </div>
    <div>
      <p className="text-[10px] text-gray-500 uppercase font-bold">TOTAL SALES</p>
      <p className="font-bold text-lg">{selectedProduct.sales || '1,248'}</p>
    </div>
    <div>
      <p className="text-[10px] text-gray-500 uppercase font-bold">LAST MODIFIED</p>
      <p className="font-bold text-sm">2 hours ago</p>
    </div>
  </div>

  {/* Owner Controls */}
  <div className="flex flex-wrap gap-4 pt-8">
  
   <button 
  onClick={() => {
    
    const productToEdit = {
      ...selectedProduct,
      image: activeImage
    };
    
    navigate('/add-product', { state: { product: productToEdit } });
  }}
  className="flex-1 bg-[#111111] border border-white/10 hover:border-white/20 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
>
  <Edit2 size={18} /> Edit
</button>
    <button className="flex-1 bg-[#111111] border border-white/10 hover:border-white/20 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
      <Clipboard size={18} /> Stock
    </button>
  </div>

  <div className= "pt-15">
    <button className="w-full mt-4 py-4 border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/5 transition-all flex items-center justify-center gap-2">
  <EyeOff size={18} /> Deactivate Listing
</button>
  </div>
</div>
        </div>

        
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-white font-sans max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          High Performance <span className="text-[#EB712B]">Gear</span>
        </h1>
        <Link to="/add-product">
  <Link to="/add-product">
  <button className="bg-[#EB712B] hover:bg-[#c95f1f] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm">
    <Plus size={18} /> Add new Product
  </button>
</Link>
</Link>
      </div>

      <div className="bg-[#111111] p-4 md:p-6 rounded-2xl mb-8 border border-white/5 overflow-x-auto">
        <div className="grid grid-cols-4 md:grid-cols-5 text-[#888] text-[10px] font-bold uppercase mb-6 px-4 min-w-[600px]">
          <span>Asset Description</span>
          <span className="hidden md:block">Classification</span>
          <span>Unit Value</span>
          <span>Inventory Status</span>
          <span className="text-right">Operations</span>
        </div>

        {paginatedProducts.map((p) => (
          <div key={p.id} className="grid grid-cols-4 md:grid-cols-5 items-center py-4 border-t border-white/5 px-4 hover:bg-white/5 rounded-xl group min-w-[600px]">
            <div className="flex items-center gap-4">
              <img src={p.image} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" alt={p.name} />
              <div>
                <p className="font-bold text-xs">{p.name}</p>
                <p className="text-[9px] text-gray-500 hidden md:block">{p.sku}</p>
              </div>
            </div>
            <span className="bg-[#1a1a1a] px-3 py-1 rounded w-fit text-[10px] border border-white/5 hidden md:block">
              {p.category}
            </span>
            <span className="font-bold text-sm text-[#c99277]">${p.price}</span>
            <div className={`px-2 py-0.5 rounded-full w-fit border text-[9px] ${p.status === "LIMITED" ? "text-orange-500 border-orange-500/30" : "text-green-500 border-green-500/30"}`}>
              {p.status}
            </div>
            {/* Operations button appears on group hover */}
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={() => handleSelectProduct(p)} className="bg-white/5 p-2 rounded-lg hover:bg-[#EB712B] transition-all">
                <SquarePen size={14} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-white/5">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-[#EB712B] transition-all disabled:opacity-30">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-gray-500">Page {currentPage}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(products.length / itemsPerPage)))} disabled={currentPage >= Math.ceil(products.length / itemsPerPage)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-[#EB712B] transition-all disabled:opacity-30">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-[#111111] p-4 md:p-6 rounded-2xl border border-white/5 h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
               <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
               <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
               <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
               <Line type="monotone" dataKey="val1" stroke="#EB712B" strokeWidth={3} dot={false} />
               <Line type="monotone" dataKey="val2" stroke="#8884d8" strokeWidth={3} dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-4">
            <div className="bg-[#111111] p-6 rounded-2xl border border-[#EB712B]/50 flex justify-between items-center">
                <div><p className="text-gray-400 text-xs uppercase">Active Orders</p><h3 className="text-2xl md:text-3xl font-bold mt-2">124</h3></div>
                <ShoppingCart className="text-[#EB712B]" size={24} />
            </div>
            <div className="bg-[#111111] p-6 rounded-2xl border border-green-500/50 flex justify-between items-center">
                <div><p className="text-gray-400 text-xs uppercase">Pending Audit</p><h3 className="text-2xl md:text-3xl font-bold mt-2">08</h3></div>
                <ClipboardCheck className="text-green-500" size={24} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Product;