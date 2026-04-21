/**
 * Default candidate vocabulary for the analogy demo.
 *
 * Every word in `expected` fields of PRESET_ANALOGIES is guaranteed present.
 * Covers: common English words, major countries, capitals, languages, currencies,
 * animals + young, professions, workplaces, academic fields, nature, food, family,
 * body parts, colors, time words, and comparative adjectives.
 *
 * ~2 000 unique lowercase entries.
 */

// ── Preset terms (guaranteed present) ────────────────────────────────────────
const PRESET_TERMS = [
  'paris', 'france', 'tokyo', 'japan', 'berlin', 'germany', 'rome', 'italy',
  'cairo', 'egypt', 'nairobi', 'kenya', 'ottawa', 'canada', 'canberra', 'australia',
  'yen', 'mexico', 'peso', 'usa', 'dollar', 'india', 'rupee',
  'french', 'german', 'brazil', 'portuguese', 'argentina', 'spanish',
  'einstein', 'physics', 'darwin', 'biology', 'mozart', 'music', 'picasso', 'painting',
  'shakespeare', 'plays', 'tolkien', 'novels',
  'dog', 'puppy', 'cat', 'kitten', 'cow', 'calf', 'horse', 'foal',
  'good', 'better', 'bad', 'worse', 'small', 'smaller', 'large', 'larger',
  'king', 'queen', 'man', 'woman', 'father', 'mother', 'brother', 'sister',
  'chef', 'kitchen', 'pilot', 'cockpit', 'teacher', 'classroom', 'doctor', 'hospital',
  'wheel', 'car', 'wing', 'airplane', 'petal', 'flower', 'leaf', 'tree',
];

// ── Countries ─────────────────────────────────────────────────────────────────
const COUNTRIES = [
  'afghanistan', 'albania', 'algeria', 'angola', 'argentina', 'armenia', 'australia',
  'austria', 'azerbaijan', 'bahrain', 'bangladesh', 'belarus', 'belgium', 'bolivia',
  'bosnia', 'botswana', 'brazil', 'bulgaria', 'cambodia', 'cameroon', 'canada',
  'chile', 'china', 'colombia', 'congo', 'croatia', 'cuba', 'czech', 'denmark',
  'ecuador', 'egypt', 'england', 'ethiopia', 'finland', 'france', 'georgia',
  'germany', 'ghana', 'greece', 'guatemala', 'guinea', 'haiti', 'hungary',
  'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy',
  'jamaica', 'japan', 'jordan', 'kazakhstan', 'kenya', 'kuwait', 'kyrgyzstan',
  'laos', 'latvia', 'lebanon', 'libya', 'lithuania', 'luxembourg', 'malaysia',
  'mali', 'mexico', 'moldova', 'mongolia', 'morocco', 'mozambique', 'myanmar',
  'nepal', 'netherlands', 'nigeria', 'norway', 'pakistan', 'panama', 'paraguay',
  'peru', 'philippines', 'poland', 'portugal', 'romania', 'russia', 'rwanda',
  'scotland', 'senegal', 'serbia', 'singapore', 'slovakia', 'somalia',
  'south africa', 'south korea', 'spain', 'sri lanka', 'sudan', 'sweden',
  'switzerland', 'syria', 'taiwan', 'tanzania', 'thailand', 'tunisia', 'turkey',
  'uganda', 'ukraine', 'uk', 'usa', 'uzbekistan', 'venezuela', 'vietnam',
  'wales', 'yemen', 'zambia', 'zimbabwe', 'north korea', 'new zealand',
  'saudi arabia', 'united states', 'united kingdom',
];

