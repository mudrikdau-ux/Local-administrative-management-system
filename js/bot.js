/* bot.js - Citizen AI Assistant - Production Ready */

// ============================================================
// 1. KNOWLEDGE BASE (Structured Government Information)
// ============================================================
const knowledgeBase = {
    // --- Local Government Definition ---
    'definition': {
        en: 'Local Government is a system of administration at the community level, operating under the national government to manage public services, development, and governance within specific geographical areas such as districts, towns, or municipalities. In Tanzania, Local Government Authorities (LGAs) are established under Article 145 of the Constitution of the United Republic of Tanzania (1977). There are two main types: Urban Authorities (City, Municipal, and Town Councils) and Rural Authorities (District Councils). The system brings services closer to the people.',
        sw: 'Serikali ya Mitaa ni mfumo wa utawala ngazi ya jamii, unaofanya kazi chini ya serikali kuu kusimamia huduma za umma, maendeleo, na utawala katika maeneo mahususi kama vile wilaya, miji, au manispaa. Nchini Tanzania, Mamlaka za Serikali za Mitaa (LGAs) zimeanzishwa chini ya Ibara ya 145 ya Katiba ya Jamhuri ya Muungano wa Tanzania (1977). Kuna aina mbili kuu: Mamlaka za Mijini (Halmashauri za Jiji, Manispaa, na Miji) na Mamlaka za Vijijini (Halmashauri za Wilaya). Mfumo huu unaleta huduma karibu na wananchi.'
    },
    
    // --- Objectives ---
    'objectives': {
        en: 'The objectives of Local Government in Tanzania include: (1) Promoting democratic participation and accountability at the grassroots level; (2) Ensuring efficient and effective delivery of public services to all citizens; (3) Mobilizing local resources for sustainable development; (4) Coordinating and supervising development activities within their jurisdiction; (5) Maintaining law and order at community level; (6) Protecting the environment and natural resources; (7) Promoting social and economic welfare of the people; and (8) Bridging the gap between central government and local communities.',
        sw: 'Malengo ya Serikali za Mitaa nchini Tanzania ni pamoja na: (1) Kukuza ushiriki wa kidemokrasia na uwajibikaji katika ngazi ya msingi; (2) Kuhakikisha utoaji bora na wenye ufanisi wa huduma za umma kwa wananchi wote; (3) Kuhamasisha rasilimali za mitaa kwa maendeleo endelevu; (4) Kuratibu na kusimamia shughuli za maendeleo katika eneo lao; (5) Kudumisha amani na utulivu katika ngazi ya jamii; (6) Kulinda mazingira na maliasili; (7) Kukuza ustawi wa kijamii na kiuchumi wa watu; na (8) Kuunganisha pengo kati ya serikali kuu na jamii za mitaa.'
    },
    
    // --- Structure Mainland ---
    'structure_mainland': {
        en: 'In Mainland Tanzania, Local Government is structured into two tiers: (1) Rural areas follow: Village (Kijiji) → Ward (Kata) → Division (Tarafa) → District Council (Halmashauri ya Wilaya); and (2) Urban areas follow: Street (Mtaa) → Ward (Kata) → Municipality/Town/City Council. The highest administrative authority is the District/City Executive Director, appointed by the central government. The Council is the supreme decision-making body at local level, composed of elected councilors from each ward.',
        sw: 'Katika Tanzania Bara, Serikali za Mitaa zimegawanyika katika ngazi mbili: (1) Maeneo ya vijijini yanafuata: Kijiji → Kata → Tarafa → Halmashauri ya Wilaya; na (2) Maeneo ya mjini yanafuata: Mtaa → Kata → Halmashauri ya Manispaa/Mji/Jiji. Mamlaka kuu ya utawala ni Mkurugenzi Mtendaji wa Wilaya/Jiji, anayeteuliwa na serikali kuu. Halmashauri ndicho chombo kikuu cha maamuzi katika ngazi ya mitaa, kinachoundwa na madiwani waliochaguliwa kutoka kila kata.'
    },
    
    // --- Structure Zanzibar ---
    'structure_zanzibar': {
        en: 'In Zanzibar, Local Government consists of three levels: (1) Shehia (the smallest administrative unit); (2) District (Wilaya); and (3) Region (Mkoa). The system operates under the Ministry of State, President\'s Office - Regional Administration and Local Government. Each Shehia is led by a Sheha, who is appointed by the President of Zanzibar. The District and Regional Commissioners coordinate central government activities at their respective levels.',
        sw: 'Zanzibar, Serikali za Mitaa zinajumuisha ngazi tatu: (1) Shehia (kitengo kidogo cha utawala); (2) Wilaya; na (3) Mkoa. Mfumo huu unafanya kazi chini ya Wizara ya Nchi, Ofisi ya Rais - Utawala wa Mikoa na Serikali za Mitaa. Kila Shehia inaongozwa na Sheha, anayeteuliwa na Rais wa Zanzibar. Wakuu wa Wilaya na Mikoa wanaratibu shughuli za serikali kuu katika ngazi zao husika.'
    },
    
    // --- Shehia System ---
    'shehia': {
        en: 'The Shehia is the smallest administrative unit in Zanzibar, equivalent to a village or ward in Mainland Tanzania. Each Shehia is governed by a Sheha, who is appointed by the President of Zanzibar. The Sheha is responsible for: maintaining security within the Shehia, resolving minor disputes, collecting local taxes and revenues, coordinating development activities, registering births and deaths, and acting as a link between the community and higher government authorities. There are over 300 Shehias across Unguja and Pemba islands.',
        sw: 'Shehia ni kitengo kidogo cha utawala Zanzibar, sawa na kijiji au kata katika Tanzania Bara. Kila Shehia inaongozwa na Sheha, anayeteuliwa na Rais wa Zanzibar. Sheha ana jukumu la: kudumisha usalama ndani ya Shehia, kusuluhisha migogoro midogo, kukusanya kodi na mapato ya mitaa, kuratibu shughuli za maendeleo, kusajili vizazi na vifo, na kuwa kiungo kati ya jamii na mamlaka za juu za serikali. Kuna zaidi ya Shehia 300 katika visiwa vya Unguja na Pemba.'
    },
    
    // --- District Council System ---
    'district_council': {
        en: 'The District Council (Halmashauri ya Wilaya) is the highest local government authority in rural areas of Mainland Tanzania. It is composed of: (1) Elected councilors from each ward within the district; (2) Special seat councilors (women representatives); (3) Members of Parliament from constituencies within the district; and (4) The District Executive Director who serves as secretary to the council. The council is responsible for approving annual budgets, overseeing development projects, enacting by-laws, and ensuring service delivery in education, health, roads, water, and agriculture.',
        sw: 'Halmashauri ya Wilaya ni mamlaka kuu ya serikali ya mitaa katika maeneo ya vijijini Tanzania Bara. Inaundwa na: (1) Madiwani waliochaguliwa kutoka kila kata ndani ya wilaya; (2) Madiwani wa viti maalum (wawakilishi wanawake); (3) Wabunge kutoka majimbo yaliyopo ndani ya wilaya; na (4) Mkurugenzi Mtendaji wa Wilaya ambaye ni katibu wa halmashauri. Halmashauri ina jukumu la kuidhinisha bajeti za mwaka, kusimamia miradi ya maendeleo, kutunga sheria ndogo, na kuhakikisha utoaji wa huduma katika elimu, afya, barabara, maji, na kilimo.'
    },
    
    // --- Functions (Education) ---
    'functions_education': {
        en: 'Local Governments manage primary and secondary education by: (1) Constructing and maintaining school buildings and infrastructure; (2) Employing and supervising teachers and support staff; (3) Providing teaching materials, textbooks, and equipment; (4) Managing school finances and capitation grants; (5) Enforcing compulsory school attendance; (6) Supporting adult education and vocational training programs; (7) Establishing school committees and boards; and (8) Monitoring school performance and examination results.',
        sw: 'Serikali za Mitaa zinasimamia elimu ya msingi na sekondari kwa: (1) Kujenga na kukarabati majengo ya shule na miundombinu; (2) Kuajiri na kusimamia walimu na wafanyakazi wasaidizi; (3) Kutoa vifaa vya kufundishia, vitabu, na zana; (4) Kusimamia fedha za shule na ruzuku za wanafunzi; (5) Kuhakikisha mahudhurio ya lazima shuleni; (6) Kusaidia elimu ya watu wazima na mafunzo ya ufundi; (7) Kuunda kamati na bodi za shule; na (8) Kufuatilia utendaji wa shule na matokeo ya mitihani.'
    },
    
    // --- Functions (Health) ---
    'functions_health': {
        en: 'Local Governments are responsible for primary healthcare services including: (1) Operating health centers, dispensaries, and district hospitals; (2) Conducting immunization campaigns and disease prevention programs; (3) Providing maternal and child health services (antenatal care, delivery, postnatal care); (4) Delivering health education and awareness campaigns; (5) Managing sanitation and environmental health services; (6) Coordinating local hospital referrals and emergency medical response; (7) Supervising community health workers; and (8) Collecting health data and maintaining medical records.',
        sw: 'Serikali za Mitaa zina jukumu la huduma za afya ya msingi ikiwemo: (1) Kuendesha vituo vya afya, zahanati, na hospitali za wilaya; (2) Kufanya kampeni za chanjo na programu za kuzuia magonjwa; (3) Kutoa huduma za afya ya mama na mtoto (huduma kabla ya kujifungua, kujifungua, na baada ya kujifungua); (4) Kutoa elimu ya afya na kampeni za uhamasishaji; (5) Kusimamia huduma za usafi wa mazingira na afya ya mazingira; (6) Kuratibu rufaa za hospitali za mitaa na majibu ya dharura ya matibabu; (7) Kusimamia wahudumu wa afya wa jamii; na (8) Kukusanya takwimu za afya na kutunza kumbukumbu za matibabu.'
    },
    
    // --- Functions (Roads) ---
    'functions_roads': {
        en: 'Local Governments maintain and develop road infrastructure by: (1) Constructing and rehabilitating feeder roads and rural access roads; (2) Maintaining urban roads, streets, and footpaths; (3) Managing drainage systems alongside roads; (4) Installing and maintaining road signs and safety measures; (5) Coordinating with national agencies (TANROADS) for major road projects; (6) Clearing vegetation along roadsides; and (7) Managing road reserves and ensuring they are not encroached.',
        sw: 'Serikali za Mitaa zinatunza na kuendeleza miundombinu ya barabara kwa: (1) Kujenga na kukarabati barabara za viungo na barabara za vijijini; (2) Kutunza barabara za mjini, mitaa, na njia za miguu; (3) Kusimamia mifumo ya mifereji ya maji kando ya barabara; (4) Kuweka na kutunza alama za barabarani na hatua za usalama; (5) Kuratibu na mashirika ya kitaifa (TANROADS) kwa miradi mikubwa ya barabara; (6) Kusafisha mimea kando ya barabara; na (7) Kusimamia maeneo ya hifadhi ya barabara na kuhakikisha hayavamiwi.'
    },
    
    // --- Functions (Water) ---
    'functions_water': {
        en: 'Local Governments ensure access to clean and safe water by: (1) Constructing and maintaining water supply systems and networks; (2) Drilling boreholes and constructing wells; (3) Managing water treatment and purification facilities; (4) Regulating water usage and setting water tariffs; (5) Promoting water conservation and protection of water sources; (6) Responding to water-related emergencies and shortages; (7) Establishing community water committees; and (8) Collaborating with water basin authorities for sustainable water management.',
        sw: 'Serikali za Mitaa zinahakikisha upatikanaji wa maji safi na salama kwa: (1) Kujenga na kutunza mifumo na mitandao ya usambazaji wa maji; (2) Kuchimba visima na kujenga visima; (3) Kusimamia vituo vya kusafisha na kutakasa maji; (4) Kudhibiti matumizi ya maji na kupanga bei za maji; (5) Kukuza uhifadhi wa maji na ulinzi wa vyanzo vya maji; (6) Kukabiliana na dharura na uhaba unaohusiana na maji; (7) Kuunda kamati za maji za jamii; na (8) Kushirikiana na mamlaka za bonde la maji kwa usimamizi endelevu wa maji.'
    },
    
    // --- Functions (Agriculture) ---
    'functions_agriculture': {
        en: 'Local Governments support agriculture by: (1) Providing agricultural extension services and technical advice to farmers; (2) Distributing subsidized inputs (fertilizers, seeds, pesticides); (3) Managing livestock services including dips and veterinary care; (4) Supporting irrigation schemes and water management for farming; (5) Facilitating farmer cooperatives and associations; (6) Managing local markets for agricultural produce; (7) Controlling crop and livestock diseases; and (8) Promoting modern farming techniques and technologies.',
        sw: 'Serikali za Mitaa zinasaidia kilimo kwa: (1) Kutoa huduma za ugani wa kilimo na ushauri wa kiufundi kwa wakulima; (2) Kusambaza pembejeo za ruzuku (mbolea, mbegu, dawa); (3) Kusimamia huduma za mifugo ikiwemo majosho na huduma za mifugo; (4) Kusaidia miradi ya umwagiliaji na usimamizi wa maji kwa kilimo; (5) Kuwezesha vyama vya ushirika na vikundi vya wakulima; (6) Kusimamia masoko ya mitaa kwa mazao ya kilimo; (7) Kudhibiti magonjwa ya mimea na mifugo; na (8) Kukuza mbinu na teknolojia za kisasa za kilimo.'
    },
    
    // --- Finance System ---
    'finance': {
        en: 'Local Government finance in Tanzania comes from multiple sources: (1) Local taxes and levies (property tax, service levy, business licenses, billboard fees); (2) Grants from central government (conditional grants for specific projects and unconditional grants for general operations); (3) Own-source revenue (market fees, parking fees, building permits, fines); (4) Development loans and aid from development partners; (5) Public-Private Partnerships (PPP); (6) Community contributions and cost-sharing; and (7) Agricultural produce cess. All funds are managed through transparent budgetary processes governed by the Local Government Finances Act.',
        sw: 'Fedha za Serikali za Mitaa nchini Tanzania zinatokana na vyanzo mbalimbali: (1) Kodi na ushuru wa mitaa (kodi ya mali, ushuru wa huduma, leseni za biashara, ada za mabango); (2) Ruzuku kutoka serikali kuu (ruzuku zenye masharti kwa ajili ya miradi maalum na ruzuku zisizo na masharti kwa shughuli za jumla); (3) Mapato ya ndani (ada za soko, ada za maegesho, vibali vya ujenzi, faini); (4) Mikopo ya maendeleo na misaada kutoka kwa washirika wa maendeleo; (5) Ushirikiano wa Umma na Binafsi (PPP); (6) Michango ya jamii na kugawana gharama; na (7) Ushuru wa mazao ya kilimo. Fedha zote zinasimamiwa kupitia michakato ya kibajeti iliyo wazi chini ya Sheria ya Fedha za Serikali za Mitaa.'
    },
    
    // --- Challenges ---
    'challenges': {
        en: 'Local Governments in Tanzania face several challenges including: (1) Insufficient funding and financial resources to meet growing demands; (2) Limited technical capacity and shortage of skilled personnel especially in rural areas; (3) Weak revenue collection systems and narrow tax base; (4) Corruption and mismanagement of public funds; (5) Rapid urbanization and population growth straining services; (6) Climate change impacts and environmental degradation; (7) Political interference in administrative matters; (8) Inadequate infrastructure and outdated equipment; (9) Low citizen participation in governance processes; and (10) Delays in disbursement of central government grants.',
        sw: 'Serikali za Mitaa nchini Tanzania zinakabiliwa na changamoto kadhaa zikiwemo: (1) Uhaba wa fedha na rasilimali za kifedha kukidhi mahitaji yanayoongezeka; (2) Uwezo mdogo wa kiufundi na upungufu wa wataalamu hasa maeneo ya vijijini; (3) Mifumo dhaifu ya ukusanyaji wa mapato na wigo mdogo wa kodi; (4) Rushwa na matumizi mabaya ya fedha za umma; (5) Ukuaji wa haraka wa miji na ongezeko la idadi ya watu vinavyosababisha shinikizo kwenye huduma; (6) Athari za mabadiliko ya tabianchi na uharibifu wa mazingira; (7) Kuingiliwa kwa kisiasa katika masuala ya kiutawala; (8) Miundombinu duni na vifaa vilivyopitwa na wakati; (9) Ushiriki mdogo wa wananchi katika michakato ya utawala; na (10) Ucheleweshaji wa utoaji wa ruzuku kutoka serikali kuu.'
    },
    
    // --- Solutions ---
    'solutions': {
        en: 'Proposed solutions to strengthen Local Government include: (1) Increasing fiscal decentralization and ensuring timely release of funds; (2) Building technical and managerial capacity through continuous training; (3) Strengthening revenue collection by digitizing systems and expanding the tax base; (4) Promoting transparency and accountability through public audits; (5) Enhancing citizen participation through civic education and public hearings; (6) Implementing e-governance and digital solutions for efficiency; (7) Improving coordination between central and local government; (8) Investing in sustainable and resilient infrastructure; (9) Strengthening anti-corruption mechanisms; and (10) Developing public-private partnerships for service delivery.',
        sw: 'Suluhisho zinazopendekezwa kuimarisha Serikali za Mitaa ni pamoja na: (1) Kuongeza ugatuzi wa kifedha na kuhakikisha utoaji wa fedha kwa wakati; (2) Kujenga uwezo wa kiufundi na kiutawala kupitia mafunzo endelevu; (3) Kuimarisha ukusanyaji wa mapato kwa kutumia mifumo ya kidijitali na kupanua wigo wa kodi; (4) Kukuza uwazi na uwajibikaji kupitia ukaguzi wa umma; (5) Kuongeza ushiriki wa wananchi kupitia elimu ya uraia na vikao vya hadhara; (6) Kutekeleza utawala wa kielektroniki na suluhisho za kidijitali kwa ufanisi; (7) Kuboresha uratibu kati ya serikali kuu na serikali za mitaa; (8) Kuwekeza katika miundombinu endelevu na inayostahimili; (9) Kuimarisha mifumo ya kupambana na rushwa; na (10) Kuendeleza ushirikiano wa umma na binafsi kwa utoaji wa huduma.'
    },
    
    // --- Key Officials ---
    'officials': {
        en: 'Key officials in Local Government in Tanzania include: (1) The District Executive Director (DED) - Chief administrative officer; (2) The Council Chairperson - Political head of the council; (3) The Mayor (in urban areas) - City/Municipal political leader; (4) Ward Executive Officer (WEO) - Head of ward administration; (5) Village Executive Officer (VEO) - Head of village administration; (6) The Sheha (in Zanzibar) - Head of Shehia; (7) Councilors (Madiwani) - Elected representatives from each ward; (8) Heads of Departments (Education, Health, Works, Finance, etc.); and (9) The Regional Administrative Secretary (RAS) who coordinates between regions and districts.',
        sw: 'Maafisa wakuu katika Serikali za Mitaa nchini Tanzania ni pamoja na: (1) Mkurugenzi Mtendaji wa Wilaya - Afisa mkuu wa utawala; (2) Mwenyekiti wa Halmashauri - Kiongozi wa kisiasa wa halmashauri; (3) Meya (katika maeneo ya mjini) - Kiongozi wa kisiasa wa Jiji/Manispaa; (4) Afisa Mtendaji wa Kata - Mkuu wa utawala wa kata; (5) Afisa Mtendaji wa Kijiji - Mkuu wa utawala wa kijiji; (6) Sheha (Zanzibar) - Kiongozi wa Shehia; (7) Madiwani - Wawakilishi waliochaguliwa kutoka kila kata; (8) Wakuu wa Idara (Elimu, Afya, Ujenzi, Fedha, n.k.); na (9) Katibu Tawala wa Mkoa anayeratibu kati ya mikoa na wilaya.'
    }
};

