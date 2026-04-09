import type { CategoryId } from '../types'

// Keyword rules: if description contains any of these strings (case-insensitive), assign that category.
// More specific rules should come first.
const RULES: { keywords: string[]; category: CategoryId }[] = [
  // Income
  { keywords: ['payroll', 'direct deposit', 'e-transfer deposit', 'salary', 'paycheque', 'paycheck', 'freelance', 'invoice payment', 'refund', 'rebate', 'tax return', 'gst/hst credit', 'ccb', 'canada child benefit', 'payment thank you'], category: 'income' },

  // Housing
  { keywords: ['rent', 'mortgage', 'property tax', 'strata', 'condo fee', 'home insurance', 'tenant insurance', 'intact insurance', 'square one insurance', 'prop pymt', 'prop svc', 'ysi*prop'], category: 'housing' },

  // Utilities
  { keywords: ['hydro', 'enbridge', 'fortis', 'bc gas', 'atco', 'toronto hydro', 'ontario hydro', 'alectra', 'rogers', 'bell', 'telus', 'shaw', 'videotron', 'freedom mobile', 'public mobile', 'koodo', 'fido', 'virgin mobile', 'internet', 'cable tv', 'electricity', 'natural gas', 'water bill', 'beanfield', 'teksavvy', 'start.ca', 'fibre'], category: 'utilities' },

  // Subscriptions
  { keywords: ['netflix', 'spotify', 'apple one', 'apple music', 'apple tv', 'apple icloud', 'apple.com/bill', 'google one', 'youtube premium', 'youtube music', 'amazon prime', 'disney+', 'disney plus', 'crave', 'paramount+', 'hbo max', 'adobe', 'microsoft 365', 'dropbox', 'duolingo', 'chatgpt', 'openai', 'github', 'notion', 'figma', 'canva', 'claude', 'anthropic', 'patreon', 'substack'], category: 'subscriptions' },

  // Transport
  { keywords: ['presto', 'ttc', 'stm', 'translink', 'oc transpo', 'go transit', 'via rail', 'greyhound', 'uber trip', 'uber *trip', 'uber can', 'lyft', 'taxi', 'instacar', 'zipcar', 'evo car', 'modo car', 'parking', 'autopark', 'impark', 'green p', 'petro-canada', 'petro canada', 'shell oil', 'esso', 'husky', 'irving oil', 'pioneer gas', 'canadian tire gas', 'circle k fuel', 'costco gas', 'chargepoint', 'electric vehicle', 'metrolinx'], category: 'transport' },

  // Travel
  { keywords: ['air canada', 'westjet', 'porter airlines', 'swoop', 'flair airlines', 'airbnb', 'expedia', 'booking.com', 'hotels.com', 'marriott', 'hilton', 'hyatt', 'westin', 'delta hotel', 'best western', 'holiday inn', 'travel insurance', 'sunwing', 'transat', 'trivago', 'vrbo'], category: 'travel' },

  // Groceries (before food_dining to avoid overlap)
  { keywords: ['loblaws', 'no frills', 'nofrills', 'metro', 'sobeys', 'safeway', 'save on foods', 'save-on', 'food basics', 'freshco', 'provigo', 'superstore', 'real canadian', 'iga', 'maxi', 'costco', 'wholesale club', 'walmart', 'wal-mart', 'wal mart', 't&t supermarket', 'farm boy', 'whole foods', 'sprouts', 'bulk barn', 'h-mart', 'hmart', 'nations fresh', 'ethnic food', 'grocery', 'instacart', 'voila', 'pc express'], category: 'groceries' },

  // Food & Dining — includes common bank abbreviations
  { keywords: ['tim hortons', 'tims', 'starbucks', 'sbux', 'mcdonald', 'mcdonalds', 'mcd ', 'burger king', 'wendy', 'harvey', 'a&w', 'subway', 'pizza pizza', 'pizza hut', 'domino', 'boston pizza', 'swiss chalet', 'east side mario', 'keg', 'kelsey', 'jack astor', 'moxie', 'cactus club', 'earls', 'browns', 'milestones', 'the keg', 'sushi', 'ramen', 'pho', 'thai', 'indian restaurant', 'chinese food', 'dim sum', 'shawarma', 'falafel', 'cafe', 'bakery', 'donut', 'dunkin', 'second cup', 'tim horton', 'coffee', 'restaurant', 'doordash', 'uber eats', 'ubereats', 'uber *eats', 'skip the dishes', 'skipdishes', 'grubhub', 'food delivery', 'dining', 'sq *', 'sp ', 'sp*', 'tst*', 'chowbus', 'ritual', 'bowl', 'grill', 'kitchen', 'eatery', 'diner', 'pub ', 'bar ', 'tavern', 'lounge', 'brewpub', 'noodle', 'taco', 'burrito', 'wing', 'bbq', 'brunch', 'meal', 'food'], category: 'food_dining' },

  // Health
  { keywords: ['shoppers drug mart', 'shoppers drug', 'sdm ', 'rexall', 'pharmasave', 'london drugs', 'jean coutu', 'pharmaprix', 'guardian pharmacy', 'pharmacy', 'pharm', 'medical', 'dental', 'dentist', 'optometrist', 'vision', 'physiotherapy', 'physio', 'massage therapy', 'chiropractor', 'goodlife', 'ymca', 'la fitness', 'anytime fitness', 'equinox', 'crunch fitness', 'f45', 'orange theory', 'pure barre', 'yoga', 'gym', 'fitness', 'health', 'medicine', 'prescription', 'sunlife', 'manulife', 'great-west life', 'blue cross', 'maple telehealth', 'rx ', 'clinic', 'hospital', 'dr.', 'doctor'], category: 'health' },

  // Entertainment
  { keywords: ['cineplex', 'landmark cinema', 'scotiabank theatre', 'imax', 'movie', 'theater', 'theatre', 'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'roblox', 'tiff', 'concert', 'ticketmaster', 'eventbrite', 'stubhub', 'casino', 'lottery', 'raptors', 'leafs', 'canucks', 'habs', 'nfl', 'mlb', 'nba', 'nhl', 'bowling', 'golf', 'billiards', 'escape room', 'arcade', 'paintball', 'lazer', 'museum', 'gallery', 'zoo', 'aquarium', 'library fine', 'amazon video', 'apple arcade', 'amzn digital', 'amzn prime video'], category: 'entertainment' },

  // Savings
  { keywords: ['savings', 'tfsa', 'hisa', 'high interest', 'saving account', 'transfer to sav', 'sav acct', 'emergency fund', 'rainy day'], category: 'savings' },

  // Investment
  { keywords: ['wealthsimple', 'questrade', 'qtrade', 'td direct investing', 'td waterhouse', 'bmo investorline', 'rbc direct invest', 'cibc investor', 'scotia itrade', 'national bank invest', 'interactive brokers', 'rrsp', 'resp', 'fhsa', 'gic', 'mutual fund', 'etf purchase', 'stock purchase', 'dividend', 'investment', 'brokerage', 'crypto', 'coinbase', 'binance', 'shakepay', 'newton crypto', 'bitbuy', 'coinsquare'], category: 'investment' },

  // Shopping — includes common bank abbreviations
  { keywords: ['amazon', 'amzn', 'amzn mktp', 'ebay', 'etsy', 'shein', 'zara', 'h&m', 'uniqlo', 'gap', 'old navy', 'banana republic', 'roots', 'lululemon', 'nike', 'adidas', 'sport chek', 'atmosphere', 'winners', 'marshalls', 'homesense', 'bed bath', 'ikea', 'structube', 'wayfair', 'home depot', 'rona', 'canadian tire', 'ct cdn tire', 'lee valley', 'best buy', 'bestbuy', 'apple store', 'microsoft store', 'the source', 'dollarama', 'miniso', 'indigo', 'chapters', 'staples', 'bureau en gros', 'sephora', 'mac cosmetics', 'shopify', 'online purchase', 'retail', 'aliexpress', 'temu', 'wish.com'], category: 'shopping' },
]

export function autoCategory(description: string): CategoryId {
  const lower = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category
    }
  }
  return 'other'
}

export function autoType(description: string, rawAmount: string): 'expense' | 'income' {
  const cat = autoCategory(description)
  if (cat === 'income') return 'income'
  // Negative amount = expense in most bank exports
  const num = parseFloat(rawAmount.replace(/[^0-9.\-]/g, ''))
  return num < 0 ? 'expense' : 'income'
}