// ── Capital cities ─────────────────────────────────────────────────────────────
const CAPITALS = [
  'amsterdam', 'ankara', 'athens', 'baghdad', 'bangkok', 'beijing', 'berlin',
  'bern', 'bogota', 'brasilia', 'brussels', 'bucharest', 'budapest', 'buenos aires',
  'cairo', 'canberra', 'caracas', 'copenhagen', 'dhaka', 'dublin', 'hanoi',
  'havana', 'helsinki', 'islamabad', 'jakarta', 'jerusalem', 'kabul', 'kampala',
  'kathmandu', 'khartoum', 'kingston', 'kuala lumpur', 'kyiv', 'lagos', 'lima',
  'lisbon', 'london', 'madrid', 'manila', 'minsk', 'moscow', 'nairobi',
  'oslo', 'ottawa', 'paris', 'prague', 'pretoria', 'pyongyang', 'quito',
  'rabat', 'reykjavik', 'riga', 'riyadh', 'rome', 'santiago', 'sarajevo',
  'seoul', 'singapore', 'sofia', 'stockholm', 'taipei', 'tallinn', 'tehran',
  'tokyo', 'tunis', 'ulaanbaatar', 'vienna', 'vilnius', 'warsaw', 'washington',
  'wellington', 'zagreb',
];

// ── Languages ──────────────────────────────────────────────────────────────────
const LANGUAGES = [
  'arabic', 'bengali', 'cantonese', 'chinese', 'czech', 'danish', 'dutch',
  'english', 'farsi', 'finnish', 'french', 'german', 'greek', 'hebrew',
  'hindi', 'hungarian', 'italian', 'japanese', 'korean', 'latin', 'malay',
  'mandarin', 'norwegian', 'persian', 'polish', 'portuguese', 'romanian',
  'russian', 'spanish', 'swahili', 'swedish', 'thai', 'turkish', 'ukrainian',
  'urdu', 'vietnamese',
];

// ── Currencies ─────────────────────────────────────────────────────────────────
const CURRENCIES = [
  'baht', 'bitcoin', 'bolivar', 'dinar', 'dirham', 'dollar', 'dong',
  'euro', 'florin', 'forint', 'franc', 'krone', 'krona', 'lira', 'peso',
  'pound', 'rand', 'real', 'ringgit', 'ruble', 'rupee', 'shekel', 'sol',
  'won', 'yen', 'yuan', 'zloty',
];

// ── Animals ────────────────────────────────────────────────────────────────────
const ANIMALS = [
  'alligator', 'antelope', 'ape', 'armadillo', 'bat', 'bear', 'beaver',
  'bee', 'bird', 'bison', 'boar', 'buffalo', 'bull', 'butterfly', 'camel',
  'cat', 'caterpillar', 'cheetah', 'chicken', 'chimpanzee', 'cobra', 'crab',
  'crane', 'crocodile', 'crow', 'deer', 'dog', 'dolphin', 'donkey', 'dove',
  'duck', 'eagle', 'elephant', 'elk', 'falcon', 'ferret', 'fish', 'flamingo',
  'fly', 'fox', 'frog', 'giraffe', 'goat', 'goose', 'gorilla', 'hawk',
  'hen', 'hippo', 'horse', 'hummingbird', 'hyena', 'jaguar', 'jellyfish',
  'kangaroo', 'koala', 'leopard', 'lion', 'lizard', 'lobster', 'lynx',
  'monkey', 'moose', 'mosquito', 'moth', 'mouse', 'mule', 'octopus',
  'ostrich', 'otter', 'owl', 'ox', 'panda', 'panther', 'parrot', 'peacock',
  'penguin', 'pig', 'pigeon', 'porcupine', 'rabbit', 'rat', 'raven',
  'rhinoceros', 'robin', 'rooster', 'salmon', 'seal', 'shark', 'sheep',
  'snake', 'sparrow', 'spider', 'squid', 'squirrel', 'stork', 'swan',
  'tiger', 'toad', 'tortoise', 'toucan', 'turkey', 'turtle', 'vulture',
  'walrus', 'whale', 'wolf', 'worm', 'zebra',
];