// ============================================================
// 2. KEYWORD MAPPING (For Matching Queries)
// ============================================================
const keywordMap = {
    'definition': ['definition', 'meaning', 'what is', 'define', 'local government', 'serikali za mitaa', 'maana', 'ndefinition', 'local gov', 'lga', 'explain local government'],
    'objectives': ['objectives', 'goals', 'aims', 'purpose', 'why', 'malengo', 'shabaha', 'madhumuni', 'objectives of local government', 'importance'],
    'structure_mainland': ['structure', 'mainland', 'tanzania bara', 'village', 'kijiji', 'ward', 'kata', 'division', 'tarafa', 'district council', 'halmashauri', 'urban', 'rural', 'structure of local government', 'levels', 'tiers'],
    'structure_zanzibar': ['zanzibar', 'unguja', 'pemba', 'zanzibar system', 'local government zanzibar', 'zanzibar structure', 'zanzibar local'],
    'shehia': ['shehia', 'sheha', 'zanzibar shehia', 'kitengo kidogo', 'smallest unit zanzibar', 'shehia system', 'zanzibar village'],
    'district_council': ['district council', 'halmashauri', 'halmashauri ya wilaya', 'council', 'diwani', 'councilor', 'district executive director', 'council functions', 'council members'],
    'functions_education': ['education', 'school', 'teacher', 'student', 'elimu', 'shule', 'mwalimu', 'mwanafunzi', 'primary education', 'secondary education', 'adult education', 'vocational training', 'school management'],
    'functions_health': ['health', 'hospital', 'clinic', 'dispensary', 'disease', 'immunization', 'afya', 'hospitali', 'zahanati', 'chanjo', 'magonjwa', 'mama na mtoto', 'healthcare', 'sanitation', 'maternal health'],
    'functions_roads': ['road', 'roads', 'street', 'barabara', 'drainage', 'mifereji', 'infrastructure', 'miundombinu', 'feeder road', 'urban road', 'road maintenance', 'tanroads'],
    'functions_water': ['water', 'maji', 'borehole', 'well', 'kisima', 'water supply', 'usambazaji wa maji', 'clean water', 'maji safi', 'water treatment', 'water committee'],
    'functions_agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'kilimo', 'mifugo', 'mazao', 'extension services', 'fertilizer', 'mbolea', 'irrigation', 'umwagiliaji', 'cooperative'],
    'finance': ['finance', 'funding', 'budget', 'tax', 'kodi', 'revenue', 'mapato', 'grant', 'rufuku', 'funds', 'fedha', 'public-private partnership', 'community contribution', 'bajeti', 'levy', 'cess'],
    'challenges': ['challenge', 'challenges', 'problem', 'issues', 'changamoto', 'matatizo', 'difficulties', 'obstacles', 'weaknesses', 'shortcomings', 'limitations'],
    'solutions': ['solution', 'solutions', 'improve', 'strengthen', 'suluhisho', 'recommendation', 'reform', 'strategy', 'way forward', 'proposal', 'mapendekezo'],
    'officials': ['official', 'officials', 'leader', 'afisa', 'director', 'mkurugenzi', 'chairman', 'mwenyekiti', 'mayor', 'meya', 'executive officer', 'sheha', 'councilor', 'diwani', 'who leads']
};

