/**
 * Five reference photos per business category (Pexels — free to use per https://www.pexels.com/license/).
 * Illustrative stock imagery only; not the applicant's premises.
 */
export type IndustryImage = { src: string; alt: string }

const P = (id: string, alt: string): IndustryImage => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=720&h=480&fit=crop`,
  alt,
})

const GROCERY: IndustryImage[] = [
  P('264636', 'Fresh produce and vegetables at a market'),
  P('3962285', 'Grocery bags and staples'),
  P('4050415', 'Supermarket shelves with packaged food'),
  P('65175', 'Spices and dry goods'),
  P('2449669', 'Shopping cart in a store aisle'),
]

const PHARMACY: IndustryImage[] = [
  P('5990045', 'Pharmacy interior and shelves'),
  P('4031818', 'Medicine and health products'),
  P('3683051', 'Pills and tablets'),
  P('4021772', 'Healthcare retail display'),
  P('3957991', 'Vitamins and supplements'),
]

const SALON: IndustryImage[] = [
  P('3065209', 'Hair salon chairs and mirrors'),
  P('1319459', 'Hair styling and beauty tools'),
  P('1562322', 'Salon interior'),
  P('3993449', 'Beauty products display'),
  P('3065171', 'Hairdresser workspace'),
]

const RESTAURANT: IndustryImage[] = [
  P('1640777', 'Restaurant interior'),
  P('1279330', 'Dining tables and ambience'),
  P('958545', 'Chef preparing food'),
  P('704971', 'Plated dishes'),
  P('3214167', 'Cafe and counter service'),
]

const HARDWARE: IndustryImage[] = [
  P('221027', 'Tools and workshop'),
  P('2882520', 'Hardware and building supplies'),
  P('442150', 'Power tools display'),
  P('812264', 'Tool bench and equipment'),
  P('265667', 'Construction and DIY materials'),
]

const ELECTRONICS: IndustryImage[] = [
  P('3560567', 'Laptop on a desk'),
  P('3568518', 'Gadgets and accessories'),
  P('1714208', 'Electronics workspace'),
  P('5082581', 'Computer and peripherals'),
  P('7676484', 'Tech retail shelves'),
]

const CLOTHING: IndustryImage[] = [
  P('1926769', 'Clothing racks in a shop'),
  P('1536619', 'Fashion retail display'),
  P('5709660', 'Apparel on hangers'),
  P('5870867', 'Boutique interior'),
  P('996329', 'Textiles and garments'),
]

const STATIONERY: IndustryImage[] = [
  P('914432', 'Notebooks and pens'),
  P('256417', 'Books stacked'),
  P('3184292', 'Reading and study desk'),
  P('7688332', 'Stationery flat lay'),
  P('7681253', 'Office supplies'),
]

const OTHER: IndustryImage[] = [
  P('5632401', 'Small retail checkout'),
  P('4483610', 'Shop counter and service'),
  P('298863', 'Retail storefront goods'),
  P('3206079', 'General store shelves'),
  P('4392276', 'Shopping and bags'),
]

const BY_TYPE: Record<string, IndustryImage[]> = {
  grocery: GROCERY,
  pharmacy: PHARMACY,
  salon: SALON,
  restaurant: RESTAURANT,
  hardware: HARDWARE,
  electronics: ELECTRONICS,
  clothing: CLOTHING,
  stationery: STATIONERY,
  other: OTHER,
}

/** Five open-licence stock images for the officer UI, keyed by assessment `businessType`. */
export function getIndustryReferenceImages(businessType: string): IndustryImage[] {
  const key = businessType.trim().toLowerCase()
  return BY_TYPE[key] ?? OTHER
}
