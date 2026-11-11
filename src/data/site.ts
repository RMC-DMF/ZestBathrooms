// Facts about Zest used across the site. Anything in square brackets needs confirming with Zest.
export const site = {
  name: 'Zest Bathrooms & Kitchens',
  shortName: 'Zest',
  url: 'https://zestbathroomsandkitchens.co.uk',
  tagline: 'Luxury bathrooms and kitchens, designed in Chester since 1992.',
  description:
    'Luxury kitchens and bathrooms designed in Chester. SieMatic kitchens, Gessi Haute Culture bathrooms and a design studio serving homeowners across the North West, and developers and hotels across the UK.',
  phone: '01244 345 414',
  phoneHref: 'tel:01244345414',
  projectsPhone: '01925 269 517',
  projectsPhoneHref: 'tel:01925269517',
  projectsOffice: { name: 'Warrington project office', locality: 'Warrington' },
  email: 'info@zestbathroomsandkitchens.co.uk',
  address: {
    street: '2–6 Brookdale Place',
    locality: 'Chester',
    postcode: 'CH1 3DY',
    country: 'GB',
    lat: 53.1935,
    lng: -2.8871,
  },
  hours: [
    { days: 'Monday–Friday', open: '09:00', close: '17:00' },
    { days: 'Saturday', open: '09:00', close: '16:00' },
  ],
  founded: 1992,
  social: {
    instagram: 'https://www.instagram.com/zestbathroomandkitchens/',
    linkedin: 'https://www.linkedin.com/company/zestbathroomsandkitchens.co.uk/',
    pinterest: 'https://pin.it/2DDDPyLTX',
    tiktok: 'https://www.tiktok.com/@zest_bathrooms_kitchens',
  },
  areas: ['Chester', 'Cheshire', 'the Wirral', 'North Wales', 'Liverpool', 'Manchester'],
  facts: [
    { value: '1992', label: 'Established in Chester' },
    { value: '40+', label: 'Bathroom settings across two floors' },
    { value: '4', label: 'SieMatic kitchen displays' },
    { value: '1 of 10', label: 'UK Gessi Haute Culture showrooms, opening 2027' },
  ],
  cta: { label: 'Book a free design appointment', href: '/book-a-design-appointment' },
  tradeCta: { label: 'Register your project', href: '/projects/register' },
};

export const nav = [
  { label: 'Kitchens', href: '/kitchens' },
  { label: 'Bathrooms', href: '/bathrooms' },
  { label: 'Design Service', href: '/design-service' },
  { label: 'Projects', href: '/projects' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const footerNav = {
  explore: [
    { label: 'Kitchens', href: '/kitchens' },
    { label: 'Bathrooms', href: '/bathrooms' },
    { label: 'Gessi Haute Culture', href: '/gessi-haute-culture' },
    { label: 'Design Service', href: '/design-service' },
    { label: 'Projects', href: '/projects' },
    { label: 'Brands', href: '/brands' },
  ],
  about: [
    { label: 'Our story', href: '/about' },
    { label: 'The team', href: '/about/team' },
    { label: 'The showroom', href: '/about/showroom' },
    { label: 'Areas we serve', href: '/areas' },
    { label: 'Journal', href: '/journal' },
    { label: 'Contact', href: '/contact' },
  ],
};

export type Accent = 'kitchens' | 'bathrooms' | 'projects' | 'design' | 'neutral';