// ============================================================
// 3. GREETINGS & RESPONSES
// ============================================================
const greetings = {
    en: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'hola', 'how are you', 'whats up', 'yo'],
    sw: ['habari', 'mambo', 'vipi', 'shikamoo', 'marahaba', 'hujambo', 'sijambo', 'hamjambo', 'hatujambo', 'salama', 'chei']
};

const identityQuestions = [
    'who are you', 'what can you do', 'tell me about yourself', 'your name', 'what is your purpose',
    'nani wewe', 'unaweza kufanya nini', 'jiambie', 'jina lako', 'what do you do', 'how can you help',
    'what are you', 'introduce yourself', 'what is this', 'how do you work'
];

const politeResponses = [
    'thank you', 'thanks', 'asante', 'asante sana', 'thankyou', 'thank u', 'thx', 'cheers',
    'bye', 'goodbye', 'see you', 'tutaonana', 'kwaheri', 'see ya', 'catch you later',
    'have a nice day', 'nice', 'great', 'awesome', 'good', 'well done', 'perfect'
];

// ============================================================
// 4. RESPONSE GENERATOR
// ============================================================
class ResponseEngine {
    constructor() {
        this.knowledge = knowledgeBase;
        this.keywords = keywordMap;
    }

    // --- Language Detection ---
    detectLanguage(text) {
        const swWords = ['habari', 'mambo', 'vipi', 'shikamoo', 'nini', 'serikali', 'mitaa', 'wilaya', 'kata', 'kijiji', 'shehia', 'halmashauri', 'maendeleo', 'huduma', 'fedha', 'kodi', 'afya', 'elimu', 'barabara', 'maji', 'kilimo', 'mifugo', 'mazao', 'chanjo', 'zahanati', 'mkurugenzi', 'mwenyekiti', 'meya', 'diwani', 'bajeti', 'mapato', 'changamoto', 'suluhisho', 'ushirikiano', 'uwazi', 'uwajibikaji'];
        const enWords = ['what', 'how', 'why', 'where', 'when', 'which', 'who', 'the', 'is', 'are', 'was', 'were', 'local', 'government', 'district', 'council', 'health', 'education', 'road', 'water', 'finance', 'agriculture', 'structure', 'function'];
        
        const words = text.toLowerCase().split(/\s+/);
        let swScore = 0, enScore = 0;
        
        for (const w of words) {
            if (swWords.some(sw => w.includes(sw))) swScore += 2;
            if (enWords.some(en => w.includes(en))) enScore++;
        }
        
        // Check for explicit Kiswahili question words
        if (text.match(/(nini|gani|wapi|lini|nani|kwa nini|je|vipi)/i)) swScore += 3;
        if (text.match(/(what|how|why|where|when|who|which|is|are|do|does)/i)) enScore += 2;
        
        return swScore > enScore ? 'sw' : 'en';
    }

