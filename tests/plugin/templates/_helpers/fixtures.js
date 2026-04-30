// =============================================================================
// WDesignKit Templates Suite — Fixtures
// Static test data shared across template specs
// =============================================================================

const BUSINESS_NAME_DEFAULT = 'QA Test Business';

const BUSINESS_NAMES_LONG = [
  'A'.repeat(500),
];

const BUSINESS_NAMES_SPECIAL_CHARS = [
  '<script>alert("xss")</script>',
];

const CATEGORY_IDS = [
  '#category_1031',
  '#category_1032',
  '#category_1033',
  '#category_1034',
  '#category_1035',
  '#category_1036',
  '#category_1037',
  '#category_1038',
  '#category_1039',
  '#category_1040',
  '#category_1041',
  '#category_1042',
  '#category_1043',
  '#category_1044',
  '#category_1045',
  '#category_1046',
  '#category_1047',
  '#category_1048',
  '#category_1049',
  '#category_1050',
  '#category_1051',
];

const CATEGORIES = [
  { id: '#category_1031', name: 'Agency' },
  { id: '#category_1032', name: 'Architecture' },
  { id: '#category_1033', name: 'Restaurant' },
  { id: '#category_1034', name: 'Fitness' },
  { id: '#category_1035', name: 'Medical' },
  { id: '#category_1036', name: 'Portfolio' },
  { id: '#category_1037', name: 'Corporate/Business' },
  { id: '#category_1038', name: 'Education' },
  { id: '#category_1039', name: 'Real Estate' },
  { id: '#category_1040', name: 'Beauty' },
  { id: '#category_1041', name: 'Photography' },
  { id: '#category_1042', name: 'Construction' },
  { id: '#category_1043', name: 'Travel' },
  { id: '#category_1044', name: 'Fashion' },
  { id: '#category_1045', name: 'Interior Design' },
  { id: '#category_1046', name: 'Startup' },
  { id: '#category_1047', name: 'Non-Profit' },
  { id: '#category_1048', name: 'Law' },
  { id: '#category_1049', name: 'Event' },
  { id: '#category_1050', name: 'Technology' },
  { id: '#category_1051', name: 'Social Media' },
];

const BUILDER_IDS = {
  elementor: '#select_builder_elementor',
  gutenberg: '#select_builder_gutenberg',
};

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

module.exports = {
  BUSINESS_NAME_DEFAULT,
  BUSINESS_NAMES_LONG,
  BUSINESS_NAMES_SPECIAL_CHARS,
  CATEGORY_IDS,
  CATEGORIES,
  BUILDER_IDS,
  VIEWPORTS,
};