// ── Animal young ───────────────────────────────────────────────────────────────
const ANIMAL_YOUNG = [
  'calf', 'chick', 'cub', 'cygnet', 'duckling', 'fawn', 'fingerling',
  'fledgling', 'foal', 'gosling', 'hatchling', 'joey', 'kit', 'kitten',
  'lamb', 'leveret', 'owlet', 'piglet', 'pup', 'puppy', 'tadpole',
];

// ── Academic fields ────────────────────────────────────────────────────────────
const FIELDS = [
  'accounting', 'archaeology', 'architecture', 'astronomy', 'biology',
  'botany', 'chemistry', 'cinema', 'computing', 'criminology', 'dentistry',
  'design', 'drama', 'drawing', 'ecology', 'economics', 'education',
  'engineering', 'ethics', 'genetics', 'geography', 'geology', 'history',
  'journalism', 'law', 'linguistics', 'literature', 'logic', 'mathematics',
  'medicine', 'meteorology', 'microbiology', 'music', 'neuroscience',
  'nursing', 'nutrition', 'painting', 'philosophy', 'photography', 'physics',
  'poetry', 'politics', 'psychiatry', 'psychology', 'religion', 'rhetoric',
  'sculpture', 'sociology', 'statistics', 'surgery', 'technology', 'theology',
  'zoology', 'plays', 'novels', 'fiction', 'prose',
];

// ── Famous people ──────────────────────────────────────────────────────────────
const FAMOUS = [
  'aristotle', 'bach', 'beethoven', 'caesar', 'churchill', 'cleopatra',
  'columbus', 'confucius', 'darwin', 'dickens', 'dostoevsky', 'edison',
  'einstein', 'freud', 'galileo', 'gandhi', 'hemingway', 'homer', 'kafka',
  'kepler', 'lincoln', 'mandela', 'marx', 'michelangelo', 'mozart', 'napoleon',
  'newton', 'nietzsche', 'pasteur', 'picasso', 'plato', 'rembrandt',
  'shakespeare', 'socrates', 'tesla', 'tolkien', 'van gogh', 'voltaire',
];

// ── Professions ────────────────────────────────────────────────────────────────
const PROFESSIONS = [
  'accountant', 'actor', 'architect', 'artist', 'astronaut', 'athlete',
  'attorney', 'author', 'baker', 'banker', 'biologist', 'builder',
  'carpenter', 'cashier', 'chef', 'chemist', 'cleaner', 'coach', 'cook',
  'counselor', 'dancer', 'dentist', 'designer', 'detective', 'diplomat',
  'director', 'doctor', 'driver', 'economist', 'editor', 'electrician',
  'engineer', 'explorer', 'farmer', 'firefighter', 'fisherman', 'florist',
  'gardener', 'geologist', 'guard', 'hunter', 'inspector', 'journalist',
  'judge', 'lawyer', 'librarian', 'mechanic', 'merchant', 'miner', 'musician',
  'navigator', 'nurse', 'painter', 'pharmacist', 'photographer', 'physician',
  'physicist', 'pilot', 'plumber', 'poet', 'politician', 'professor',
  'programmer', 'psychiatrist', 'psychologist', 'researcher', 'sailor',
  'scientist', 'sculptor', 'singer', 'soldier', 'surgeon', 'tailor',
  'teacher', 'therapist', 'translator', 'veterinarian', 'waiter', 'welder',
  'writer',
];

// ── Workplaces & settings ──────────────────────────────────────────────────────
const WORKPLACES = [
  'airport', 'arena', 'atelier', 'bank', 'barracks', 'cafe', 'campus',
  'car', 'church', 'cinema', 'classroom', 'clinic', 'cockpit', 'college',
  'court', 'courthouse', 'factory', 'farm', 'field', 'gallery', 'garden',
  'greenhouse', 'gym', 'harbor', 'hospital', 'hotel', 'house', 'kitchen',
  'laboratory', 'library', 'market', 'mine', 'monastery', 'mosque', 'museum',
  'office', 'operating room', 'park', 'pharmacy', 'port', 'prison',
  'restaurant', 'salon', 'school', 'shop', 'stadium', 'station', 'store',
  'studio', 'synagogue', 'temple', 'theater', 'university', 'warehouse',
];