    // --- Greeting Detection ---
    isGreeting(text, lang) {
        const clean = text.toLowerCase().trim();
        const allGreetings = [...greetings.en, ...greetings.sw];
        return allGreetings.some(g => clean.includes(g) || clean === g);
    }

    // --- Identity Detection ---
    isIdentityQuestion(text) {
        const clean = text.toLowerCase().trim();
        return identityQuestions.some(q => clean.includes(q) || clean === q);
    }

    // --- Polite Detection ---
    isPolite(text) {
        const clean = text.toLowerCase().trim();
        return politeResponses.some(p => clean.includes(p) || clean === p);
    }

    // --- Keyword Matching with Priority ---
    matchQuery(text, lang) {
        const clean = text.toLowerCase().trim();
        const results = [];
        
        for (const [key, keywords] of Object.entries(this.keywords)) {
            let score = 0;
            for (const kw of keywords) {
                if (clean.includes(kw.toLowerCase())) {
                    // Score based on keyword length and specificity
                    score += kw.split(' ').length * 2;
                    // Boost score for exact matches
                    if (clean === kw.toLowerCase()) score += 10;
                    if (clean.startsWith(kw.toLowerCase()) || clean.endsWith(kw.toLowerCase())) score += 5;
                    // Multi-word matches are stronger
                    if (kw.includes(' ') && clean.includes(kw.toLowerCase())) score += 3;
                }
            }
            if (score > 0) {
                results.push({ key, score });
            }
        }
        
        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);
        
