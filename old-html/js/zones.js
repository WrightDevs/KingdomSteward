// js/zones.js

// Comprehensive configuration for standardized Zones and Churches
// This ensures data integrity for the Leader Dashboard matching.
// Data source: dashboard.reachoutworld.org (Zonal List + Groups Report)
// Note: "NA" and "NOT SET" entries have been removed - only named groups remain

const kingdomZones = {
  // ========== INTERNATIONAL MINISTRIES (ISM) ==========
  "GYLF": [],
  "ISM": ["Africa group", "Asia group", "Europe region", "Nigeria group"],
  "ISM Africa": [],
  "ISM Asia": [],
  "ISM Europe region": [],
  "ISM Middle East": [],
  "ISM Nigeria": [],
  "ISM North America": [],
  "ISM Oceania": [],
  "ISM South America": [],
  "ISM UGANDA": ["UGANDA CHURCHES", "UGANDA ISM CHURCHES", "OTHER CHURCHES"],

  // ========== REACHOUT & REON ==========
  "Reachout Campaigns": [],
  "REON": ["REON WEST AFRICA", "REON OCEANIA", "REON SOUTHERN AFRICA", "REON EAST AFRICA", "REON ASIA", "REON SOUTH AMERICA"],
  "REON Resource Center": [],
  "RIN": [],
  "TNI": ["Southern Africa Center 2", "Asia Center 7", "Southern Africa Center 3", "South Pacific Center 5", "South Pacific Center 2", "Caribbean Americas Center 4", "South Pacific Center 1", "Caribbean Americas Center 2", "TNI Ghana", "UK Center 2", "Caribbean Americas Center 1", "Central and South Americas", "Asia center 4", "Europe Center 3", "TNI South South Nigeria", "North Central Nigeria 2", "TNICC", "West Africa Center 2", "East Africa Center 4", "West Africa Center 4", "Southern Africa Center 1", "TNI Cambodia", "North America Center- TNI Quebec", "TNI North East Nigeria 1", "Asia Center 6", "East Africa Center 2", "Asia Center 1", "Asia Center 5", "North America Center 1", "Europe Center 7", "TNI Spain", "North America Center - USA 2", "East Africa Center 5", "North America Center -TNI Canada", "TNI South East Nigeria", "Europe Center 2", "TNI Kenya", "Asia Center 3", "TNI Ukraine", "East Africa Center 1", "TNI Germany 2", "North America Center 2", "TNI South West Nigeria"],

  // ========== NIGERIA ZONES ==========
  "Aba Zone": ["WWC", "Test Group A", "Test Group One", "OSISIOMA GROUP", "ABA SOUTH 1 GROUP", "ABA SOUTH 2 GROUP", "EXPRESS GROUP", "ABA NORTH CENTRAL GROUP", "Test Group Four", "WWC church 1", "Umuode", "ABAYI GROUP", "CE 106 Umungasi", "ABA MODEL GROUP", "Yellow Avenue", "Ariaria", "CE Owerrintta"],

  "Abuja Zone": ["BWARI GROUP", "ZC GROUP 1", "KUBWA GROUP", "ZC GROUP2", "KADO GROUP", "JABIGROUP", "GLORY GROUP", "ZUBA GROUP", "BROOKS OF BLISS GROUP", "DEI DEI GROUP", "ZC GROUP 3", "KUJEABJZ GROUP", "SUBURBANCITY GROUP", "KUBWA 2 GROUP", "LOKOGOMAABJZ GROUP", "NEW HORIZON GROUP", "GARKI GROUP ABJZ", "WUYE GROUP", "CEAZ YOUTH CHURCHES", "CEAZ TEENS CHURCHES", "MAITAMA GROUP", "TEENS CHURCHES", "CENTRAL AREA GROUP", "BOUNDLESS GRACE GROUP", "CEAZ INTL MISSIONS", "SULEJA GROUP", "GWARINPA GROUP", "ZC GROUP 4", "PROLIFIC GROUP"],

  "Abuja Zone 2": ["WUYE GROUP"],

  "Accra Zone": ["WEIJA GROUP", "KUMASI 1 GROUP", "KOFORIDUA GROUP", "LAA GROUP", "BEREKUM GROUP", "Accra Ghana", "KORLE BU GROIUP", "CAPECOAST GROUP", "SPINTEX GROUP", "KASOA GROUP", "KUMASI 3 GROUP", "ACHIMOTA GROUP", "youth churches group", "KETA GROUP", "AFLAO GROUP", "OLD WEIJA GROUP", "TAMALE GROUP", "HO GROUP", "TAKORADI 1 GROUP", "MATAHEKO GROUP", "ADENTA GROUP", "OSU GROUP", "TAKORADI 2 GROUP", "KUMASI 2 GROUP", "ATOMIC GROUP", "TARKWA GROUP", "LEGON 2 GROUP", "TAIFA GROUP", "DOME GROUP", "AGBOZU ME GROUP", "South Pacific Center 1", "AKIM ODA GROUP", "BLW ZONE J GROUP C", "westafricareongroup", "WEST LEGON GROUP"],

  "All African Students Union": [],

  "Australia / South Pacific": ["Pacific Group", "Sydney Group", "CE TONGA GROUP", "Brisbane Group", "Perth Group"],

  "Benin Zone 1": ["MISSIONS 2", "MISSIONS 5", "EREDIAUWA GROUP", "MISSIONS 6", "Teens and Youth Church", "AMAZING", "CELEBRITY TEENS/YOUTH CHURCH", "ONLINE CHURCH", "Missions 7", "PILLARS", "MISSIONS 3", "SUPERNATURAL", "Celebrity Teens & Youth Church 1", "ACHIEVERS", "GREATERLIGHTS", "CENTRAL MISSIONS 2", "GARRICK SUB GROUP", "COMFORTERS", "GREATERLIGHT", "MISSIONS 4", "Sapele Road Sub Group"],

  "Benin Zone 2": ["EXTENSION GROUP", "CENTRAL GROUP 1", "AGBOR ROAD GROUP", "CENTRAL GROUP 3", "CENTRAL GROUP 2", "CE YOUTH/TEENS CHURCH", "OKA GROUP", "SAKPONBA GROUP"],

  // ========== BLW ZONES (BELIEVERS' LOVEWORLD) ==========
  "BLW GHANA SUB ZONE D": [],
  "BLW Benin Republic": [],
  "BLW Benin Republic Zone A": [],
  "BLW Benin Republic Zone B": [],
  "BLW Burkina Faso": [],
  "BLW Burkina Faso Group": [],
  "BLW Cameroon Sub-Group 1": [],
  "BLW CAMEROON SUB-GROUP 2": ["BLW CAMEROON GROUP 2"],
  "BLW Cameroon Sub-Group 3": [],
  "BLW CAMEROON ZONE": [],
  "Blw Cameroon Zone A": [],
  "Blw Cameroon Zone B": [],
  "BLW Campus Ministry West Africa Region": ["BLW India"],
  "BLW Canada Sub Region": ["Central Group Canada Sub Region", "Central East Group"],
  "BLW CHURCH ZONE": ["LOVEWORLD CHURCH GROUP 2", "LOVEWORLD CHURCH GROUP 4", "LOVEWORLD CHURCH GROUP 6", "LOVEWORLD CHURCH GROUP 7", "LW SUB GROUP 3", "LW SUB GROUP 2", "LOVEWORLD CHURCH GROUP 5", "PROLIFIC BERGER GROUP", "CE LWC ENUGU GROUP 8", "LOVEWORLD CHURCH GROUP 1", "CE LWC BENIN GROUP 6", "CE LWC MAINLAND GROUP 3", "LW SUB GROUP 1"],
  "BLW Cote D'Ivoire": [],
  "Blw DRC Congo and South Sudan Zone": [],
  "BLW East & Central Africa": [],
  "BLW East & Central Africa Region": [],
  "BLW Europe": [],
  "BLW Europe Region": [],
  "BLW Europe Zone 1 dsp": ["London Group 1"],
  "BLW Gambia": [],
  "BLW GHANA SUB-ZONE C": ["Unending Grace", "Rivers of Grace", "The West"],
  "BLW GHANA SUB-ZONE E": [],
  "BLW GHANA SUB-ZONE F": [],

  // ========== ADDITIONAL ZONES FROM GROUPS REPORT ==========
  "BENINZ1": ["beninz1"],
  "ECA ZONE 3": ["Main Church Group A", "Luzira Group", "Wandegeya Group", "Entebbe Group", "Juba 1 Group", "Gaba Group", "Mukono Group", "Arua Group", "CE MAIN CHURCH NAALYA", "Haikuwait Sub - Group", "Ndeeba Sub-Group", "Mbale Group", "Airport Road Group", "EWCVZ3", "Mbarara Group", "Nyanama Group", "Seychelles Group", "Rwanda Group", "Northern Ug Sub - Group", "Suriname Group", "Soroti Sub - Group", "DUNAMIS MAIN CHURCH GROUP", "HAI JEBEL GROUP", "Soroti Group", "Main Church Group B", "Eastern Uganda Group", "RHEMA MAIN CHURCH GROUP", "Jinja Group", "CHARISMA MAIN CHURCH GROUP", "CE main church most prolific pcf", "DIPLOMAT MAINCHURCH GROUP", "Kingklasspcf", "HAVEN MAIN CHURCH GROUP", "ROYAL DIADEM MAIN CHURCH GROUP", "EASTERN UG GROUP", "CHARIS MAIN CHURCH GROUP", "IMPACT MAIN CHURCH GROUP", "SWAN MAIN CHURCH GROUP", "FORTPORTAL", "LORDS & KINGS MAIN CHURCH GROUP", "CE JUBA 2 MAIN", "Rwanda 2 Group", "Lologo Sub - Group"],

  "ECA ZONE 4": ["DOUALA Group", "Bamenda Group", "Buea", "Yaounde Group2", "Bonaberi", "Equatorial Guinea", "Kumba", "Limbe", "Yaounde Group 1", "Douala Group 2", "Libreville", "Congo Brazzaville", "GABON Group", "Pointe-Noire group", "BLW ZONE C GROUP 4"],

  "ECA ZONE 2": ["CETOGO1", "CECOTEDIVOIRE", "CEBENIN", "CESENEGAL", "CEBURKINA", "CECIEXT", "CETOGO2", "CEMOROCCO", "CEMALI", "CENIGER", "CEGUINEA", "CETEENS", "CEFLW"],

  "ECA ZONE 5": ["GAMBIA GROUP", "ASHAIMAN GROUP", "CONGO CROSS GROUP", "CE NUNGUA GROUP", "TRIUMPHANT GROUP", "TEMA GROUP", "KISSY GROUP", "TESHIE GROUP", "PAYNESVILLE GROUP", "DENU GROUP", "LASHIBI GROUP", "CE GLORY LAND", "East Legon Group", "WATERLOO GROUP", "BO GROUP", "ADENTA GROUPZ5", "MONROVIA GROUP", "MAKENI GROUP", "MICHEL NATION GROUP"],

  "ECA ZONE 6": ["CE TANZANIA", "CE DR CONGO", "CE MAURITIUS", "CE BURUNDI"],
  "ECA ZONE 1": [],
  "ECA ZONE 3b": ["GULU GROUP2", "NDEEBA GROUP"],
  "ECA ZONE 7": ["MBEZI GROUP"],

  // ========== SOUTH AFRICA ZONES ==========
  "SA Zone 1": ["Randburg Group", "Sandton Group", "Port Elizabeth Group", "Newlands Group", "Rusternburg Group", "Krugersdorp Group", "Midrand Group", "Limpopo Group", "East London Group", "Polokwane Group", "Rivonia Group", "Soweto Group", "Randburg Extension Group", "Midrand Gallagher group", "testinggroup"],

  "SA Zone 2": ["CE SOUTH GROUP", "CE PRETORIA GROUP", "CE SUNNINGHILL GROUP", "CE NAMIBIA GROUP", "CE YOEVILLE GROUP", "CE KENSINGTON GROUP", "CE KEMPTON PARK GROUP", "CE GERMINSTON GROUP", "KEMPTON PARK GROUP", "CE ANGOLA GROUP", "CE DURBAN GROUP", "CE KIMBERLEY GROUP", "CE NORTHERN CAPE GROUP"],

  "SA Zone 3": ["Botswana Group", "Zambia Group", "Eswatini Group", "Mozambique Group", "Lesotho Group", "Malawi North Group", "Malawi South Group"],
  "SA Zone 4": [],
  "SA Zone 5": ["Belvedere Group", "Mutare Group"],

  "Loveworld SA Zone A": ["APK", "Johannesburg South", "Pretoria East", "Pretoria North", "Turfloop", "North West", "Venda", "Johannesburg North", "Johannesburg Central", "Vaal", "UJ", "Mpumalanga", "Limpopo", "Vaal/Northwest", "Pretoria West"],
  "Loveworld SA Zone B": [],
  "Loveworld SA Zone C": ["Free State", "Western Cape"],
  "Loveworld SA Zone D": [],
  "Loveworld SA Zone E": [],
  "Loveworld Zone C": ["ZONE C GROUP 1", "BLW ZONE C GROUP 4", "BLW ZONE C GROUP G", "BLW ZONE C GROUP 2", "BLW ZONE C GROUP 3", "BLW ZONE C GROUP 6", "FGCC"],
  "Loveworld Zone B": ["Enugu Group", "NAU Group", "Ebonyi Group", "Uli Group", "Oko Group", "Igbariam Group", "NSEVZ1"],
  "Loveworld Zone A": ["Blw Ekpoma Group", "Blw Abraka Group", "BLW Kogi Group"],
  "Loveworld Zone D": ["BLW ABU CHAPTER"],
  "Loveworld Zone E": ["University of Ibadan group", "Kwara group", "Osun group"],
  "Loveworld Zone F": ["FUTO GROUP", "MOUAU GROUP", "IMSU GROUP", "BLW ABSU GROUP", "IMO POLY GROUP"],
  "Loveworld Zone G": ["Futa Group", "Aaua Group", "Eksu Group"],
  "Loveworld Zone H": ["OASIS OF GRACE", "BOUNDLESS GRACE", "CHURCH MINISTRY", "SONS OF CONSOLATION", "FLOURISHING GROUP"],
  "Loveworld Zone I": [],
  "Loveworld Zone J": ["BLW ZONE J GROUP A", "BLW ZONE J GROUP F", "BLW ZONE J GROUP D", "BLW ZONE J GROUP E", "BLW ZONE J GROUP G", "BLW ZONE J GROUP B", "BLW ZONE J GROUP C"],
  "Loveworld Zone K": ["LWZK", "ABUJA", "NASSARAWA", "BENUE", "NIGER"],
  "Loveworld zone L": ["BLW UNIUYO GROUP", "BLW CRUTECH GROUP", "BLW UNICAL GROUP"],
  "Loveworld Zone M": [],
  "Loveworld Zone N": [],

  // ========== CANADA ZONES ==========
  "Toronto Zone": ["Calgary Group", "SCABOROUGH GROUP", "TORONTO GROUP", "TORONTO GROUP 1", "EDMONTON GROUP", "MILTON GROUP", "TORONTO GROUP 4", "TORONTO GROUP 5", "TORONTO GROUP 7", "TORONTO GROUP 2", "TORONTO GROUP 3", "TORONTO GROUP 6"],
  "Ottawa Zone": ["ce ottawa walkley group", "Ottawa Group", "CE OTTAWA WESTERN GROUP", "CE Ottawa Main Group", "CE Ottawa Midwest Group", "CE Ottawa South East Group"],
  "Quebec Zone": ["NDG GROUP", "St Laurent Group"],

  // ========== UK ZONES ==========
  "UK Zone 1 (UK Region 1)": ["Thamesmead Group", "Birmingham Group", "Leeds Central Group", "Nottingham Group", "Dublin Group", "Ballymun", "Aberdeen Group", "CHESTERGROUP", "LOVEWORLD CHURCH GROUP 1"],
  "UK Zone 1 (UK Region 2)": ["CE CATFORD GROUP", "CE Bexleyheath Group", "CE Crystal Palace Group"],
  "UK Zone 2 (UK Region 1)": ["LWCENTRAL GROUP", "ESSEX GROUP", "HOUNSLOW GROUP", "ELITE GROUP", "NORTHAMPTON GROUP", "LISBON GROUP", "NORWOOD GROUP"],
  "UK Zone 3 (UK Region 1)": ["Croydon Group", "Slough Group", "Brentwood Group", "Dagenham Group", "Cambridge Group", "Peckham Group", "Reading Group", "Wakefield Group"],
  "UK Zone 3 (UK Region 2)": ["PERIVALE GROUP", "STREATHAM GROUP", "HILLINGDON GROUP", "WATFORD GROUP"],
  "UK Zone 4 (UK Region 2)": ["BARKING GROUP", "BRISTOL GROUP", "HARLOW GROUP", "DOCKLANDS GROUP"],
  "UK Zone 4 (Region 1)": ["Coventry Group", "Chesterfield Group", "Greater Manchester Group", "Central Manchester Group", "sheffieldgroup", "Bolton Group"],
  "blwukzonec": [],
  "BLW UK Zone C": [],
  "Loveworld UK Zone A": [],

  // ========== USA ZONES ==========
  "USA Zone 1 (Region 1)": [],
  "USA Zone 1 (Region 2)": ["DALLAS GROUP", "Zone 1", "Dallas Group 2", "ATLANTA GROUP", "Zone 1 Grp 2", "Zone 1 Grp 1", "Zone 1 Grp 3", "Rhapsody Administrators"],
  "USA Zone 2 (Region 1)": ["Megalopolis Pacific Group", "Megalopolis Group 2", "Megalopolis Group 1", "USA Group 1", "ATLANTA GROUP"],
  "Dallas Zone": ["IRVING GROUP", "ARLINGTON GROUP", "OHIO GROUP", "ARLINGTON GROUP DZ", "NORTHSHORE GROUP", "LWY Church"],
  "USA Region 3": ["CE Houston", "CE FULSHEAR", "Christ Embassy Katy Group", "CETVC", "CE CALIFORNIA", "cehoustonvc"],
  "Loveworld USA Group 1": ["USA Group 1", "ARLINGTON GROUP"],
  "Loveworld USA Group 2": [],
  "Loveworld USA Group 3": ["Oasis Church Baltimore", "Oasis Church Silver Spring", "Oasis Church Atlanta", "Oasis Church New York"],
  "LW USA Group 4": [],
  "BLW USA Region 1": [],
  "BLW USA Region 2": ["CE DALLAS", "CE KILLEEN", "CE LAWRENCE"],

  // ========== OTHER INTERNATIONAL ZONES ==========
  "Middle East & South East Asia Region": ["Middle East", "Asia"],
  "South America Region": [],
  "Eastern Europe Region": ["Christ Embassy Poland Group", "Christ Embassy Collin Group", "Christ Embassy Moscow Group", "CE Russia Group 2"],
  "Western Europe Zone 1": [],
  "Western Europe Zone 2": [],
  "Western Europe Zone 3": ["CE THUN", "CE GENEVA", "CE NAPOLI", "CE BOLOGNA", "CE BERGAMO", "CE MILAN 2", "BRESCIA", "CE MILAN 1"],
  "Western Europe Zone 4": ["CE Berlin Group", "CE Bremen Group", "CE Frankfurt Group", "CE Offenbach Subgroup", "CE Abundant Grace Subgroup", "CE Cologne Frankfurt Sub-Group", "CE Aachen (Berlin Sub-Group)"],

  "India Zone 1": [],
  "India International Office": [],
  "BLW India": [],
  "BlwCSRegion": [],
  "Blw Ireland": [],
  "Loveworld Ireland Group": [],
  "Loveworld Ethiopia Group": [],
  "Loveworld Tanzania Zone": [],
  "Loveworld Kenya Zone": [],
  "Blw Uganda Zone A": [],
  "Blw Uganda Zone B": ["BLW UGANDA GROUP"],
  "BLW Uganda Zone": ["BLW UGANDA GROUP"],
  "Loveworld Ghana Zone A": ["LWGHZA VIRTUAL CHURCH GROUP", "CU GROUP", "LEGON GROUP", "UPSA GROUP", "UCC GROUP"],
  "Loveworld Ghana Zone B": [],
  "Loveworld Ghana Zone D": [],
  "BLW Ghana Zone A": [],
  "BLW Ghana Zone B": [],
  "BLW Ghana Zone C": [],
  "BLW West Africa Region": [],
  "BLW West Africa": [],
  "BLW Southern Africa": [],
  "BLW SA Region": [],
  "BLW SA Zone F": [],
  "BLW SA Zone G DSP": [],
  "BLW SA Zone I": [],
  "BLW Nigeria Region": [],
  "BLW Nig. Zone A": [],
  "BLW Nigeria Zone F": [],
  "BLW MIDDLE EAST AND NORTH AFRICA REGION": ["BLW GROUP B", "BLW GROUP A", "BLW GROUP C", "BLW MENA MISSIONS GROUP"],

  // ========== NIGERIA REGIONAL ZONES ==========
  "Ministry Center Warri": ["Ebrumede Group", "Udu Group", "LW City 4", "LW City 2", "Central Church 1", "Okumagba Group", "Jakpa Group", "Enerhen Group", "Edjeba Group", "Lingua church", "CHAMPION GROUP", "Effurun Group", "Megethos Model", "LW City 5", "Youth Min MCW", "Agbarho Group", "Teens Min MCW", "APEX GROUP", "LW City 3", "CENTRAL GROUP WARRI MC", "Okuokoko Model", "WARRIMC", "CHAMPIONS GROUP WARRI MC", "Zenith Group", "Blossom Exp Model", "Nembe Model", "CE Pakistan(MCW)", "CE Antigua", "Language Ch.", "TEENS & YOUTH", "Tsalach Model", "Jeddo Model", "UGBORIKOKO GROUP", "G Warri Group"],

  "Ministry Center Calabar": ["central", "ikom", "akim", "asarieso", "highway", "ekpoabasi", "henshawtown", "statehousing", "ogoja", "anantigha", "ugep", "Akamkpa"],
  "Ministry Center Abeokuta": ["CE CITADEL GROUP", "CE WORLD CHANGERS GROUP", "ABEOKUTA GROUP", "ASERO GROUP", "LOVECHURCH GROUP", "GLOBAL CONNECT", "FLOURISH GROUP", "CE GREATER GLORY GROUP", "LIGHTHOUSE GROUP"],
  "Ministry Center Abuja": ["AUXANO GROUP", "VIRTUOUS GROUP", "PLEROMA GROUP", "MIMSHACH GROUP", "KARU GROUP", "MODEL GROUP", "GARKI GROUP", "WUSE GROUP", "MCA AIRPORT ROAD GROUP", "ASOKORO GROUP", "SILVERBIRD GROUP", "CBD GROUP", "LOKOGOMA GROUP", "NEW KARU GROUP", "NYANYA GROUP", "MARARABA GROUP", "KEFFI GROUP", "JIKWOYI GROUP", "MCATEENSCHURCH", "JIKWOYISUB-GROUP", "KUJE GROUP", "KORODUMA GROUP", "KUJESUB-GROUP"],

  // ========== NIGERIA REGIONAL ZONES (Continued) ==========
  "Port Harcourt Zone 1": ["CE BOUNDLESS GRACE 2 GROUP", "CE OFG GROUP", "CE BOUNDLESS GRACE GROUP", "CE CITY CENTER GROUP", "CE LIVING SPRING GROUP", "CE RUMOGHORLU GROUP", "CE OYIGBO GROUP", "CE GPH GROUP", "CE GREATER LIGHT GROUP", "CE EXCELLENT GROUP", "CE TRIUMPHANT GROUP", "CE DOA GROUP", "CE FB SUB GROUP", "CE MIMISHACK SUB GROUP", "CE ENEKA SUB GROUP", "Blossom church", "CEPHZONE1 TEEN", "BG ONLINE GROUP", "CE GRACE POINT SUB GROUP", "CE Celebration"],
  "Port Harcourt Zone 2": ["CE LIMITLESS", "CE Airport Road Group", "CE Loveworld Arena Group", "CE City Group", "CE Oroigwe Model", "CE Convention Ground Group", "CE Loveworld Center Group", "CE Delight Group", "CE Great Garrison Group", "CE Abundant Grace Group", "CE Rumuodomaya Model", "CE Finima Group", "CE Metro Group", "CE Omoku Group", "CE Bonny Group", "CE East West Road Group", "CE Excellent T Group", "CE Royal Place Group", "CE Dunamis Group", "CE Mgbouba Group", "CEMETROPOLITANGROUP", "CEEXCELLENTTOWNGROUP"],
  "Port Harcourt Zone 3": ["CE LIMITLESS", "CE CC ONE", "LUXIRANT", "CE GREATER PH", "CE CC THREE", "CE VICTORIOUS GROUP", "CE GLORIOUS GROUP", "CE OASIS GROUP", "CE ACCELERATED GRACE GROUP", "CE CC TWO", "CE ZONAL GROUP", "CE GRA GROUP", "CE ADVANTAGE GROUP", "CE TRANSAMADI GROUP", "advantagegroup", "CE ADA GEORGE", "PHZ3", "zion"],

  // ========== LAGOS ZONES ==========
  "Lagos Zone 1": ["AGEGE GROUP", "shangisha", "AVIATION GROUP", "IFAKO IJU GROUP", "AGBADO HOLDING GROUP", "ABULE EGBA GROUP 1", "MAINLAND 2 GROUP", "IKORODU CENTRAL GROUP", "OJODU GROUP", "KETU GROUP", "OGBA GROUP", "GREAT MAINLAND GROUP", "IKORODU WEST GROUP", "ABULE EGBA GROUP 2", "PUNE", "MAFOLUKU GROUP", "AKUTE GROUP", "LCC6 GROUP", "IKORODU EAST GROUP", "MARYLAND GROUP", "INTERNALTIONAL MISSIONS GROUP", "ISHERI MAGODO GROUP", "STRATEGIC GROUP 2", "okeiragroup", "YOUTHTEENS GROUP", "YOUTH & TEENS GROUP", "LOVE ARENA GROUP", "STRATEGIC GROUP 1", "INDIAN2", "ENVIRONS 2 GROUP"],
  "Lagos Zone 2": ["Egbegroup", "abaranje1group", "ipajagroup", "zonalgroup", "isherigroup", "festacgroup", "okota", "ikotun", "ejigbogroup", "New Ojo Group", "afromedia", "LZ2", "dopemugroup", "Isolo1group", "Yaba group", "CEAGO", "ajangbadigroup", "Isolo 1b", "okokogroup", "badagrygroup", "intlmissionsgroup", "estategroup", "isolo2group", "badagry", "lafiagroup"],
  "Lagos Zone 3": ["Loveworld Place Group", "Shomolu Group", "Palmgroove Group", "Orile Group", "Ojuelegba Group", "Aguda 1 Group", "Masha Group", "Aguda 2 Group", "Mushin Group", "Surulere 2 Group", "Lawanson Group", "Ikate Group", "Surulere 1 Group", "Ebute Metta Group", "Ijesha Group", "Ericmoore Group", "Pakistan Group", "LZ3", "South America Group"],
  "Lagos Zone 4": ["U TURN GROUP", "CENTRAL GROUP", "ALAGBADO GROUP", "OTA GROUP", "Ijaiye Group", "ALAKUKO GROUP", "EGBEDA GROUP", "IYANA IPAJA GROUP", "IJOKO GROUP", "Osi Ota", "OSI-OTA GROUP"],
  "Lagos Zone 5": ["CE LEKKI", "CE AJAH GROUP", "CE CHEVRON GROUP", "CE KAJOLA GROUP", "Ikoyi Group", "CE MOBIL SUB GROUP", "CE LEKKI PHASE 1 GROUP", "Epe group", "CE ABIJO-TEDO GROUP", "CE VI GROUP", "Ajiwe Group", "ONISHON GROUP", "CE LAGOS ISLAND GROUP", "YOUTH GROUP", "CE IKOYI 2", "CE FREE TRADE ZONE GROUP", "TEDO GROUP", "OGOMBO GROUP", "ALASIA GROUP", "VICTORIA ISLAND GROUP", "LEKKI GROUP 1", "EPUTU GROUP", "LEKKI FREE TRADE ZONE GROUP", "OBALENDE GROUP", "MOBIL ROAD GROUP", "CE BRAZIL GROUP", "THEHAVENZC18"],
  "Lagos Zone 6": ["CITY CHURCH GROUP", "OLODI GROUP", "AJEGUNLE GROUP", "CHAMPIONS GROUP", "APAPA GROUP", "WILMER GROUP", "NEW AJEGUNLE GROUP", "IJORA BADIA GROUP"],
  "Lagos Sub Zone A": ["LW Peaceville", "LADILAK", "BARIGA", "OGUDU", "OJOTA", "CITY OF GRACE", "ORIOKE", "Gbagada Subgroup"],
  "Lagos Sub Zone B": ["LCC 2 GROUP", "CE OMOLE GROUP", "CE LIGHT HOUSE GROUP", "PROLIFIC GROUP"],
  "Lagos Sub Zone C": [],
  "Lagos Virtual Zone [CELVZ]": ["Local Missions", "LCA Church 2", "LCA Church 3", "Youth Church", "LCA Church 1", "Phenom Church", "CELVZTEENSCHURCH", "LCA Church 4", "LCA Church 5", "CHAMPIONSINTERNATIONAL", "Teens Church", "LVZCONNECT", "FLOURISHINGA", "AGAPEH", "Intl Missions", "EPIGNOSISH", "DECISIONMAKERS", "OASIS", "PLATINUMGH", "LCACHURCH10", "BLISSH", "LOVECULTURE", "PHOTIZOH", "BENCHMARKH", "TEAMISSACHAR", "LCACHURCH6", "CELVZINTERNATIONALMISSIONS", "LVZ4", "HERITAGE", "GROUPPASTORSLIAISONOFFICE", "AGAPE", "FRUITFULFIELD", "LVZ4CFRUITION", "LVZ2", "LVZTURKEY", "VICTORYH", "EPIGNOSIS", "PROFESSIONAL", "GLORIOUSFIELD", "SUPREMEPRAISEDY", "LVZ5", "CHILDREN'SCHURCH", "ZD'STEAM", "ZOE", "EVERINCREASING", "LVZ6", "PERFECTIONGL", "FIRSTCLASS", "CHAMPIONS1", "AUTEKIA", "LANGUAGE", "LVZ4EEXCEL", "GRANDEUR", "LVZ8", "BEACONS", "Asia", "EXCEL-3", "BEAMINGG", "CELVZYOUTHCHURCH"],

  // ========== SOUTH EAST NIGERIA ZONES ==========
  "SE Zone 1": ["WCC GROUP", "EGBU GROUP", "AROCHUKWU GROUP", "CE OWERRI 1", "ORJI GROUP", "MCC ROAD GROUP", "OKIGWE GROUP", "MBAISE SUB GROUP", "WORLD BANK GROUP", "ORLU GROUP", "OKIGWE ROAD GROUP", "CE WORLD BANK 1 GROUP", "WORLD BANK OWERRI GROUP", "UBAKALA GROUP", "OGUTA GROUP", "AKACHI GROUP", "CE WORLD BANK GROUP", "NSEVZ1", "WORLD BANK SUB GROUP 1", "WORLD BANK SUB GROUP 2", "valiant youth church umuahia"],
  "CE South East Zone 3": ["CE ENUGU 1", "CE ABAKALIKI 1", "CE AWKA NSEZ3", "CE ABAKALIKI 2", "CE NNEWI NSEZ3", "CE ENUGU 2"],
  "Onitsha Zone": ["SVG", "ALPHA GROUP", "GRA", "AWKA ROAD", "AWADA 2", "EXTRAVAGANT GRACE", "FEGGE", "FHE", "33 MEGA", "DIVINE PROSPERITY", "EVER INCREASING PROSPERITY", "OMAGBA", "VENN ROAD", "GODS GRACE", "TRUE PROSPERITY", "OTUOCHA", "OYI"],
  "Mid West Zone": ["CE SILUKO", "CE Ugbowo Group", "CE Bowen Group", "CE Ekpan-Real Group", "CE New Benin Group", "CE Textile Mill Group", "CE Iguosa Group", "CE Ogida Group", "CE Greater Warri Group", "CE Oluku Group", "CE Riverine Group", "CE Mega Group", "CE Okada Group", "CE Urhobo", "CE Consolidated Group"],

  "SS Zone 1": ["Lighthouse", "IWC GROUP UYO", "Ughelligroup", "Adino Group", "Phronesis", "EXCEL GROUP UYO", "Adino", "Teens and Youth Ministry", "Gloryland Group", "Mainland Group", "Island Group", "Eastwest Group", "FORTIZO GROUP, UYO", "CreekHaven Group", "Mimshack Group", "LivingSpring Group", "Executivegroup", "CE Urhobo", "PHRONESISGROUP", "SAPELEGROUP"],
  "SS Zone 2": ["GRACE GROUP", "MOST FAVOURED GROUP", "EXCELLENT GROUP", "A-PLUS GROUP", "PLATINUM GROUP", "MODEL GROUP NSSZ2", "IKOT EKPENE GROUP", "AUXANO GROUP NSSZ2", "FLOURISHING Group SSZ3", "BLISS GROUP", "Service Centers"],
  "SS ZONE 3": ["kwalegrp", "The Prolific Group", "summitgrp", "CE Sapele Group", "CE COOPERATIVE", "CEAgbor", "ibusagrp", "coopgroup", "nitelgrp", "CEAsaba", "konweagrp", "SSZ3 International Missions Group", "ogwashigrp", "agborgrp", "Nitel", "CE BONSAAC", "CEAwka", "AGBOR ROAD GROUP", "gplo", "CENnewi"],

  "SW Zone 1": ["CE IBADAN SOUTH GROUP", "CE OKE ADO GROUP", "CE BOUNDLESS GRACE CHURCH", "CE IWO ROAD GROUP", "CE MECHURCHAPATA"],
  "SW Zone 2": ["CE OSOGBO 1", "CE Mega Church", "CE OSUN", "CE OSOGBO", "CE EKITI", "CE ILE IFE", "CE EKITI 1", "Ce Ilesha", "CE ILE-IFE", "CE EKITI 2"],
  "SW Zone 3": [],
  "SW Zone 4": ["Magnificent Group", "Special Grace Group", "Luxuriant Group"],
  "SW Zone 5": ["CE Akure Group", "CE Ijapo Group", "CE Owo Group", "CE Ondo Group", "CE Agagu group"],

  "NW Zone 1": ["Youth/Teens Ministry", "CEKADUNAGROUP", "KDZONALCHURCH", "Sunrise", "Sunshine", "Alheri Group", "Anguldi Group", "RUKUBA GROUP", "CE Jos Zonal Group", "CESOKOTOGROUP", "Central Elite", "Bukuru Group", "CEZARIAGROUP", "SABO SUB GROUP", "KDNORTHSUBGROUP", "CE BNW SUB GROUP", "CEKEBBIGROUP", "CLWNWZ1", "KAKURISUBGROUP", "CEZAMFARAGROUP", "KAFACHAN", "Wukari Sub-Group"],
  "NW Zone 2": ["CHRIST EMBASSY KANO", "CHRIST EMBASSY JIGAWA", "CHRIST EMBASSY BAUCHI N1R1", "CHRIST EMBASSY AIRPORT RD CHURCH2", "CHRIST EMBASSY PROLIFIC CHURCH"],
  "NC Zone 1": ["Youth/Teens Ministry", "Sunrise", "Sunshine", "Alheri Group", "Anguldi Group", "RUKUBA GROUP", "CE Jos Zonal Group", "Central Elite", "Bukuru Group", "Central-Group 1", "Jalingo Group", "NNCVZ1"],
  "NC Zone 2": ["CE MAKURDI CENTRAL", "CE MAKURDI ENVIRONS", "CE MAKURDI OUTSTATIONS", "CE LOKOJA", "CEILLORIN1", "CEMAKURDI", "CEILLORIN2"],
  "NE Zone 1": ["CE Zonal Church", "CE Gombe", "CE Maiduguri", "CE Mubi Group", "CE Numan Group", "CE Barracks Road Group", "CE Jalingo", "CHRIST EMBASSY BAUCHI"],

  "Ibadan Zone 1": ["SAMONDA GROUP", "CE ZONAL CHURCH GROUP", "AJIBODE JUNCTION GROUP", "CE ELEYELE GROUP", "BODIJA GROUP", "CE AKOBO GROUP", "MONIYA GROUP", "AIRPORT GROUP"],
  "Ibadan Zone 2": [],
  "Ibadan ministry Centre": [],
  "DSC Sub- Zone": [],

  // ========== MINISTRY DEPARTMENTS & OTHER ==========
  "MINISTRY DEPEARTMENTS": ["Loveworld Music Ministry", "Loveworld Cell Ministry", "Loveworld Media Production", "Loveworld Programs", "The InnerCity Mission for Children", "Office of the CEO", "Office of the Chief of Staff", "Healing School", "Loveworld Church Growth International", "Foundation School", "Rhapsody of Realities"],
  "CHILDREN'S CHURCH": [],
  "TEENS MINISTRY": ["EXPRESS GROUP"],
  "Youth Church": ["youthchurch"],
  "CE YOUTH/TEENS CHURCH": ["ceyouth/teenschurch"],
  "Celebrity Teens & Youth Church 1": ["celebrityteens&youthchurch1"],
  "Xtreme": [],
  "New Media": [],
  "ROR Global Production": [],
  "Church Growth Intl": [],
  "River of Life": [],
  "InnerCity Missions": [],
  "LW Radio": [],
  "LW Television Ministry": [],
  "LW Cell Ministry": [],
  "LW Foundation School": [],
  "LW Graduate Network": [],
  "LWNRUS": ["LWNRUS"],
  "QUBATORS": [],
  "PCDL": [],
  "ITL OFFICE": [],
  "sales": [],

  // ========== SERVICE CENTERS & MISSIONS ==========
  "Service Centers": ["servicecenters"],
  "CENTRAL MISSIONS 1": ["centralmissions1"],
  "CENTRAL MISSIONS 2": ["centralmissions2"],
  "CENTRAL GROUP 1": ["centralgroup1"],
  "CENTRAL GROUP 2": ["centralgroup2"],
  "CENTRAL GROUP 3": ["centralgroup3"],
  "CENTRAL CHURCH GROUP": ["centralchurchgroup"],
  "CENTRAL VIRTUAL ZONE": [],
  "MISSIONS 1": ["missions1"],
  "MISSIONS 2": ["missions2"],
  "MISSIONS 3": ["missions3"],
  "MISSIONS 4": ["missions4"],
  "MISSIONS 5": ["missions5"],
  "MISSIONS 6": ["missions6"],
  "Missions 7": ["missions7"],
  "Missions 8": ["missions8"],

  // ========== SPECIAL ZONES ==========
  "0": ["0"],
  "NA": [],
  "NOT SET": [],
  "Not Applicable": [],
  "Other / Unlisted": ["Other Church"]
};

/**
 * Populates a select element with zones
 * @param {HTMLSelectElement} selectElement 
 */
function populateZones(selectElement) {
  selectElement.innerHTML = '<option value="" disabled selected>Select Zone</option>';
  Object.keys(kingdomZones).sort().forEach(zone => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone;
    selectElement.appendChild(option);
  });
}

/**
 * Populates a select element with churches based on the selected zone
 * @param {string} zoneName 
 * @param {HTMLSelectElement} selectElement 
 */
function populateChurches(zoneName, selectElement) {
  selectElement.innerHTML = '<option value="" disabled selected>Select Church</option>';
  if (kingdomZones[zoneName] && kingdomZones[zoneName].length > 0) {
    // Remove duplicates and sort alphabetically
    const uniqueChurches = [...new Set(kingdomZones[zoneName])];
    uniqueChurches.sort().forEach(church => {
      const option = document.createElement('option');
      option.value = church;
      option.textContent = church;
      selectElement.appendChild(option);
    });
  } else {
    // If no groups found for this zone, show a message
    const option = document.createElement('option');
    option.value = "";
    option.textContent = "No groups available for this zone";
    option.disabled = true;
    selectElement.appendChild(option);
  }
}