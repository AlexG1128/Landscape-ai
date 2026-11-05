/**
 * Free real photos for catalog plants, sourced from Wikimedia Commons.
 *
 * Each value is a Commons file name. We build a stable thumbnail URL via
 * Special:FilePath, which redirects to the actual image and accepts a width:
 *   https://commons.wikimedia.org/wiki/Special:FilePath/<File>?width=600
 *
 * These images are freely licensed on Wikimedia Commons. Any plant not listed
 * here falls back to the app's generated illustration — so partial coverage is
 * totally fine. If a specific image ever fails to load, swap the file name.
 */
const COMMONS_FILES: Record<string, string> = {
  // Flowers
  coneflower: 'Echinacea purpurea 002.JPG',
  coreopsis: 'Coreopsis grandiflora cultivar.jpg',
  salvia: 'Salvia nemorosa0.jpg',
  peony: 'Paeonia lactiflora (flower).jpg',
  tulip: 'Tulipa suaveolens floriade to Canberra.jpg',
  daffodil: 'Narcissus flowers.jpg',
  marigold: 'Tagetes patula01.jpg',
  zinnia: 'Zinnia elegans (door bloem).jpg',
  hosta: 'Hosta plantaginea2.jpg',
  astilbe: 'Astilbe japonica1.jpg',
  'russian-sage': 'Perovskia atriplicifolia kz03.jpg',
  'shasta-daisy': 'Leucanthemum maximum0.jpg',
  daylily: 'Hemerocallis fulva flower.jpg',
  lavender: 'Single lavender flower02.jpg',
  'black-eyed-susan': 'Rudbeckia hirta (Black-eyed Susan).jpg',
  catmint: 'Nepeta racemosa0.jpg',

  // Shrubs
  'knockout-rose': 'Rosa Knock Out 2.jpg',
  azalea: 'Azalea flowers.jpg',
  rhododendron: 'Rhododendron ponticum flowers.jpg',
  spirea: 'Spiraea japonica0.jpg',
  forsythia: 'Forsythia flowers.jpg',
  'butterfly-bush': 'Buddleja davidii (flowers).jpg',
  'endless-summer-hydrangea': 'Hydrangea macrophylla - Hortensia hydrangea.jpg',
  'hydrangea-panicle': 'Hydrangea paniculata Limelight 1.jpg',
  boxwood: 'Buxus sempervirens0.jpg',
  juniper: 'Juniperus horizontalis1.jpg',
  nandina: 'Nandina domestica1.jpg',
  camellia: 'Camellia japonica flower.jpg',
  viburnum: 'Viburnum opulus flowers.jpg',
  'sky-pencil-holly': 'Ilex crenata1.jpg',

  // Trees
  'emerald-arborvitae': 'Thuja occidentalis Smaragd.jpg',
  'japanese-maple': 'Acer palmatum - Japanese maple.jpg',
  dogwood: 'Cornus florida flowers.jpg',
  redbud: 'Cercis canadensis flowers.jpg',
  'crape-myrtle': 'Lagerstroemia indica flowers.jpg',
  magnolia: 'Magnolia grandiflora flower.jpg',
  'red-maple': 'Acer rubrum in autumn.jpg',
  'river-birch': 'Betula nigra bark.jpg',
  serviceberry: 'Amelanchier lamarckii flowers.jpg',

  // Vegetables
  tomato: 'Tomato je.jpg',
  pepper: 'Capsicum annuum Bell pepper.jpg',
  lettuce: 'Lettuce mix.jpg',
  carrot: 'Carrots with stems.jpg',
  cucumber: 'Cucumber BNC.jpg',
  zucchini: 'Zucchini-Whole.jpg',
  'green-beans': 'Green beans.jpg',
  kale: 'Kale-Bundle.jpg',

  // Herbs
  basil: 'Basil-Basilico-Ocimum basilicum-albahaca.jpg',
  rosemary: 'Rosmarinus officinalis133095382.jpg',
  thyme: 'Thymus vulgaris0.jpg',
  mint: 'Mentha spicata leaves.jpg',
  parsley: 'Parsley.jpg',
  oregano: 'Origanum vulgare - harilik pune.jpg',

  // Groundcovers & grasses
  'creeping-phlox': 'Phlox subulata1.jpg',
  vinca: 'Vinca minor flower.jpg',
  liriope: 'Liriope muscari2.jpg',
  'creeping-sedum': 'Sedum spurium1.jpg',
  'ostrich-fern': 'Matteuccia struthiopteris0.jpg',
  'fountain-grass': 'Pennisetum alopecuroides1.jpg',
  'blue-fescue': 'Festuca glauca1.jpg',
  'maiden-grass': 'Miscanthus sinensis1.jpg',

  'siberian-iris': 'Iris sibirica (flower).jpg',
  pachysandra: 'Pachysandra terminalis0.jpg',
  ajuga: 'Ajuga reptans flowers.jpg',

  // Seeds / misc
  'sunflower-seed': 'Sunflower sky backdrop.jpg',
  'wildflower-seed-mix': 'Wildflower meadow.jpg',
  'clover-seed': 'Trifolium repens flower.jpg',
  'native-grass-seed': 'Prairie grasses.jpg',
};

/** Build a stable Wikimedia Commons thumbnail URL from a file name. */
function commonsUrl(file: string, width = 600): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

/** Returns a free photo URL for a plant id, or undefined if none is curated. */
export function photoFor(plantId: string): string | undefined {
  const file = COMMONS_FILES[plantId];
  return file ? commonsUrl(file) : undefined;
}