        if (results.length === 0) return null;
        
        // Return best match if score is significant
        const best = results[0];
        if (best.score >= 2) {
            const response = this.knowledge[best.key];
            return response ? (response[lang] || response.en) : null;
        }
        return null;
    }

    // --- Generate Response ---
    generateResponse(text) {
        const lang = this.detectLanguage(text);
        const clean = text.toLowerCase().trim();

        // Handle greetings
        if (this.isGreeting(text, lang)) {
            return lang === 'sw' 
                ? 'Habari! Karibu katika Citizen AI Assistant. Mimi ni msaidizi wako wa kidijitali kwa taarifa za Serikali za Mitaa. Ninaweza kukusaidia kuhusu muundo, kazi, changamoto, na masuala mengine ya Serikali za Mitaa. Tafadhali uliza swali lolote!'
                : 'Hello! Welcome to the Citizen AI Assistant. I am your digital assistant for Local Government information. I can help you with the structure, functions, challenges, and other matters of Local Government. Please ask me anything!';
        }

        // Handle identity questions
        if (this.isIdentityQuestion(text)) {
            return lang === 'sw'
                ? 'Mimi ni Citizen AI Assistant, msaidizi wako wa kidijitali wa Serikali za Mitaa. Nimeundwa kukupa taarifa sahihi na za kuaminika kuhusu muundo, kazi, changamoto, fedha, viongozi, na masuala mengine ya Serikali za Mitaa nchini Tanzania na Zanzibar. Ninaweza kukusaidia kwa Kiingereza au Kiswahili. Uliza swali lolote!'
                : 'I am the Citizen AI Assistant, your digital Local Government assistant. I am designed to provide you with accurate and reliable information about the structure, functions, challenges, finances, officials, and other matters of Local Government in Tanzania and Zanzibar. I can assist you in English or Kiswahili. Ask me anything!';
        }

        // Handle polite responses
        if (this.isPolite(text)) {
            const thankResponses = {
                en: 'You are most welcome! It is my pleasure to assist you. If you need further information about Local Government, feel free to ask anytime.',
                sw: 'Karibu sana! Ni furaha yangu kukusaidia. Kama unahitaji taarifa zaidi kuhusu Serikali za Mitaa, usisite kuuliza wakati wowote.'
            };
            const byeResponses = {
                en: 'Thank you for using the Citizen AI Assistant. I wish you a productive day. Feel free to come back if you need more assistance about Local Government.',
                sw: 'Asante kwa kutumia Citizen AI Assistant. Nakutakia siku njema. Karibu tena ukipata mahitaji zaidi kuhusu Serikali za Mitaa.'
            };
            
            if (clean.match(/(bye|goodbye|kwaheri|tutaonana|see you)/i)) {
                return lang === 'sw' ? byeResponses.sw : byeResponses.en;
            }
            return lang === 'sw' ? thankResponses.sw : thankResponses.en;
        }

        // Query matching
        const response = this.matchQuery(text, lang);
        if (response) {
            return response;
        }

        // Fallback for queries with "local government" but no specific match
        if (clean.includes('local government') || clean.includes('serikali za mitaa') || clean.includes('lga') || clean.includes('halmashauri')) {
            return lang === 'sw'
                ? 'Ninaelewa unatafuta taarifa kuhusu Serikali za Mitaa. Tafadhali uliza swali maalum kama vile: "Muundo wa Serikali za Mitaa", "Kazi za Halmashauri", "Changamoto za Serikali za Mitaa", "Mfumo wa Zanzibar", "Fedha za Serikali za Mitaa", au "Viongozi wa Serikali za Mitaa".'
                : 'I understand you are looking for information about Local Government. Please ask a specific question such as: "Structure of Local Government", "Functions of LGAs", "Challenges of Local Government", "Zanzibar system", "Local Government Finance", or "Local Government Officials".';
        }

        // Default fallback
        return lang === 'sw'
            ? 'Samahani, sina taarifa za kutosha kuhusu mada hiyo. Tafadhali wasiliana na msimamizi wa mfumo kwa msaada zaidi. Unaweza pia kuuliza kuhusu: Muundo wa Serikali za Mitaa, Kazi za Halmashauri, au Changamoto za Serikali za Mitaa.'
            : 'I apologize, I do not have enough information about that topic. Please contact the system administrator for more assistance. You can also ask about: Structure of Local Government, Functions of LGAs, or Challenges of Local Government.';
    }
}