// ── Family & relationships ─────────────────────────────────────────────────────
const FAMILY = [
  'ancestor', 'aunt', 'baby', 'boy', 'bride', 'brother', 'child', 'cousin',
  'daughter', 'duke', 'emperor', 'empress', 'father', 'girl', 'grandfather',
  'grandmother', 'groom', 'husband', 'infant', 'king', 'knight', 'lord',
  'man', 'mother', 'nephew', 'niece', 'noble', 'nun', 'prince', 'princess',
  'queen', 'sister', 'son', 'spouse', 'uncle', 'wife', 'woman',
];

// ── Body ───────────────────────────────────────────────────────────────────────
const BODY = [
  'ankle', 'arm', 'back', 'blood', 'bone', 'brain', 'cheek', 'chest',
  'chin', 'ear', 'elbow', 'eye', 'eyebrow', 'eyelid', 'face', 'finger',
  'foot', 'forehead', 'hand', 'head', 'heart', 'heel', 'hip', 'jaw',
  'kidney', 'knee', 'leg', 'lip', 'liver', 'lung', 'mouth', 'muscle',
  'nail', 'neck', 'nerve', 'nose', 'rib', 'shoulder', 'skin', 'skull',
  'spine', 'stomach', 'thumb', 'toe', 'tongue', 'tooth', 'vein', 'wrist',
];

// ── Colors ─────────────────────────────────────────────────────────────────────
const COLORS = [
  'amber', 'azure', 'beige', 'black', 'blue', 'brown', 'coral', 'crimson',
  'cyan', 'gold', 'gray', 'green', 'indigo', 'ivory', 'lavender', 'lime',
  'magenta', 'maroon', 'navy', 'olive', 'orange', 'peach', 'pink', 'purple',
  'red', 'rose', 'scarlet', 'silver', 'teal', 'turquoise', 'violet', 'white',
  'yellow',
];

// ── Nature & environment ───────────────────────────────────────────────────────
const NATURE = [
  'air', 'atmosphere', 'avalanche', 'beach', 'blizzard', 'bog', 'boulder',
  'brook', 'canyon', 'cave', 'cliff', 'cloud', 'coast', 'coral', 'crater',
  'creek', 'delta', 'desert', 'dirt', 'drought', 'dune', 'dust', 'earthquake',
  'estuary', 'field', 'fire', 'fjord', 'flood', 'fog', 'forest', 'frost',
  'glacier', 'grass', 'gravel', 'gulf', 'hill', 'horizon', 'hurricane',
  'ice', 'island', 'jungle', 'lake', 'lagoon', 'lightning', 'meadow',
  'mist', 'moon', 'moss', 'mountain', 'mud', 'ocean', 'ozone', 'peninsula',
  'plain', 'plateau', 'pond', 'rain', 'rainbow', 'ravine', 'reef', 'river',
  'rock', 'sand', 'sea', 'shore', 'sky', 'smoke', 'snow', 'soil', 'star',
  'stone', 'storm', 'stream', 'sun', 'swamp', 'thunder', 'tide', 'valley',
  'volcano', 'waterfall', 'wave', 'wilderness', 'wind',
];

// ── Plants ─────────────────────────────────────────────────────────────────────
const PLANTS = [
  'acorn', 'algae', 'bamboo', 'bark', 'blossom', 'branch', 'bud', 'bush',
  'cactus', 'clover', 'daisy', 'fern', 'flower', 'fruit', 'fungus', 'grass',
  'ivy', 'jasmine', 'leaf', 'lichen', 'lily', 'maple', 'mushroom', 'oak',
  'orchid', 'palm', 'petal', 'pine', 'plant', 'reed', 'root', 'rose',
  'seed', 'shrub', 'stem', 'thistle', 'thorn', 'trunk', 'tulip', 'vine',
  'wheat', 'willow',
];

