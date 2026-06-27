import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { supabase } from '../database/connect';
import env from '../config/env';

const logFile = path.join(__dirname, '../../seeding.log');
function log(msg: string) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

const productsData = [
  // 1
  {
    name: 'Quantum Silk Jacket',
    slug: 'quantum-silk-jacket',
    description: 'Premium luxury jacket featuring algorithmic tailoring, thermo-regulation, and quantum silk fabric with cybernetic detailing.',
    basePrice: 850,
    salePrice: 720,
    category: 'Jackets',
    collections: ['new-arrivals', 'digital-couture'],
    tags: ['outerwear', 'silk', 'techwear', 'waterproof'],
    isFeatured: true,
    isActive: true,
    popularity: 95,
    variants: [
      { sku: 'QSJ-WHT-S', color: '#ffffff', colorName: 'White', size: 'S', stock: 10, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] },
      { sku: 'QSJ-WHT-M', color: '#ffffff', colorName: 'White', size: 'M', stock: 15, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] },
      { sku: 'QSJ-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 8, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 2
  {
    name: 'Neural Mesh Shirt',
    slug: 'neural-mesh-shirt',
    description: 'Ultra-breathable reactive mesh shirt designed for cybernetic environments, combining active cooling vents with clean lines.',
    basePrice: 450,
    category: 'Shirts',
    collections: ['new-arrivals', 'summer-edit'],
    tags: ['breathable', 'mesh', 'cyber', 'summer'],
    isFeatured: true,
    isActive: true,
    popularity: 88,
    variants: [
      { sku: 'NMS-BLK-S', color: '#000000', colorName: 'Black', size: 'S', stock: 10, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] },
      { sku: 'NMS-BLK-L', color: '#000000', colorName: 'Black', size: 'L', stock: 12, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] }
    ]
  },
  // 3
  {
    name: 'Glass Couture Gown',
    slug: 'glass-couture-gown',
    description: 'Bespoke hand-crafted evening gown reflecting light like glass panes, utilizing high-index polymers and silk lining.',
    basePrice: 2400,
    salePrice: 1950,
    category: 'Gowns',
    collections: ['evening-couture', 'limited-edition'],
    tags: ['evening', 'couture', 'bespoke', 'wedding'],
    isFeatured: true,
    isActive: true,
    popularity: 99,
    variants: [
      { sku: 'GCG-SLV-S', color: '#c0c0c0', colorName: 'Silver', size: 'S', stock: 5, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] },
      { sku: 'GCG-SLV-M', color: '#c0c0c0', colorName: 'Silver', size: 'M', stock: 3, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] }
    ]
  },
  // 4
  {
    name: 'Neon Cyber Blazer',
    slug: 'neon-cyber-blazer',
    description: 'Avant-garde blazer embedded with photoluminescent fibers, featuring signature geometric lapels.',
    basePrice: 950,
    category: 'Blazers',
    collections: ['editorial-picks', 'ai-collection'],
    tags: ['neon', 'blazer', 'editorial', 'smart'],
    isFeatured: true,
    isActive: true,
    popularity: 91,
    variants: [
      { sku: 'NCB-NEO-M', color: '#39ff14', colorName: 'Neon Green', size: 'M', stock: 8, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b-a303027c1d8b?q=80&w=1000'] }
    ]
  },
  // 5
  {
    name: 'Minimalist Drape Trousers',
    slug: 'minimalist-drape-trousers',
    description: 'High-waisted luxury wool trousers featuring structured pleats and flowing silhouette.',
    basePrice: 580,
    category: 'Trousers',
    collections: ['limited-edition', 'heritage-collection'],
    tags: ['minimalist', 'wool', 'luxury', 'trousers'],
    isFeatured: false,
    isActive: true,
    popularity: 76,
    variants: [
      { sku: 'MDT-GRY-M', color: '#808080', colorName: 'Grey', size: 'M', stock: 15, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] },
      { sku: 'MDT-GRY-L', color: '#808080', colorName: 'Grey', size: 'L', stock: 10, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] }
    ]
  },
  // 6
  {
    name: 'Generative Knit Vest',
    slug: 'generative-knit-vest',
    description: 'Crafted using algorithmic knit paths for organic structural strength and modern geometric aesthetics.',
    basePrice: 380,
    category: 'Knitwear',
    collections: ['heritage-collection', 'editorial-picks'],
    tags: ['knit', 'algorithmic', 'organic', 'minimalist'],
    isFeatured: false,
    isActive: true,
    popularity: 82,
    variants: [
      { sku: 'GKV-CRM-M', color: '#fffdd0', colorName: 'Cream', size: 'M', stock: 14, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 7
  {
    name: 'Liquid Chrome Trench',
    slug: 'liquid-chrome-trench',
    description: 'Stunning waterproof trench coat with metallic fluid sheen, double-breasted closing and adjustable collar.',
    basePrice: 1200,
    category: 'Coats',
    collections: ['new-arrivals', 'limited-edition'],
    tags: ['trench', 'metallic', 'waterproof', 'winter'],
    isFeatured: true,
    isActive: true,
    popularity: 94,
    variants: [
      { sku: 'LCT-CHR-S', color: '#d3d3d3', colorName: 'Chrome', size: 'S', stock: 7, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000'] },
      { sku: 'LCT-CHR-M', color: '#d3d3d3', colorName: 'Chrome', size: 'M', stock: 5, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000'] }
    ]
  },
  // 8
  {
    name: 'Hybrid Tech Parka',
    slug: 'hybrid-tech-parka',
    description: 'Modular insulation panels integrated into a futuristic shell, crafted for extreme environments.',
    basePrice: 1100,
    salePrice: 950,
    category: 'Coats',
    collections: ['ai-collection', 'summer-edit'],
    tags: ['modular', 'parka', 'techwear', 'heavywear'],
    isFeatured: true,
    isActive: true,
    popularity: 87,
    variants: [
      { sku: 'HTP-OLV-M', color: '#808000', colorName: 'Olive', size: 'M', stock: 12, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000'] },
      { sku: 'HTP-OLV-XL', color: '#808000', colorName: 'Olive', size: 'XL', stock: 9, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000'] }
    ]
  },
  // 9
  {
    name: 'Cyberpunk Cargo Trousers',
    slug: 'cyberpunk-cargo-trousers',
    description: 'Relaxed fit multi-pocket utility pants designed with heavy nylon straps and weather-resistant fabrics.',
    basePrice: 320,
    category: 'Trousers',
    collections: ['digital-couture', 'summer-edit'],
    tags: ['utility', 'cargo', 'streetwear', 'techwear'],
    isFeatured: false,
    isActive: true,
    popularity: 85,
    variants: [
      { sku: 'CCT-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 25, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] },
      { sku: 'CCT-BLK-L', color: '#000000', colorName: 'Black', size: 'L', stock: 20, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] }
    ]
  },
  // 10
  {
    name: 'Glitch Pattern Cardigan',
    slug: 'glitch-pattern-cardigan',
    description: 'Cozy knitted cardigan featuring a computational digital glitch weave pattern in premium cashmere wool.',
    basePrice: 650,
    category: 'Knitwear',
    collections: ['editorial-picks', 'heritage-collection'],
    tags: ['cashmere', 'cardigan', 'glitch', 'knit'],
    isFeatured: false,
    isActive: true,
    popularity: 79,
    variants: [
      { sku: 'GPC-BLU-S', color: '#0000ff', colorName: 'Blue', size: 'S', stock: 6, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] },
      { sku: 'GPC-BLU-M', color: '#0000ff', colorName: 'Blue', size: 'M', stock: 11, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 11
  {
    name: 'Solographic Trench Coat',
    slug: 'solographic-trench-coat',
    description: 'A stunning prismatic trench coat reflecting holographic spectrums in daylight, limited to 50 numbered pieces.',
    basePrice: 1600,
    category: 'Coats',
    collections: ['limited-edition', 'digital-couture'],
    tags: ['trench', 'holographic', 'limited', 'couture'],
    isFeatured: true,
    isActive: true,
    popularity: 96,
    variants: [
      { sku: 'STC-PRM-M', color: '#ff00ff', colorName: 'Prismatic', size: 'M', stock: 4, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000'] }
    ]
  },
  // 12
  {
    name: 'Atmospheric Breeze Dress',
    slug: 'atmospheric-breeze-dress',
    description: 'Ethereal silk-chiffon dress responding to air movement with hyper-fluid dynamics.',
    basePrice: 790,
    category: 'Gowns',
    collections: ['new-arrivals', 'summer-edit'],
    tags: ['dress', 'silk', 'fluid', 'elegant'],
    isFeatured: true,
    isActive: true,
    popularity: 84,
    variants: [
      { sku: 'ABD-WHT-S', color: '#ffffff', colorName: 'White', size: 'S', stock: 8, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] },
      { sku: 'ABD-WHT-M', color: '#ffffff', colorName: 'White', size: 'M', stock: 12, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] }
    ]
  },
  // 13
  {
    name: 'Carbon Fiber Structured Corset',
    slug: 'carbon-fiber-structured-corset',
    description: 'Rigid carbon-threaded fibers woven into a structured supportive shape, contrasting with soft inner silk lining.',
    basePrice: 520,
    category: 'Shirts',
    collections: ['evening-couture', 'ai-collection'],
    tags: ['corset', 'structured', 'carbon', 'black'],
    isFeatured: false,
    isActive: true,
    popularity: 78,
    variants: [
      { sku: 'CSC-BLK-S', color: '#000000', colorName: 'Black', size: 'S', stock: 14, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] },
      { sku: 'CSC-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 10, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] }
    ]
  },
  // 14
  {
    name: 'Monochromatic Modular Vest',
    slug: 'monochromatic-modular-vest',
    description: 'Sleek tech utility vest with magnetic attachment pockets and adjustable utility belt buckles.',
    basePrice: 390,
    category: 'Jackets',
    collections: ['ai-collection', 'summer-edit'],
    tags: ['modular', 'utility', 'vest', 'streetwear'],
    isFeatured: false,
    isActive: true,
    popularity: 69,
    variants: [
      { sku: 'MMV-GRY-M', color: '#808080', colorName: 'Grey', size: 'M', stock: 18, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000'] }
    ]
  },
  // 15
  {
    name: 'Luminescent Evening Gown',
    slug: 'luminescent-evening-gown',
    description: 'Sophisticated deep-navy silk gown that softly glows in low lighting conditions. Stunning silhouette.',
    basePrice: 1850,
    salePrice: 1600,
    category: 'Gowns',
    collections: ['evening-couture', 'limited-edition'],
    tags: ['gown', 'evening', 'luminescent', 'silk'],
    isFeatured: true,
    isActive: true,
    popularity: 98,
    variants: [
      { sku: 'LEG-NVY-S', color: '#000080', colorName: 'Navy', size: 'S', stock: 3, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] },
      { sku: 'LEG-NVY-M', color: '#000080', colorName: 'Navy', size: 'M', stock: 6, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] }
    ]
  },
  // 16
  {
    name: 'Polyester Matrix Shirt',
    slug: 'polyester-matrix-shirt',
    description: 'High-comfort structural polyester weave shirt with subtle green accent lines running vertically.',
    basePrice: 280,
    category: 'Shirts',
    collections: ['new-arrivals', 'summer-edit'],
    tags: ['shirt', 'polyester', 'matrix', 'lightweight'],
    isFeatured: false,
    isActive: true,
    popularity: 70,
    variants: [
      { sku: 'PMS-GRN-M', color: '#008000', colorName: 'Green', size: 'M', stock: 30, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] },
      { sku: 'PMS-GRN-L', color: '#008000', colorName: 'Green', size: 'L', stock: 22, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] }
    ]
  },
  // 17
  {
    name: 'Asymmetric Pleated Kilt Trousers',
    slug: 'asymmetric-pleated-kilt-trousers',
    description: 'Bold wrap-skirt style overlay over tapered wool trousers. Premium Japanese stitching.',
    basePrice: 620,
    category: 'Trousers',
    collections: ['editorial-picks', 'limited-edition'],
    tags: ['asymmetric', 'trousers', 'wool', 'stitching'],
    isFeatured: true,
    isActive: true,
    popularity: 83,
    variants: [
      { sku: 'APK-BLK-S', color: '#000000', colorName: 'Black', size: 'S', stock: 8, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] },
      { sku: 'APK-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 12, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] }
    ]
  },
  // 18
  {
    name: 'Chrono-Stitch Wool Sweater',
    slug: 'chrono-stitch-wool-sweater',
    description: 'Heavyweight hand-crafted merino wool sweater utilizing high-durability weaving patterns.',
    basePrice: 480,
    category: 'Knitwear',
    collections: ['heritage-collection', 'editorial-picks'],
    tags: ['sweater', 'wool', 'merino', 'warm'],
    isFeatured: false,
    isActive: true,
    popularity: 75,
    variants: [
      { sku: 'CSW-OAT-M', color: '#f5f5dc', colorName: 'Oatmeal', size: 'M', stock: 16, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] },
      { sku: 'CSW-OAT-L', color: '#f5f5dc', colorName: 'Oatmeal', size: 'L', stock: 14, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 19
  {
    name: 'Obsidian Velvet Blazer',
    slug: 'obsidian-velvet-blazer',
    description: 'Luxurious velvet evening blazer in deepest black with peak silk satin lapels.',
    basePrice: 1050,
    category: 'Blazers',
    collections: ['evening-couture', 'editorial-picks'],
    tags: ['blazer', 'velvet', 'black', 'party'],
    isFeatured: true,
    isActive: true,
    popularity: 90,
    variants: [
      { sku: 'OVB-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 10, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000'] },
      { sku: 'OVB-BLK-L', color: '#000000', colorName: 'Black', size: 'L', stock: 7, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000'] }
    ]
  },
  // 20
  {
    name: 'Cybernetic Shield Cape',
    slug: 'cybernetic-shield-cape',
    description: 'High-neck windproof technical cape with reflective geometrical lining and hardware clasps.',
    basePrice: 780,
    category: 'Jackets',
    collections: ['ai-collection', 'digital-couture'],
    tags: ['cape', 'techwear', 'windproof', 'cyber'],
    isFeatured: false,
    isActive: true,
    popularity: 81,
    variants: [
      { sku: 'CSC-GRY-S', color: '#808080', colorName: 'Grey', size: 'S', stock: 9, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] },
      { sku: 'CSC-GRY-M', color: '#808080', colorName: 'Grey', size: 'M', stock: 15, images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000'] }
    ]
  },
  // 21
  {
    name: 'Kinetic Drape Skirt Gown',
    slug: 'kinetic-drape-skirt-gown',
    description: 'Innovative shape-memory silk gown that retains elegant pleats and responds beautifully to walking strides.',
    basePrice: 1950,
    category: 'Gowns',
    collections: ['limited-edition', 'evening-couture'],
    tags: ['gown', 'kinetic', 'silk', 'exclusive'],
    isFeatured: true,
    isActive: true,
    popularity: 93,
    variants: [
      { sku: 'KDS-SLV-S', color: '#c0c0c0', colorName: 'Silver', size: 'S', stock: 5, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] }
    ]
  },
  // 22
  {
    name: 'Pixelated Silk Blouse',
    slug: 'pixelated-silk-blouse',
    description: 'Sophisticated silk blouse featuring a low-opacity generative cyber-pixel print and cuffs.',
    basePrice: 420,
    category: 'Shirts',
    collections: ['digital-couture', 'summer-edit'],
    tags: ['blouse', 'silk', 'print', 'digital'],
    isFeatured: false,
    isActive: true,
    popularity: 74,
    variants: [
      { sku: 'PSB-WHT-S', color: '#ffffff', colorName: 'White', size: 'S', stock: 12, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] },
      { sku: 'PSB-WHT-M', color: '#ffffff', colorName: 'White', size: 'M', stock: 14, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] }
    ]
  },
  // 23
  {
    name: 'Modular Tech Shell Jacket',
    slug: 'modular-tech-shell-jacket',
    description: 'Weatherproof high-performance shell featuring detachable hood, storm flaps, and magnetic cargo compartments.',
    basePrice: 920,
    salePrice: 780,
    category: 'Jackets',
    collections: ['new-arrivals', 'ai-collection'],
    tags: ['shell', 'jacket', 'waterproof', 'modular'],
    isFeatured: true,
    isActive: true,
    popularity: 89,
    variants: [
      { sku: 'MTS-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 15, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000'] },
      { sku: 'MTS-BLK-L', color: '#000000', colorName: 'Black', size: 'L', stock: 10, images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000'] }
    ]
  },
  // 24
  {
    name: 'Cyber Knit Dress',
    slug: 'cyber-knit-dress',
    description: 'Stretching woven dress using thermal-receptive yarns that contour organically to body movement.',
    basePrice: 510,
    category: 'Knitwear',
    collections: ['summer-edit', 'heritage-collection'],
    tags: ['dress', 'knit', 'woven', 'stretchy'],
    isFeatured: false,
    isActive: true,
    popularity: 80,
    variants: [
      { sku: 'CKD-CRM-S', color: '#fffdd0', colorName: 'Cream', size: 'S', stock: 12, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] },
      { sku: 'CKD-CRM-M', color: '#fffdd0', colorName: 'Cream', size: 'M', stock: 15, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 25
  {
    name: 'Neon Grid Trousers',
    slug: 'neon-grid-trousers',
    description: 'Striking trousers with woven photoluminescent threads forming a grid matrix layout.',
    basePrice: 470,
    category: 'Trousers',
    collections: ['ai-collection', 'limited-edition'],
    tags: ['matrix', 'trousers', 'grid', 'neon'],
    isFeatured: false,
    isActive: true,
    popularity: 86,
    variants: [
      { sku: 'NGT-GRN-M', color: '#39ff14', colorName: 'Neon Green', size: 'M', stock: 6, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] }
    ]
  },
  // 26
  {
    name: 'Aerosol Printed Silk Dress',
    slug: 'aerosol-printed-silk-dress',
    description: 'Flowing silk dress featuring dynamic gradient print conceptualized through neural aerosol maps.',
    basePrice: 880,
    category: 'Gowns',
    collections: ['new-arrivals', 'editorial-picks'],
    tags: ['silk', 'dress', 'gradient', 'editorial'],
    isFeatured: true,
    isActive: true,
    popularity: 92,
    variants: [
      { sku: 'APD-BLU-S', color: '#0000ff', colorName: 'Blue', size: 'S', stock: 8, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] },
      { sku: 'APD-BLU-M', color: '#0000ff', colorName: 'Blue', size: 'M', stock: 10, images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000'] }
    ]
  },
  // 27
  {
    name: 'Prismatic Cyber Blazer',
    slug: 'prismatic-cyber-blazer',
    description: 'Double-breasted designer blazer woven with optical spectrum threads to reflect rainbow shimmers.',
    basePrice: 1150,
    category: 'Blazers',
    collections: ['editorial-picks', 'digital-couture'],
    tags: ['blazer', 'prismatic', 'geometric', 'rainbow'],
    isFeatured: true,
    isActive: true,
    popularity: 97,
    variants: [
      { sku: 'PCB-PRM-M', color: '#ff00ff', colorName: 'Prismatic', size: 'M', stock: 5, images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000'] }
    ]
  },
  // 28
  {
    name: 'Atmospheric Technical Overcoat',
    slug: 'atmospheric-technical-overcoat',
    description: 'Heavy protective overcoat built with multi-layered insulation and magnetic quick-zip enclosures.',
    basePrice: 1350,
    salePrice: 1200,
    category: 'Coats',
    collections: ['new-arrivals', 'limited-edition'],
    tags: ['overcoat', 'technical', 'insulated', 'winter'],
    isFeatured: true,
    isActive: true,
    popularity: 91,
    variants: [
      { sku: 'ATO-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 6, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000'] },
      { sku: 'ATO-BLK-XL', color: '#000000', colorName: 'Black', size: 'XL', stock: 4, images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000'] }
    ]
  },
  // 29
  {
    name: 'Vector Geometric Shirt',
    slug: 'vector-geometric-shirt',
    description: 'Sleek cotton shirt printed with algorithmic vector lines intersecting in modern structural motifs.',
    basePrice: 360,
    category: 'Shirts',
    collections: ['summer-edit', 'digital-couture'],
    tags: ['shirt', 'vector', 'cotton', 'algorithmic'],
    isFeatured: false,
    isActive: true,
    popularity: 72,
    variants: [
      { sku: 'VGS-WHT-M', color: '#ffffff', colorName: 'White', size: 'M', stock: 20, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] },
      { sku: 'VGS-WHT-L', color: '#ffffff', colorName: 'White', size: 'L', stock: 15, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000'] }
    ]
  },
  // 30
  {
    name: 'Algorithmic Ribbed Sweater',
    slug: 'algorithmic-ribbed-sweater',
    description: 'Intricately woven ribbed wool sweater designed using automated tension adjustments for dynamic fit.',
    basePrice: 530,
    category: 'Knitwear',
    collections: ['heritage-collection', 'new-arrivals'],
    tags: ['sweater', 'ribbed', 'wool', 'automated'],
    isFeatured: false,
    isActive: true,
    popularity: 85,
    variants: [
      { sku: 'ARS-GRY-M', color: '#808080', colorName: 'Grey', size: 'M', stock: 18, images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000'] }
    ]
  },
  // 31
  {
    name: 'Structured Tech Tailored Pants',
    slug: 'structured-tech-tailored-pants',
    description: 'Technical polyester trousers featuring structured pleats, water-resistant layers, and slim line silhouette.',
    basePrice: 480,
    category: 'Trousers',
    collections: ['ai-collection', 'editorial-picks'],
    tags: ['pants', 'tailored', 'technical', 'polyester'],
    isFeatured: false,
    isActive: true,
    popularity: 77,
    variants: [
      { sku: 'STT-BLK-S', color: '#000000', colorName: 'Black', size: 'S', stock: 15, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] },
      { sku: 'STT-BLK-M', color: '#000000', colorName: 'Black', size: 'M', stock: 20, images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'] }
    ]
  }
];

const collectionsData = [
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Curated avant-garde arrivals for the current season.',
    longDescription: 'Experience the latest iterations of modern fashion. Our new arrivals blend technological innovation with traditional couture craftsmanship.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000',
    accentColor: 'from-cyan-500/20 to-blue-600/20',
    displayOrder: 1,
    isActive: true,
    seoTitle: 'New Luxury Arrivals - Plasma Atelier',
    seoDescription: 'Discover the latest avant-garde arrivals from Plasma Atelier.',
  },
  {
    name: 'Summer Edit',
    slug: 'summer-edit',
    description: 'Futuristic resort and hot-weather wear designed for comfort.',
    longDescription: 'Keep cool with high-tech fabrics and silhouettes styled for high-temperature cyber-resorts.',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000',
    accentColor: 'from-orange-500/20 to-yellow-600/20',
    displayOrder: 2,
    isActive: true,
    seoTitle: 'Luxury Summer Collection - Plasma Atelier',
    seoDescription: 'Futuristic resort wear and high-tech summer garments.',
  },
  {
    name: 'Evening Couture',
    slug: 'evening-couture',
    description: 'High-end elegant tailoring for after-dark statement-making.',
    longDescription: 'Stunning silhouettes and hyper-premium tailoring made for night events and luxury lounges.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
    accentColor: 'from-purple-500/20 to-pink-600/20',
    displayOrder: 3,
    isActive: true,
    seoTitle: 'Evening Couture & Tailoring - Plasma Atelier',
    seoDescription: 'Hyper-premium evening wear and elegant night statement couture.',
  },
  {
    name: 'Digital Couture',
    slug: 'digital-couture',
    description: 'AI runway couture built on generative aesthetics.',
    longDescription: 'Exploring the boundary between digital fashion design and physical garment creation.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000',
    accentColor: 'from-blue-500/20 to-purple-600/20',
    displayOrder: 4,
    isActive: true,
    seoTitle: 'Digital Couture & Generative Fashion - Plasma Atelier',
    seoDescription: 'Generative and digital couture crossing the screen to reality.',
  },
  {
    name: 'Editorial Picks',
    slug: 'editorial-picks',
    description: 'Pieces recommended by our head designers.',
    longDescription: 'Curated favorites from our creative directors, showcasing bold styling and premium craftsmanship.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000',
    accentColor: 'from-amber-500/20 to-red-600/20',
    displayOrder: 5,
    isActive: true,
    seoTitle: 'Designers Editorial Picks - Plasma Atelier',
    seoDescription: 'Browse pieces curated and selected directly by our head designers.',
  },
  {
    name: 'Limited Edition',
    slug: 'limited-edition',
    description: 'Highly restricted, serial-numbered releases.',
    longDescription: 'Extremely rare items crafted in single-digit production batches for the ultimate collectors.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    accentColor: 'from-rose-500/20 to-indigo-600/20',
    displayOrder: 6,
    isActive: true,
    seoTitle: 'Limited Edition Collectibles - Plasma Atelier',
    seoDescription: 'Discover and shop rare limited serial releases.',
  },
  {
    name: 'AI Collection',
    slug: 'ai-collection',
    description: 'Designs conceptualized by custom generative neural models.',
    longDescription: 'At the intersection of code and canvas, this capsule showcases designs purely generated by deep learning algorithms.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000',
    accentColor: 'from-emerald-500/20 to-teal-600/20',
    displayOrder: 7,
    isActive: true,
    seoTitle: 'AI Conceptual Couture - Plasma Atelier',
    seoDescription: 'Capsules conceptualized and curated via neural models.',
  },
  {
    name: 'Heritage Collection',
    slug: 'heritage-collection',
    description: 'Timeless luxury roots combined with cybernetic details.',
    longDescription: 'Honoring historical patterns and techniques, upgraded with futuristic design elements.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
    bannerImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000',
    accentColor: 'from-bronze-500/20 to-yellow-700/20',
    displayOrder: 8,
    isActive: true,
    seoTitle: 'Heritage Capsule Collection - Plasma Atelier',
    seoDescription: 'Traditional techniques meet futuristic visions.',
  },
];

export async function runSeeding() {
  try {
    log('[SEED] Starting database seeding...');
    log(`[SEED] env.NEXT_PUBLIC_SUPABASE_URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`);
    log(`[SEED] env.SUPABASE_SERVICE_ROLE_KEY prefix: ${env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) : 'undefined'}`);

    // Inspect products table by executing a test insert
    try {
      const { data, error } = await supabase.from('products').insert({
        name: 'Test Product ' + Date.now(),
        slug: 'test-product-' + Date.now(),
        description: 'Test Description',
        base_price: 100,
        category: 'Test'
      }).select();
      if (error) {
        log(`[SEED] Test insert error: ${JSON.stringify(error)}`);
      } else if (data && data.length > 0) {
        log(`[SEED] Test insert success! Columns: ${JSON.stringify(Object.keys(data[0]))}`);
        // Delete it afterwards
        await supabase.from('products').delete().eq('id', data[0].id);
      }
    } catch (err: any) {
      log(`[SEED] Test insert query error: ${err.message}`);
    }

    // 1. Clear database
    log('[SEED] Clearing existing data...');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('collection_products').delete().neq('collection_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    log('[SEED] Cleared existing data.');

    // 2. Insert Products and Variants
    const createdProducts: any[] = [];
    for (const p of productsData) {
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .insert({
          name: p.name,
          slug: p.slug,
          description: p.description,
          base_price: p.basePrice,
          sale_price: p.salePrice || null,
          category: p.category,
          tags: p.tags,
          is_featured: p.isFeatured,
          is_active: p.isActive,
          popularity: p.popularity,
        })
        .select()
        .single();

      if (prodErr || !product) {
        log(`[SEED] Product seed error details: ${JSON.stringify(prodErr)}`);
        throw new Error(`Failed to seed product ${p.name}: ${prodErr?.message}`);
      }

      createdProducts.push({
        ...product,
        collections: p.collections
      });

      // Insert variants for this product
      if (p.variants && p.variants.length > 0) {
        const dbVariants = p.variants.map((v: any) => ({
          product_id: product.id,
          sku: v.sku,
          color: v.color,
          color_name: v.colorName,
          size: v.size,
          stock: v.stock,
          images: v.images || [],
        }));

        const { error: varErr } = await supabase.from('product_variants').insert(dbVariants);
        if (varErr) {
          throw new Error(`Failed to seed variants for ${p.name}: ${varErr.message}`);
        }
      }
    }
    log(`[SEED] Seeded ${createdProducts.length} products.`);

    // 3. Insert Collections with matching products references
    for (const c of collectionsData) {
      const matchingProducts = createdProducts.filter((p) => {
        return (
          p.collections.includes(c.slug) ||
          p.collections.includes(c.name)
        );
      });

      const featuredProductIds = matchingProducts.slice(0, 4).map((p) => p.id);

      const { data: collection, error: colErr } = await supabase
        .from('collections')
        .insert({
          name: c.name,
          title: c.name,
          slug: c.slug,
          description: c.description,
          long_description: c.longDescription,
          image: c.image,
          banner_image: c.bannerImage,
          accent_color: c.accentColor,
          product_count: matchingProducts.length,
          display_order: c.displayOrder,
          is_active: c.isActive,
          seo_title: c.seoTitle,
          seo_description: c.seoDescription,
        })
        .select()
        .single();

      if (colErr || !collection) {
        throw new Error(`Failed to seed collection ${c.name}: ${colErr?.message}`);
      }

      // Link in collection_products map
      if (matchingProducts.length > 0) {
        const links = matchingProducts.map((p) => ({
          collection_id: collection.id,
          product_id: p.id,
        }));
        await supabase.from('collection_products').insert(links);
      }

      log(`[SEED] Seeded collection: ${c.name} with ${matchingProducts.length} products.`);
    }

    console.log('[SEED] Database seeded successfully with 31 products and 8 collections!');
  } catch (error: any) {
    log(`[SEED] Seeding error: ${error instanceof Error ? error.message : String(error)}`);
    if (error && typeof error === 'object' && 'cause' in error) {
      log(`[SEED] Cause: ${error.cause}`);
      if (error.cause && typeof error.cause === 'object' && 'stack' in error.cause) {
        log(`[SEED] Cause Stack: ${error.cause.stack}`);
      }
    }
  }
}