// ============================================================
// 5. CHATBOT CLASS
// ============================================================
class ChatBot {
    constructor() {
        this.responseEngine = new ResponseEngine();
        this.messages = [];
        this.isOpen = false;
        this.isTyping = false;
        this.initialized = false;
        
        // DOM Elements
        this.container = null;
        this.window = null;
        this.toggle = null;
        this.messagesContainer = null;
        this.input = null;
        this.sendBtn = null;
        this.typingIndicator = null;
        this.clearBtn = null;
        this.quickActions = null;
        this.statusText = null;
        
        this.init();
    }

    // --- Initialize ---
    init() {
        if (this.initialized) return;
        this.createDOM();
        this.attachEvents();
        this.loadChatHistory();
        this.initialized = true;
        console.log('Citizen AI Assistant initialized successfully.');
    }

    // --- Create DOM Elements ---
    createDOM() {
        // Container
        this.container = document.createElement('div');
        this.container.className = 'chatbot-container';
        this.container.id = 'citizen-chatbot';
        
        // Toggle Button
        this.toggle = document.createElement('button');
        this.toggle.className = 'chatbot-toggle';
        this.toggle.setAttribute('aria-label', 'Toggle chat');
        this.toggle.innerHTML = `
            <span class="icon-open">💬</span>
            <span class="icon-close">✕</span>
            <span class="status-dot"></span>
        `;
        
        // Window
        this.window = document.createElement('div');
        this.window.className = 'chatbot-window';
        
        // Header
        const header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <div class="chatbot-header-left">
                <div class="chatbot-avatar">🏛</div>
                <div class="chatbot-header-info">
                    <h3>Citizen AI Assistant</h3>
                    <div class="status-text">
                        <span class="dot"></span>
                        <span>Online</span>
                    </div>
                </div>
            </div>
            <div class="chatbot-header-actions">
                <button id="chat-minimize" aria-label="Minimize" title="Minimize">─</button>
                <button id="chat-close" aria-label="Close" title="Close">✕</button>
            </div>
        `;
        this.statusText = header.querySelector('.status-text');
        
        // Messages
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chatbot-messages';
        
        // Typing Indicator
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'typing-indicator';
        this.typingIndicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        this.messagesContainer.appendChild(this.typingIndicator);
        
        // Quick Actions
        const actions = document.createElement('div');
        actions.className = 'quick-actions';
        actions.innerHTML = `
            <button data-msg="What is Local Government?">🏛 What is Local Government?</button>
            <button data-msg="Functions of LGAs">📋 Functions of LGAs</button>
            <button data-msg="Tell me about Zanzibar system">🌴 Zanzibar System</button>
            <button data-msg="Challenges of Local Government">⚠️ Challenges</button>
        `;
        this.quickActions = actions;
        
        // Input Area
        const inputArea = document.createElement('div');
        inputArea.className = 'chatbot-input-area';
        this.input = document.createElement('textarea');
        this.input.placeholder = 'Type your message...';
        this.input.rows = 1;
        this.input.setAttribute('aria-label', 'Type your message');
        
        this.sendBtn = document.createElement('button');
        this.sendBtn.className = 'send-btn';
        this.sendBtn.innerHTML = '➤';
        this.sendBtn.setAttribute('aria-label', 'Send message');
        this.sendBtn.disabled = true;
        
        inputArea.appendChild(this.input);
        inputArea.appendChild(this.sendBtn);
        
        // Clear Chat Button (hidden initially)
        this.clearBtn = document.createElement('button');
        this.clearBtn.className = 'clear-chat-btn';
        this.clearBtn.innerHTML = '🗑';
        this.clearBtn.setAttribute('aria-label', 'Clear chat history');
        this.clearBtn.title = 'Clear chat';
        this.messagesContainer.appendChild(this.clearBtn);
        
        // Assemble
        this.window.appendChild(header);
        this.window.appendChild(this.messagesContainer);
        this.window.appendChild(actions);
        this.window.appendChild(inputArea);
        
        this.container.appendChild(this.toggle);
        this.container.appendChild(this.window);
        
        document.body.appendChild(this.container);
        
        // Store references
        this.minimizeBtn = header.querySelector('#chat-minimize');
        this.closeBtn = header.querySelector('#chat-close');
    }

    // --- Attach Events ---
    attachEvents() {
        // Toggle
        this.toggle.addEventListener('click', () => this.toggleChat());
        
        // Minimize
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat(false);
        });
        
        // Close
        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChat(false);
        });
        
        // Send
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Input
        this.input.addEventListener('input', () => {
            this.autoResize();
            this.sendBtn.disabled = this.input.value.trim().length === 0;
        });
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Quick Actions
        this.quickActions.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn) {
                this.input.value = btn.dataset.msg;
                this.sendMessage();
            }
        });
        
        // Clear Chat
        this.clearBtn.addEventListener('click', () => this.clearChat());
        
        // Click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                this.toggleChat(false);
            }
        });
    }

    // --- Toggle Chat ---
    toggleChat(open) {
        this.isOpen = open !== undefined ? open : !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        this.toggle.classList.toggle('active', this.isOpen);
        
        if (this.isOpen) {
            this.input.focus();
            this.scrollToBottom();
            if (this.messages.length > 0) {
                this.clearBtn.classList.add('visible');
            }
        } else {
            this.clearBtn.classList.remove('visible');
        }
    }

    // --- Send Message ---
    sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;
        
        this.addMessage('user', text);
        this.input.value = '';
        this.autoResize();
        this.sendBtn.disabled = true;
        this.saveChatHistory();
        
        // Show typing indicator
        this.showTyping(true);
        
        // Simulate response delay
        const delay = 500 + Math.random() * 800;
        setTimeout(() => {
            this.showTyping(false);
            const response = this.responseEngine.generateResponse(text);
            this.addMessage('bot', response);
            this.saveChatHistory();
            
            if (this.messages.length > 0) {
                this.clearBtn.classList.add('visible');
            }
        }, delay);
    }

    // --- Add Message ---
    addMessage(type, text) {
        const msg = {
            type: type,
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.messages.push(msg);
        this.renderMessage(msg);
        this.scrollToBottom();
    }

    // --- Render Message ---
    renderMessage(msg) {
        const div = document.createElement('div');
        div.className = `message ${msg.type}`;
        div.innerHTML = `
            <span>${msg.text}</span>
            <span class="timestamp">${msg.timestamp}</span>
        `;
        this.messagesContainer.insertBefore(div, this.typingIndicator);
    }

    // --- Show Typing ---
    showTyping(active) {
        this.isTyping = active;
        this.typingIndicator.classList.toggle('active', active);
        this.scrollToBottom();
    }

    // --- Scroll to Bottom ---
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    // --- Auto Resize Textarea ---
    autoResize() {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    // --- Save Chat History ---
    saveChatHistory() {
        try {
            const data = this.messages.map(m => ({
                type: m.type,
                text: m.text,
                timestamp: m.timestamp
            }));
            localStorage.setItem('citizen_chat_history', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save chat history:', e);
        }
    }

    // --- Load Chat History ---
    loadChatHistory() {
        try {
            const data = localStorage.getItem('citizen_chat_history');
            if (data) {
                const history = JSON.parse(data);
                if (Array.isArray(history) && history.length > 0) {
                    const existing = this.messagesContainer.querySelectorAll('.message');
                    existing.forEach(el => el.remove());
                    
                    history.forEach(msg => {
                        this.messages.push(msg);
                        this.renderMessage(msg);
                    });
                    this.scrollToBottom();
                    
                    if (this.messages.length > 0) {
                        this.clearBtn.classList.add('visible');
                    }
                }
            }
        } catch (e) {
            console.warn('Could not load chat history:', e);
        }
    }

    // --- Clear Chat ---
    clearChat() {
        if (this.messages.length === 0) return;
        
        if (confirm('Are you sure you want to clear all chat history?')) {
            const messages = this.messagesContainer.querySelectorAll('.message');
            messages.forEach(el => el.remove());
            this.messages = [];
            localStorage.removeItem('citizen_chat_history');
            this.clearBtn.classList.remove('visible');
            
            const welcome = {
                en: 'Hello! I am the Citizen AI Assistant. How may I assist you with Local Government information today?',
                sw: 'Habari! Mimi ni Citizen AI Assistant. Je, ninaweza kukusaidia vipi kuhusu taarifa za Serikali za Mitaa leo?'
            };
            this.addMessage('bot', welcome.en);
            this.saveChatHistory();
        }
    }
}

// ============================================================
// 6. INITIALIZE ON DOM READY
// ============================================================
let chatbotInstance = null;

function initChatBot() {
    if (!chatbotInstance) {
        chatbotInstance = new ChatBot();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatBot);
} else {
    initChatBot();
}

// ============================================================
// 7. EXPOSE FOR DEBUGGING (Optional)
// ============================================================
if (window) {
    window.CitizenAI = {
        getInstance: () => chatbotInstance,
        getKnowledgeBase: () => knowledgeBase,
        getResponseEngine: () => chatbotInstance ? chatbotInstance.responseEngine : null
    };
}

console.log('Citizen AI Assistant loaded successfully with expanded knowledge base.');