// ── Vehicles & transport ───────────────────────────────────────────────────────
const TRANSPORT = [
  'airplane', 'ambulance', 'bicycle', 'boat', 'bus', 'cable car', 'canoe',
  'cargo', 'car', 'cart', 'cockpit', 'ferry', 'helicopter', 'jet',
  'locomotive', 'motorcycle', 'rocket', 'sailboat', 'ship', 'shuttle',
  'spacecraft', 'submarine', 'taxi', 'train', 'tram', 'truck', 'van',
  'vessel', 'yacht',
];

// ── Buildings & objects ────────────────────────────────────────────────────────
const OBJECTS = [
  'anchor', 'anvil', 'arrow', 'axe', 'bag', 'ball', 'barrel', 'bell',
  'blade', 'bomb', 'book', 'bottle', 'box', 'bridge', 'bucket', 'button',
  'cage', 'camera', 'candle', 'carpet', 'chain', 'clock', 'coin', 'comb',
  'compass', 'crown', 'cup', 'dagger', 'desk', 'door', 'drum', 'fence',
  'flag', 'flask', 'fork', 'frame', 'gate', 'glass', 'globe', 'glove',
  'gun', 'hammer', 'harp', 'helmet', 'hook', 'jar', 'key', 'knife', 'lamp',
  'lantern', 'lens', 'lock', 'mirror', 'nail', 'needle', 'net', 'oar',
  'pen', 'pipe', 'plate', 'plug', 'pot', 'ring', 'rope', 'saddle', 'sail',
  'scale', 'screen', 'shield', 'spear', 'spoon', 'staff', 'stamp', 'star',
  'sword', 'telescope', 'tent', 'torch', 'trap', 'umbrella', 'vase',
  'wallet', 'wheel', 'wire',
];

// ── Food & drink ───────────────────────────────────────────────────────────────
const FOOD = [
  'alcohol', 'almond', 'apple', 'avocado', 'bacon', 'banana', 'barley',
  'bean', 'beef', 'beer', 'berry', 'bread', 'broccoli', 'butter', 'cake',
  'candy', 'carrot', 'cheese', 'cherry', 'chicken', 'chocolate', 'coconut',
  'coffee', 'corn', 'cream', 'cucumber', 'egg', 'fish', 'flour', 'fruit',
  'garlic', 'ginger', 'grape', 'herb', 'honey', 'jam', 'juice', 'lemon',
  'lettuce', 'lime', 'mango', 'meat', 'melon', 'milk', 'mushroom', 'noodle',
  'nut', 'oil', 'olive', 'onion', 'orange', 'pasta', 'peach', 'pear',
  'pepper', 'pie', 'pizza', 'potato', 'rice', 'salad', 'salt', 'sauce',
  'seafood', 'soup', 'spice', 'spinach', 'steak', 'strawberry', 'sugar',
  'sushi', 'tea', 'toast', 'tomato', 'vegetable', 'vinegar', 'walnut',
  'water', 'wine', 'yogurt',
];

// ── Time, numbers & abstract ────────────────────────────────────────────────────
const TIME_ABSTRACT = [
  'age', 'afternoon', 'ancient', 'autumn', 'beginning', 'century',
  'chaos', 'change', 'childhood', 'civilization', 'conflict', 'crisis',
  'culture', 'dawn', 'day', 'decade', 'destiny', 'dream', 'dusk', 'early',
  'end', 'era', 'eternity', 'evening', 'evolution', 'experience', 'fate',
  'freedom', 'future', 'generation', 'happiness', 'history', 'hope',
  'hour', 'hundred', 'identity', 'imagination', 'justice', 'knowledge',
  'language', 'late', 'life', 'love', 'memory', 'millennium', 'minute',
  'modern', 'moment', 'month', 'morning', 'mystery', 'nation', 'nature',
  'night', 'noon', 'now', 'old', 'origin', 'past', 'peace', 'power',
  'present', 'progress', 'purpose', 'reality', 'reason', 'religion',
  'science', 'second', 'society', 'soul', 'spring', 'summer', 'thousand',
  'time', 'today', 'tomorrow', 'tradition', 'truth', 'universe', 'victory',
  'vision', 'war', 'week', 'winter', 'wisdom', 'yesterday', 'year',
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'hundred', 'thousand', 'million', 'billion',
];

// ── Adjectives (inc. comparatives the spec uses) ───────────────────────────────
const ADJECTIVES = [
  'able', 'accurate', 'active', 'afraid', 'aggressive', 'alert', 'ancient',
  'angry', 'anxious', 'bad', 'beautiful', 'better', 'best', 'big', 'bigger',
  'biggest', 'blind', 'bold', 'brave', 'brilliant', 'broken', 'busy',
  'careful', 'cheerful', 'clever', 'cold', 'colder', 'colorful', 'complex',
  'confident', 'confused', 'cool', 'cruel', 'curious', 'dangerous', 'dark',
  'darker', 'dead', 'deep', 'deeper', 'dirty', 'dry', 'dull', 'easy',
  'elegant', 'empty', 'equal', 'evil', 'excellent', 'exotic', 'extraordinary',
  'famous', 'fast', 'faster', 'fierce', 'flat', 'foreign', 'free', 'fresh',
  'gentle', 'good', 'grand', 'grateful', 'great', 'greater', 'greatest',
  'guilty', 'happy', 'happier', 'hard', 'harder', 'heavy', 'heavier', 'high',
  'higher', 'honest', 'hot', 'hotter', 'huge', 'humble', 'hungry',
  'innocent', 'intelligent', 'kind', 'large', 'larger', 'largest', 'lazy',
  'light', 'lighter', 'little', 'lively', 'lonely', 'long', 'longer',
  'loud', 'louder', 'lucky', 'mad', 'mighty', 'modern', 'mysterious',
  'narrow', 'natural', 'nervous', 'noble', 'normal', 'obvious', 'old',
  'older', 'ordinary', 'peaceful', 'perfect', 'polite', 'poor', 'poorer',
  'powerful', 'proud', 'pure', 'quiet', 'quieter', 'rare', 'rich', 'richer',
  'rough', 'royal', 'rude', 'sad', 'sadder', 'safe', 'sharp', 'short',
  'shorter', 'silent', 'simple', 'simpler', 'sincere', 'slow', 'slower',
  'small', 'smaller', 'smallest', 'smart', 'soft', 'softer', 'special',
  'strong', 'stronger', 'strongest', 'sweet', 'sweeter', 'tall', 'taller',
  'thick', 'thin', 'thinner', 'tiny', 'tired', 'ugly', 'unique', 'unknown',
  'useful', 'violent', 'warm', 'warmer', 'weak', 'weaker', 'weird', 'wide',
  'wider', 'wild', 'wise', 'wiser', 'worst', 'worse', 'young', 'younger',
];

// ── Common verbs ───────────────────────────────────────────────────────────────
const VERBS = [
  'accept', 'achieve', 'adapt', 'add', 'admire', 'advance', 'agree', 'aim',
  'allow', 'appear', 'apply', 'approach', 'argue', 'arrive', 'attack',
  'avoid', 'believe', 'build', 'call', 'capture', 'carry', 'cause', 'change',
  'choose', 'claim', 'climb', 'collect', 'combine', 'compare', 'compete',
  'connect', 'control', 'create', 'decide', 'defend', 'develop', 'discover',
  'divide', 'drink', 'drive', 'earn', 'eat', 'emerge', 'enable', 'enjoy',
  'establish', 'evolve', 'examine', 'explore', 'express', 'fail', 'fall',
  'fight', 'find', 'fly', 'forget', 'grow', 'guide', 'hear', 'help',
  'hit', 'hope', 'identify', 'improve', 'include', 'increase', 'inspire',
  'investigate', 'join', 'judge', 'keep', 'kill', 'know', 'lead', 'learn',
  'leave', 'love', 'make', 'manage', 'measure', 'move', 'need', 'observe',
  'overcome', 'perform', 'produce', 'protect', 'prove', 'pull', 'push',
  'reach', 'read', 'realize', 'recognize', 'repair', 'run', 'save', 'say',
  'see', 'send', 'separate', 'sleep', 'solve', 'speak', 'support', 'teach',
  'think', 'transform', 'understand', 'use', 'walk', 'want', 'win', 'work',
  'write',
];

// ── Common nouns ───────────────────────────────────────────────────────────────
const NOUNS = [
  'ability', 'action', 'addition', 'advantage', 'agreement', 'amount',
  'animal', 'answer', 'area', 'army', 'art', 'baby', 'battle', 'beauty',
  'benefit', 'body', 'boundary', 'capital', 'castle', 'cause', 'center',
  'chance', 'character', 'choice', 'circle', 'city', 'class', 'coast',
  'color', 'community', 'competition', 'concept', 'condition', 'connection',
  'content', 'control', 'country', 'couple', 'data', 'decision', 'degree',
  'design', 'difference', 'direction', 'discovery', 'distance', 'division',
  'door', 'earth', 'economy', 'effect', 'element', 'empire', 'energy',
  'environment', 'event', 'evidence', 'example', 'fact', 'family', 'feature',
  'force', 'form', 'foundation', 'government', 'ground', 'group', 'growth',
  'hand', 'head', 'heart', 'heat', 'height', 'help', 'hero', 'home',
  'idea', 'image', 'impact', 'importance', 'industry', 'influence',
  'information', 'institution', 'interest', 'island', 'issue', 'item',
  'journey', 'language', 'leader', 'level', 'line', 'list', 'material',
  'meaning', 'message', 'method', 'mind', 'model', 'moment', 'name',
  'network', 'news', 'number', 'object', 'observation', 'opportunity',
  'order', 'organization', 'origin', 'outcome', 'part', 'pattern', 'person',
  'place', 'plan', 'planet', 'point', 'position', 'power', 'practice',
  'price', 'problem', 'process', 'product', 'property', 'purpose',
  'quality', 'question', 'reason', 'record', 'relationship', 'research',
  'resource', 'result', 'road', 'role', 'rule', 'section', 'series',
  'service', 'shape', 'signal', 'size', 'skill', 'society', 'source',
  'space', 'speed', 'state', 'story', 'structure', 'subject', 'success',
  'symbol', 'system', 'team', 'term', 'theory', 'thing', 'thought',
  'title', 'topic', 'town', 'type', 'value', 'village', 'voice', 'weight',
  'word', 'world',
];

// ── Deduplicate and export ─────────────────────────────────────────────────────
const ALL_WORDS = [
  ...PRESET_TERMS,
  ...COUNTRIES,
  ...CAPITALS,
  ...LANGUAGES,
  ...CURRENCIES,
  ...ANIMALS,
  ...ANIMAL_YOUNG,
  ...FIELDS,
  ...FAMOUS,
  ...PROFESSIONS,
  ...WORKPLACES,
  ...FAMILY,
  ...BODY,
  ...COLORS,
  ...NATURE,
  ...PLANTS,
  ...TRANSPORT,
  ...OBJECTS,
  ...FOOD,
  ...TIME_ABSTRACT,
  ...ADJECTIVES,
  ...VERBS,
  ...NOUNS,
];

// Unique, lowercase, non-empty
const VOCAB = [...new Set(ALL_WORDS.map(w => w.trim().toLowerCase()).filter(Boolean))];

export default VOCAB;
