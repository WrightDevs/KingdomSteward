// js/zones.js

// Comprehensive configuration for standardized Zones and Churches
// This ensures data integrity for the Leader Dashboard matching.
// Data source: dashboard.reachoutworld.org (Zonal List + Groups Report)

const kingdomZones = {
  // ========== INTERNATIONAL MINISTRIES (ISM) ==========
  "GYLF": ["NA"],
  "ISM": ["NA", "Africa group", "Asia group", "Europe region", "Nigeria group"],
  "ISM Africa": ["NA"],
  "ISM Asia": ["NA"],
  "ISM Europe region": ["NA"],
  "ISM Middle East": ["NA"],
  "ISM Nigeria": ["NA"],
  "ISM North America": ["NA"],
  "ISM Oceania": ["NA"],
  "ISM South America": ["NA"],
  "ISM UGANDA": ["NA", "UGANDA CHURCHES", "UGANDA ISM CHURCHES", "OTHER CHURCHES"],

  // ========== REACHOUT & REON ==========
  "Reachout Campaigns": ["NA"],
  "REON": ["NA", "REON WEST AFRICA", "REON OCEANIA", "REON SOUTHERN AFRICA", "REON EAST AFRICA", "REON ASIA", "REON SOUTH AMERICA"],
  "REON Resource Center": ["NA"],
  "RIN": ["NA"],
  "TNI": ["NA", "Southern Africa Center 2", "Asia Center 7", "Southern Africa Center 3", "South Pacific Center 5", "South Pacific Center 2", "Caribbean Americas Center 4", "South Pacific Center 1", "Caribbean Americas Center 2", "TNI Ghana", "UK Center 2", "Caribbean Americas Center 1", "Central and South Americas", "Asia center 4", "Europe Center 3", "TNI South South Nigeria", "North Central Nigeria 2", "TNICC", "West Africa Center 2", "East Africa Center 4", "West Africa Center 4", "Southern Africa Center 1", "TNI Cambodia", "North America Center- TNI Quebec", "TNI North East Nigeria 1", "Asia Center 6", "East Africa Center 2", "Asia Center 1", "Asia Center 5", "North America Center 1", "Europe Center 7", "TNI Spain", "North America Center - USA 2", "East Africa Center 5", "North America Center -TNI Canada", "TNI South East Nigeria", "Europe Center 2", "TNI Kenya", "Asia Center 3", "TNI Ukraine", "East Africa Center 1", "TNI Germany 2", "North America Center 2", "TNI South West Nigeria"],

  // ========== NIGERIA ZONES ==========
  "Aba Zone": ["NA", "WWC", "Test Group A", "Test Group One", "OSISIOMA GROUP", "ABA SOUTH 1 GROUP", "ABA SOUTH 2 GROUP", "EXPRESS GROUP", "ABA NORTH CENTRAL GROUP", "Test Group Four", "WWC church 1", "Umuode", "ABAYI GROUP", "CE 106 Umungasi", "ABA MODEL GROUP", "Yellow Avenue", "Ariaria", "CE Owerrintta"],

  "Abuja Zone": ["NA", "BWARI GROUP", "ZC GROUP 1", "KUBWA GROUP", "ZC GROUP2", "KADO GROUP", "JABIGROUP", "GLORY GROUP", "ZUBA GROUP", "BROOKS OF BLISS GROUP", "DEI DEI GROUP", "ZC GROUP 3", "KUJEABJZ GROUP", "SUBURBANCITY GROUP", "KUBWA 2 GROUP", "LOKOGOMAABJZ GROUP", "NEW HORIZON GROUP", "GARKI GROUP ABJZ", "WUYE GROUP", "CEAZ YOUTH CHURCHES", "CEAZ TEENS CHURCHES", "MAITAMA GROUP", "TEENS CHURCHES", "CENTRAL AREA GROUP", "BOUNDLESS GRACE GROUP", "CEAZ INTL MISSIONS", "SULEJA GROUP", "GWARINPA GROUP", "ZC GROUP 4", "PROLIFIC GROUP"],

  "Abuja Zone 2": ["NA", "WUYE GROUP"],

  "Accra Zone": ["NA", "WEIJA GROUP", "KUMASI 1 GROUP", "KOFORIDUA GROUP", "LAA GROUP", "BEREKUM GROUP", "Accra Ghana", "KORLE BU GROIUP", "CAPECOAST GROUP", "SPINTEX GROUP", "KASOA GROUP", "KUMASI 3 GROUP", "ACHIMOTA GROUP", "youth churches group", "KETA GROUP", "AFLAO GROUP", "OLD WEIJA GROUP", "TAMALE GROUP", "HO GROUP", "TAKORADI 1 GROUP", "MATAHEKO GROUP", "ADENTA GROUP", "OSU GROUP", "TAKORADI 2 GROUP", "KUMASI 2 GROUP", "ATOMIC GROUP", "TARKWA GROUP", "LEGON 2 GROUP", "TAIFA GROUP", "DOME GROUP", "AGBOZU ME GROUP", "South Pacific Center 1", "AKIM ODA GROUP", "BLW ZONE J GROUP C", "westafricareongroup", "WEST LEGON GROUP"],

  "All African Students Union": ["NOT SET", "NA"],

  "Australia / South Pacific": ["Pacific Group", "NA", "Sydney Group", "CE TONGA GROUP", "Brisbane Group", "Perth Group"],

  "Benin Zone 1": ["MISSIONS 2", "MISSIONS 5", "EREDIAUWA GROUP", "MISSIONS 6", "Teens and Youth Church", "AMAZING", "CELEBRITY TEENS/YOUTH CHURCH", "ONLINE CHURCH", "Missions 7", "PILLARS", "MISSIONS 3", "SUPERNATURAL", "NA", "Celebrity Teens & Youth Church 1", "ACHIEVERS", "GREATERLIGHTS", "CENTRAL MISSIONS 2", "NOT SET", "GARRICK SUB GROUP", "COMFORTERS", "GREATERLIGHT", "MISSIONS 4", "Sapele Road Sub Group"],

  "Benin Zone 2": ["EXTENSION GROUP", "CENTRAL GROUP 1", "AGBOR ROAD GROUP", "NA", "CENTRAL GROUP 3", "CENTRAL GROUP 2", "CE YOUTH/TEENS CHURCH", "OKA GROUP", "SAKPONBA GROUP", "NOT SET"],

  // ========== BLW ZONES (BELIEVERS' LOVEWORLD) ==========
  "BLW GHANA SUB ZONE D": ["NA"],
  "BLW Benin Republic": ["NA"],
  "BLW Benin Republic Zone A": ["NA"],
  "BLW Benin Republic Zone B": ["NA"],
  "BLW Burkina Faso": ["NA"],
  "BLW Burkina Faso Group": ["NA"],
  "BLW Cameroon Sub-Group 1": ["NA"],
  "BLW CAMEROON SUB-GROUP 2": ["BLW CAMEROON GROUP 2"],
  "BLW Cameroon Sub-Group 3": ["NA"],
  "BLW CAMEROON ZONE": ["NA", "NOT SET"],
  "Blw Cameroon Zone A": ["NA", "NOT SET"],
  "Blw Cameroon Zone B": ["NA", "NOT SET"],
  "BLW Campus Ministry West Africa Region": ["NA", "BLW India"],
  "BLW Canada Sub Region": ["NA", "Central Group Canada Sub Region", "Central East Group"],
  "BLW CHURCH ZONE": ["NA", "LOVEWORLD CHURCH GROUP 2", "LOVEWORLD CHURCH GROUP 4", "LOVEWORLD CHURCH GROUP 6", "LOVEWORLD CHURCH GROUP 7", "LW SUB GROUP 3", "LW SUB GROUP 2", "LOVEWORLD CHURCH GROUP 5", "PROLIFIC BERGER GROUP", "CE LWC ENUGU GROUP 8", "LOVEWORLD CHURCH GROUP 1", "CE LWC BENIN GROUP 6", "CE LWC MAINLAND GROUP 3", "LW SUB GROUP 1"],
  "BLW Cote D'Ivoire": ["NA"],
  "Blw DRC Congo and South Sudan Zone": ["NA"],
  "BLW East & Central Africa": ["NA", "NOT SET"],
  "BLW East & Central Africa Region": ["NA", "NOT SET"],
  "BLW Europe": ["NA"],
  "BLW Europe Region": ["NA", "NOT SET"],
  "BLW Europe Zone 1 dsp": ["NA", "London Group 1"],
  "BLW Gambia": ["NA"],
  "BLW GHANA SUB-ZONE C": ["NA", "Unending Grace", "Rivers of Grace", "The West", "NOT SET"],
  "BLW GHANA SUB-ZONE E": ["NA"],
  "BLW GHANA SUB-ZONE F": ["NA"],

  // ========== ADDITIONAL ZONES FROM GROUPS REPORT ==========
  "BENINZ1": ["beninz1"],
  "ECA ZONE 3": ["Main Church Group A", "Luzira Group", "Wandegeya Group", "Entebbe Group", "Juba 1 Group", "Gaba Group", "NA", "Mukono Group", "Arua Group", "CE MAIN CHURCH NAALYA", "Haikuwait Sub - Group", "Ndeeba Sub-Group", "Mbale Group", "Airport Road Group", "EWCVZ3", "Mbarara Group", "Nyanama Group", "Seychelles Group", "Rwanda Group", "Northern Ug Sub - Group", "Suriname Group", "Soroti Sub - Group", "DUNAMIS MAIN CHURCH GROUP", "HAI JEBEL GROUP", "Soroti Group", "Main Church Group B", "Eastern Uganda Group", "RHEMA MAIN CHURCH GROUP", "Jinja Group", "CHARISMA MAIN CHURCH GROUP", "CE main church most prolific pcf", "DIPLOMAT MAINCHURCH GROUP", "NOT SET", "Kingklasspcf", "HAVEN MAIN CHURCH GROUP", "ROYAL DIADEM MAIN CHURCH GROUP", "EASTERN UG GROUP", "CHARIS MAIN CHURCH GROUP", "IMPACT MAIN CHURCH GROUP", "SWAN MAIN CHURCH GROUP", "FORTPORTAL", "LORDS & KINGS MAIN CHURCH GROUP", "CE JUBA 2 MAIN", "Rwanda 2 Group", "Lologo Sub - Group"],

  "ECA ZONE 4": ["DOUALA Group", "NA", "Bamenda Group", "Buea", "Yaounde Group2", "Bonaberi", "Equatorial Guinea", "Kumba", "Limbe", "Yaounde Group 1", "Douala Group 2", "Libreville", "Congo Brazzaville", "GABON Group", "Pointe-Noire group", "NOT SET", "BLW ZONE C GROUP 4"],

  "ECA ZONE 2": ["NA", "CETOGO1", "CECOTEDIVOIRE", "CEBENIN", "CESENEGAL", "CEBURKINA", "CECIEXT", "CETOGO2", "CEMOROCCO", "CEMALI", "NOT SET", "CENIGER", "CEGUINEA", "CETEENS", "CEFLW"],

  "ECA ZONE 5": ["GAMBIA GROUP", "NA", "ASHAIMAN GROUP", "CONGO CROSS GROUP", "CE NUNGUA GROUP", "TRIUMPHANT GROUP", "TEMA GROUP", "KISSY GROUP", "TESHIE GROUP", "PAYNESVILLE GROUP", "DENU GROUP", "LASHIBI GROUP", "CE GLORY LAND", "East Legon Group", "WATERLOO GROUP", "BO GROUP", "ADENTA GROUPZ5", "MONROVIA GROUP", "MAKENI GROUP", "MICHEL NATION GROUP"],

  "ECA ZONE 6": ["CE TANZANIA", "CE DR CONGO", "NA", "CE MAURITIUS", "CE BURUNDI", "NOT SET"],

  "ECA ZONE 1": ["NA", "NOT SET"],

  "ECA ZONE 3b": ["NA", "GULU GROUP2", "NDEEBA GROUP"],

  "ECA ZONE 7": ["MBEZI GROUP"],

  // ========== SOUTH AFRICA ZONES ==========
  "SA Zone 1": ["Randburg Group", "Sandton Group", "NA", "Port Elizabeth Group", "Newlands Group", "Rusternburg Group", "Krugersdorp Group", "Midrand Group", "Limpopo Group", "East London Group", "Polokwane Group", "Rivonia Group", "Soweto Group", "Randburg Extension Group", "Midrand Gallagher group", "NOT SET", "testinggroup", "East London Group (duplicate)", "Midrand Group (duplicate)"],

  "SA Zone 2": ["NA", "CE SOUTH GROUP", "CE PRETORIA GROUP", "CE SUNNINGHILL GROUP", "CE NAMIBIA GROUP", "CE YOEVILLE GROUP", "CE KENSINGTON GROUP", "CE KEMPTON PARK GROUP", "CE GERMINSTON GROUP", "KEMPTON PARK GROUP", "CE ANGOLA GROUP", "CE DURBAN GROUP", "CE KIMBERLEY GROUP", "CE NORTHERN CAPE GROUP", "NOT SET"],

  "SA Zone 3": ["NA", "Botswana Group", "Zambia Group", "Eswatini Group", "Mozambique Group", "Lesotho Group", "Malawi North Group", "NA (duplicate)", "Malawi South Group"],

  "SA Zone 4": ["NA", "NOT SET"],

  "SA Zone 5": ["Belvedere Group", "NA", "Mutare Group", "NOT SET"],

  "Loveworld SA Zone A": ["NA", "APK", "Johannesburg South", "Pretoria East", "Pretoria North", "Turfloop", "North West", "Venda", "Johannesburg North", "Johannesburg Central", "Vaal", "UJ", "Mpumalanga", "Limpopo", "Vaal/Northwest", "Pretoria West"],

  "Loveworld SA Zone B": ["NA"],
  "Loveworld SA Zone C": ["NA", "Free State", "Western Cape", "NOT SET"],
  "Loveworld SA Zone D": ["NA", "NOT SET"],
  "Loveworld SA Zone E": ["NA"],
  "Loveworld Zone C": ["NA", "ZONE C GROUP 1", "BLW ZONE C GROUP 4", "BLW ZONE C GROUP G", "BLW ZONE C GROUP 2", "BLW ZONE C GROUP 3", "BLW ZONE C GROUP 6", "NOT SET", "FGCC"],
  "Loveworld Zone B": ["NA", "Enugu Group", "NAU Group", "Ebonyi Group", "Uli Group", "Oko Group", "Igbariam Group", "NSEVZ1"],
  "Loveworld Zone A": ["NA", "Blw Ekpoma Group", "Blw Abraka Group", "NOT SET", "BLW Kogi Group"],
  "Loveworld Zone D": ["NA", "BLW ABU CHAPTER"],
  "Loveworld Zone E": ["NA", "University of Ibadan group", "Kwara group", "Osun group"],
  "Loveworld Zone F": ["NA", "FUTO GROUP", "MOUAU GROUP", "IMSU GROUP", "BLW ABSU GROUP", "IMO POLY GROUP"],
  "Loveworld Zone G": ["NA", "Futa Group", "Aaua Group", "Eksu Group"],
  "Loveworld Zone H": ["NA", "OASIS OF GRACE", "BOUNDLESS GRACE", "CHURCH MINISTRY", "SONS OF CONSOLATION", "FLOURISHING GROUP"],
  "Loveworld Zone I": ["NA", "NOT SET"],
  "Loveworld Zone J": ["NA", "BLW ZONE J GROUP A", "BLW ZONE J GROUP F", "BLW ZONE J GROUP D", "BLW ZONE J GROUP E", "BLW ZONE J GROUP G", "BLW ZONE J GROUP B", "BLW ZONE J GROUP C"],
  "Loveworld Zone K": ["LWZK", "ABUJA", "NASSARAWA", "BENUE", "NIGER"],
  "Loveworld zone L": ["NA", "BLW UNIUYO GROUP", "BLW CRUTECH GROUP", "BLW UNICAL GROUP"],
  "Loveworld Zone M": ["NA"],
  "Loveworld Zone N": ["NA"],

  // ========== CANADA ZONES ==========
  "Toronto Zone": ["Calgary Group", "SCABOROUGH GROUP", "TORONTO GROUP", "TORONTO GROUP 1", "EDMONTON GROUP", "MILTON GROUP", "NA", "TORONTO GROUP 4", "TORONTO GROUP 5", "TORONTO GROUP 7", "TORONTO GROUP 2", "TORONTO GROUP 3", "TORONTO GROUP 6", "NOT SET"],

  "Ottawa Zone": ["NA", "ce ottawa walkley group", "Ottawa Group", "CE OTTAWA WESTERN GROUP", "CE Ottawa Main Group", "CE Ottawa Midwest Group", "CE Ottawa South East Group"],

  "Quebec Zone": ["NDG GROUP", "NA", "St Laurent Group", "NOT SET"],

  // ========== UK ZONES ==========
  "UK Zone 1 (UK Region 1)": ["NA", "Thamesmead Group", "Birmingham Group", "Leeds Central Group", "Nottingham Group", "Dublin Group", "Ballymun", "Aberdeen Group", "NOT SET", "CHESTERGROUP", "LOVEWORLD CHURCH GROUP 1"],

  "UK Zone 1 (UK Region 2)": ["CE CATFORD GROUP", "NA", "CE Bexleyheath Group", "CE Crystal Palace Group", "NOT SET"],

  "UK Zone 2 (UK Region 1)": ["LWCENTRAL GROUP", "NA", "ESSEX GROUP", "HOUNSLOW GROUP", "ELITE GROUP", "NORTHAMPTON GROUP", "LISBON GROUP", "NORWOOD GROUP"],

  "UK Zone 3 (UK Region 1)": ["NA", "Croydon Group", "Slough Group", "Brentwood Group", "Dagenham Group", "Cambridge Group", "Peckham Group", "Reading Group", "NOT SET", "Wakefield Group"],

  "UK Zone 3 (UK Region 2)": ["NA", "PERIVALE GROUP", "STREATHAM GROUP", "HILLINGDON GROUP", "WATFORD GROUP", "NOT SET"],

  "UK Zone 4 (UK Region 2)": ["BARKING GROUP", "NA", "BRISTOL GROUP", "HARLOW GROUP", "DOCKLANDS GROUP", "NOT SET"],

  "UK Zone 4 (Region 1)": ["NA", "Coventry Group", "Chesterfield Group", "Greater Manchester Group", "Central Manchester Group", "sheffieldgroup", "NOT SET", "Bolton Group"],

  "blwukzonec": ["NA"],

  "BLW UK Zone C": ["NA"],

  "Loveworld UK Zone A": ["NA", "NOT SET"],

  // ========== USA ZONES ==========
  "USA Zone 1 (Region 1)": ["NA", "NOT SET"],
  "USA Zone 1 (Region 2)": ["NA", "DALLAS GROUP", "Zone 1", "Dallas Group 2", "ATLANTA GROUP", "Zone 1 Grp 2", "Zone 1 Grp 1", "NOT SET", "Zone 1 Grp 3", "Rhapsody Administrators"],
  "USA Zone 2 (Region 1)": ["Megalopolis Pacific Group", "Megalopolis Group 2", "Megalopolis Group 1", "NA", "USA Group 1", "ATLANTA GROUP", "NOT SET"],

  "Dallas Zone": ["IRVING GROUP", "NA", "ARLINGTON GROUP", "OHIO GROUP", "ARLINGTON GROUP DZ", "NORTHSHORE GROUP", "LWY Church", "NOT SET", "ARLINGTON GROUP (duplicate)"],

  "USA Region 3": ["NA", "CE Houston", "NOT SET", "CE FULSHEAR", "Christ Embassy Katy Group", "CETVC", "CE CALIFORNIA", "cehoustonvc"],

  "Loveworld USA Group 1": ["USA Group 1", "NOT SET", "NA", "ARLINGTON GROUP"],
  "Loveworld USA Group 2": ["NA", "NOT SET"],
  "Loveworld USA Group 3": ["NA", "Oasis Church Baltimore", "NA (duplicate)", "Oasis Church Silver Spring", "Oasis Church Atlanta", "Oasis Church New York"],
  "LW USA Group 4": ["NA"],
  "BLW USA Region 1": ["NA", "NOT SET"],
  "BLW USA Region 2": ["NA", "CE DALLAS", "CE KILLEEN", "CE LAWRENCE", "NOT SET"],

  // ========== OTHER INTERNATIONAL ZONES ==========
  "Middle East & South East Asia Region": ["Middle East", "NA", "NOT SET", "Asia"],
  "South America Region": ["NA", "NOT SET"],
  "Eastern Europe Region": ["NA", "NOT SET", "Christ Embassy Poland Group", "Christ Embassy Collin Group", "Christ Embassy Moscow Group", "CE Russia Group 2"],
  "Western Europe Zone 1": ["NA", "NOT SET"],
  "Western Europe Zone 2": ["NA", "NOT SET"],
  "Western Europe Zone 3": ["NA", "CE THUN", "CE GENEVA", "CE NAPOLI", "CE BOLOGNA", "CE BERGAMO", "CE MILAN 2", "BRESCIA", "CE MILAN 1", "NOT SET"],
  "Western Europe Zone 4": ["NA", "CE Berlin Group", "CE Bremen Group", "CE Frankfurt Group", "CE Offenbach Subgroup", "CE Abundant Grace Subgroup", "CE Cologne Frankfurt Sub-Group", "CE Aachen (Berlin Sub-Group)"],

  "India Zone 1": ["NA", "NOT SET"],
  "India International Office": ["NOT SET", "NA"],
  "BLW India": ["NA", "NOT SET"],
  "BlwCSRegion": ["NA"],
  "Blw Ireland": ["NA"],
  "Loveworld Ireland Group": ["NA", "NOT SET"],
  "Loveworld Ethiopia Group": ["NA", "NOT SET"],
  "Loveworld Tanzania Zone": ["NA", "NOT SET"],
  "Loveworld Kenya Zone": ["NA", "NOT SET"],
  "Blw Uganda Zone A": ["NA", "NOT SET"],
  "Blw Uganda Zone B": ["BLW UGANDA GROUP"],
  "BLW Uganda Zone": ["NA", "BLW UGANDA GROUP", "NOT SET"],
  "Loveworld Ghana Zone A": ["NA", "LWGHZA VIRTUAL CHURCH GROUP", "CU GROUP", "NOT SET", "LEGON GROUP", "UPSA GROUP", "UCC GROUP"],
  "Loveworld Ghana Zone B": ["NA", "NOT SET"],
  "Loveworld Ghana Zone D": ["NA"],
  "BLW Ghana Zone A": ["NA", "NOT SET"],
  "BLW Ghana Zone B": ["NA", "NOT SET"],
  "BLW Ghana Zone C": ["NA"],
  "BLW West Africa Region": ["NA", "NOT SET"],
  "BLW West Africa": ["NA"],
  "BLW Southern Africa": ["NA", "NOT SET"],
  "BLW SA Region": ["NA", "NOT SET"],
  "BLW SA Zone F": ["NA", "NOT SET"],
  "BLW SA Zone G DSP": ["NA", "NOT SET"],
  "BLW SA Zone I": ["NOT SET"],
  "BLW Nigeria Region": ["NA", "NOT SET"],
  "BLW Nig. Zone A": ["NA"],
  "BLW Nigeria Zone F": ["NA", "NOT SET"],
  "BLW MIDDLE EAST AND NORTH AFRICA REGION": ["BLW GROUP B", "NOT SET", "BLW GROUP A", "BLW GROUP C", "BLW MENA MISSIONS GROUP"],

  // ========== NIGERIA REGIONAL ZONES ==========
  "Ministry Center Warri": ["Ebrumede Group", "Udu Group", "LW City 4", "LW City 2", "Central Church 1", "Okumagba Group", "Jakpa Group", "Enerhen Group", "Edjeba Group", "Lingua church", "CHAMPION GROUP", "NA", "Effurun Group", "Megethos Model", "LW City 5", "Youth Min MCW", "Agbarho Group", "Teens Min MCW", "APEX GROUP", "LW City 3", "CENTRAL GROUP WARRI MC", "Okuokoko Model", "WARRIMC", "CHAMPIONS GROUP WARRI MC", "Zenith Group", "Blossom Exp Model", "Nembe Model", "CE Pakistan(MCW)", "CE Antigua", "Language Ch.", "TEENS & YOUTH", "Tsalach Model", "Jeddo Model", "UGBORIKOKO GROUP", "NOT SET", "G Warri Group"],

  "Ministry Center Calabar": ["central", "ikom", "akim", "asarieso", "NA", "highway", "ekpoabasi", "henshawtown", "statehousing", "ogoja", "anantigha", "ugep", "NOT SET", "Akamkpa"],

  "Ministry Center Abeokuta": ["CE CITADEL GROUP", "CE WORLD CHANGERS GROUP", "NA", "ABEOKUTA GROUP", "ASERO GROUP", "LOVECHURCH GROUP", "GLOBAL CONNECT", "FLOURISH GROUP", "CE GREATER GLORY GROUP", "NOT SET", "LIGHTHOUSE GROUP"],

  "Ministry Center Abuja": ["AUXANO GROUP", "NA", "VIRTUOUS GROUP", "PLEROMA GROUP", "MIMSHACH GROUP", "KARU GROUP", "MODEL GROUP", "GARKI GROUP", "WUSE GROUP", "MCA AIRPORT ROAD GROUP", "ASOKORO GROUP", "NOT SET", "SILVERBIRD GROUP", "CBD GROUP", "LOKOGOMA GROUP", "NEW KARU GROUP", "NYANYA GROUP", "MARARABA GROUP", "KEFFI GROUP", "JIKWOYI GROUP", "MCATEENSCHURCH", "JIKWOYISUB-GROUP", "KUJE GROUP", "KORODUMA GROUP", "KUJESUB-GROUP"],

  // ========== NIGERIA REGIONAL ZONES (Continued) ==========
  "Port Harcourt Zone 1": ["NA", "CE BOUNDLESS GRACE 2 GROUP", "CE OFG GROUP", "CE BOUNDLESS GRACE GROUP", "CE CITY CENTER GROUP", "CE LIVING SPRING GROUP", "CE RUMOGHORLU GROUP", "CE OYIGBO GROUP", "CE GPH GROUP", "CE GREATER LIGHT GROUP", "CE EXCELLENT GROUP", "CE TRIUMPHANT GROUP", "CE DOA GROUP", "CE FB SUB GROUP", "CE MIMISHACK SUB GROUP", "CE ENEKA SUB GROUP", "Blossom church", "CEPHZONE1 TEEN", "BG ONLINE GROUP", "CE GRACE POINT SUB GROUP", "NOT SET", "CE Celebration"],

  "Port Harcourt Zone 2": ["CE LIMITLESS", "CE Airport Road Group", "CE Loveworld Arena Group", "CE City Group", "CE Oroigwe Model", "CE Convention Ground Group", "CE Loveworld Center Group", "CE Delight Group", "CE Great Garrison Group", "CE Abundant Grace Group", "CE Rumuodomaya Model", "CE Finima Group", "CE Metro Group", "CE Omoku Group", "CE Bonny Group", "CE East West Road Group", "NA", "CE Excellent T Group", "CE Royal Place Group", "CE Dunamis Group", "CE Mgbouba Group", "CEMETROPOLITANGROUP", "NOT SET", "CEEXCELLENTTOWNGROUP"],

  "Port Harcourt Zone 3": ["CE LIMITLESS", "CE CC ONE", "LUXIRANT", "NA", "CE GREATER PH", "CE CC THREE", "CE VICTORIOUS GROUP", "CE GLORIOUS GROUP", "CE OASIS GROUP", "CE ACCELERATED GRACE GROUP", "CE CC TWO", "CE ZONAL GROUP", "CE GRA GROUP", "CE ADVANTAGE GROUP", "CE TRANSAMADI GROUP", "advantagegroup", "CE ADA GEORGE", "PHZ3", "NOT SET", "zion"],

  // ========== NIGERIA REGIONAL ZONES (Continued) ==========
  "Lagos Zone 1": ["NA", "AGEGE GROUP", "shangisha", "AVIATION GROUP", "IFAKO IJU GROUP", "AGBADO HOLDING GROUP", "ABULE EGBA GROUP 1", "MAINLAND 2 GROUP", "IKORODU CENTRAL GROUP", "OJODU GROUP", "KETU GROUP", "OGBA GROUP", "GREAT MAINLAND GROUP", "IKORODU WEST GROUP", "ABULE EGBA GROUP 2", "PUNE", "MAFOLUKU GROUP", "AKUTE GROUP", "LCC6 GROUP", "IKORODU EAST GROUP", "MARYLAND GROUP", "INTERNALTIONAL MISSIONS GROUP", "ISHERI MAGODO GROUP", "STRATEGIC GROUP 2", "okeiragroup", "YOUTHTEENS GROUP", "YOUTH & TEENS GROUP", "LOVE ARENA GROUP", "STRATEGIC GROUP 1", "INDIAN2", "ENVIRONS 2 GROUP", "NOT SET"],

  "Lagos Zone 2": ["Egbegroup", "abaranje1group", "ipajagroup", "zonalgroup", "isherigroup", "NA", "festacgroup", "okota", "ikotun", "ejigbogroup", "New Ojo Group", "afromedia", "LZ2", "dopemugroup", "Isolo1group", "Yaba group", "CEAGO", "ajangbadigroup", "Isolo 1b", "okokogroup", "badagrygroup", "intlmissionsgroup", "estategroup", "isolo2group", "badagry", "lafiagroup", "NOT SET"],

  "Lagos Zone 3": ["NA", "Loveworld Place Group", "Shomolu Group", "Palmgroove Group", "Orile Group", "Ojuelegba Group", "Aguda 1 Group", "Masha Group", "Aguda 2 Group", "Mushin Group", "Surulere 2 Group", "Lawanson Group", "Ikate Group", "Surulere 1 Group", "Ebute Metta Group", "Ijesha Group", "Ericmoore Group", "NOT SET", "Pakistan Group", "LZ3", "South America Group"],

  "Lagos Zone 4": ["NA", "U TURN GROUP", "CENTRAL GROUP", "ALAGBADO GROUP", "OTA GROUP", "Ijaiye Group", "ALAKUKO GROUP", "EGBEDA GROUP", "IYANA IPAJA GROUP", "IJOKO GROUP", "Osi Ota", "OSI-OTA GROUP", "NOT SET"],

  "Lagos Zone 5": ["NA", "CE LEKKI", "CE AJAH GROUP", "CE CHEVRON GROUP", "CE KAJOLA GROUP", "Ikoyi Group", "CE MOBIL SUB GROUP", "CE LEKKI PHASE 1 GROUP", "Epe group", "CE ABIJO-TEDO GROUP", "CE VI GROUP", "Ajiwe Group", "ONISHON GROUP", "CE LAGOS ISLAND GROUP", "YOUTH GROUP", "CE IKOYI 2", "CE FREE TRADE ZONE GROUP", "TEDO GROUP", "OGOMBO GROUP", "ALASIA GROUP", "VICTORIA ISLAND GROUP", "LEKKI GROUP 1", "EPUTU GROUP", "LEKKI FREE TRADE ZONE GROUP", "OBALENDE GROUP", "MOBIL ROAD GROUP", "NOT SET", "CE BRAZIL GROUP", "THEHAVENZC18"],

  "Lagos Zone 6": ["CITY CHURCH GROUP", "NA", "OLODI GROUP", "AJEGUNLE GROUP", "CHAMPIONS GROUP", "APAPA GROUP", "WILMER GROUP", "NEW AJEGUNLE GROUP", "IJORA BADIA GROUP"],

  "Lagos Sub Zone A": ["LW Peaceville", "NA", "LADILAK", "BARIGA", "OGUDU", "OJOTA", "CITY OF GRACE", "ORIOKE", "Gbagada Subgroup"],

  "Lagos Sub Zone B": ["NA", "LCC 2 GROUP", "CE OMOLE GROUP", "CE LIGHT HOUSE GROUP", "PROLIFIC GROUP"],

  "Lagos Sub Zone C": ["NOT SET"],

  "Lagos Virtual Zone [CELVZ]": ["Local Missions", "NA", "LCA Church 2", "LCA Church 3", "Youth Church", "LCA Church 1", "Phenom Church", "CELVZTEENSCHURCH", "LCA Church 4", "LCA Church 5", "CHAMPIONSINTERNATIONAL", "Teens Church", "LVZCONNECT", "FLOURISHINGA", "AGAPEH", "Intl Missions", "EPIGNOSISH", "DECISIONMAKERS", "OASIS", "PLATINUMGH", "LCACHURCH10", "BLISSH", "LOVECULTURE", "PHOTIZOH", "BENCHMARKH", "TEAMISSACHAR", "LCACHURCH6", "CELVZINTERNATIONALMISSIONS", "LVZ4", "HERITAGE", "GROUPPASTORSLIAISONOFFICE", "AGAPE", "FRUITFULFIELD", "LVZ4CFRUITION", "LVZ2", "LVZTURKEY", "VICTORYH", "EPIGNOSIS", "PROFESSIONAL", "GLORIOUSFIELD", "SUPREMEPRAISEDY", "LVZ5", "CHILDREN'SCHURCH", "ZD'STEAM", "ZOE", "EVERINCREASING", "LVZ6", "PERFECTIONGL", "FIRSTCLASS", "CHAMPIONS1", "AUTEKIA", "LANGUAGE", "LVZ4EEXCEL", "GRANDEUR", "LVZ8", "BEACONS", "Asia", "EXCEL-3", "BEAMINGG", "CELVZYOUTHCHURCH"],

  // ========== SOUTH EAST NIGERIA ZONES ==========
  "SE Zone 1": ["WCC GROUP", "EGBU GROUP", "AROCHUKWU GROUP", "CE OWERRI 1", "ORJI GROUP", "NA", "MCC ROAD GROUP", "OKIGWE GROUP", "MBAISE SUB GROUP", "WORLD BANK GROUP", "ORLU GROUP", "OKIGWE ROAD GROUP", "CE WORLD BANK 1 GROUP", "WORLD BANK OWERRI GROUP", "UBAKALA GROUP", "OGUTA GROUP", "AKACHI GROUP", "CE WORLD BANK GROUP", "NSEVZ1", "WORLD BANK SUB GROUP 1", "NOT SET", "WORLD BANK SUB GROUP 2", "valiant youth church umuahia"],

  "CE South East Zone 3": ["CE ENUGU 1", "NA", "CE ABAKALIKI 1", "CE AWKA NSEZ3", "CE ABAKALIKI 2", "CE NNEWI NSEZ3", "CE ENUGU 2"],

  "Onitsha Zone": ["NA", "SVG", "ALPHA GROUP", "GRA", "AWKA ROAD", "AWADA 2", "EXTRAVAGANT GRACE", "FEGGE", "FHE", "33 MEGA", "DIVINE PROSPERITY", "EVER INCREASING PROSPERITY", "OMAGBA", "VENN ROAD", "GODS GRACE", "TRUE PROSPERITY", "OTUOCHA", "OYI", "NOT SET"],

  "Mid West Zone": ["NA", "CE SILUKO", "CE Ugbowo Group", "CE Bowen Group", "CE Ekpan-Real Group", "CE New Benin Group", "CE Textile Mill Group", "CE Iguosa Group", "CE Ogida Group", "CE Greater Warri Group", "CE Oluku Group", "CE Riverine Group", "CE Mega Group", "CE Okada Group", "CE Urhobo", "CE Consolidated Group"],

  "SS Zone 1": ["NA", "Lighthouse", "IWC GROUP UYO", "Ughelligroup", "Adino Group", "Phronesis", "EXCEL GROUP UYO", "Adino", "Teens and Youth Ministry", "Gloryland Group", "Mainland Group", "Island Group", "Eastwest Group", "FORTIZO GROUP, UYO", "CreekHaven Group", "Mimshack Group", "LivingSpring Group", "Executivegroup", "NOT SET", "CE Urhobo", "PHRONESISGROUP", "SAPELEGROUP"],

  "SS Zone 2": ["NA", "GRACE GROUP", "MOST FAVOURED GROUP", "EXCELLENT GROUP", "A-PLUS GROUP", "PLATINUM GROUP", "MODEL GROUP NSSZ2", "IKOT EKPENE GROUP", "AUXANO GROUP NSSZ2", "FLOURISHING Group SSZ3", "NOT SET", "BLISS GROUP", "Service Centers"],

  "SS ZONE 3": ["kwalegrp", "The Prolific Group", "summitgrp", "CE Sapele Group", "CE COOPERATIVE", "CEAgbor", "ibusagrp", "coopgroup", "nitelgrp", "CEAsaba", "konweagrp", "SSZ3 International Missions Group", "ogwashigrp", "agborgrp", "Nitel", "CE BONSAAC", "CEAwka", "AGBOR ROAD GROUP", "gplo", "CENnewi"],

  "SW Zone 1": ["NA", "CE IBADAN SOUTH GROUP", "CE OKE ADO GROUP", "CE BOUNDLESS GRACE CHURCH", "CE IWO ROAD GROUP", "CE MECHURCHAPATA"],

  "SW Zone 2": ["NA", "CE OSOGBO 1", "CE Mega Church", "CE OSUN", "CE OSOGBO", "CE EKITI", "CE ILE IFE", "CE EKITI 1", "Ce Ilesha", "CE ILE-IFE", "CE EKITI 2"],

  "SW Zone 3": ["NA"],
  "SW Zone 4": ["NA", "Magnificent Group", "Special Grace Group", "Luxuriant Group"],
  "SW Zone 5": ["CE Akure Group", "NA", "CE Ijapo Group", "CE Owo Group", "CE Ondo Group", "CE Agagu group", "NOT SET"],

  "NW Zone 1": ["NA", "Youth/Teens Ministry", "CEKADUNAGROUP", "KDZONALCHURCH", "Sunrise", "Sunshine", "Alheri Group", "Anguldi Group", "RUKUBA GROUP", "CE Jos Zonal Group", "CESOKOTOGROUP", "Central Elite", "Bukuru Group", "CEZARIAGROUP", "SABO SUB GROUP", "KDNORTHSUBGROUP", "CE BNW SUB GROUP", "CEKEBBIGROUP", "CLWNWZ1", "KAKURISUBGROUP", "CEZAMFARAGROUP", "KAFACHAN", "Wukari Sub-Group"],

  "NW Zone 2": ["NA", "CHRIST EMBASSY KANO", "CHRIST EMBASSY JIGAWA", "CHRIST EMBASSY BAUCHI N1R1", "CHRIST EMBASSY AIRPORT RD CHURCH2", "CHRIST EMBASSY PROLIFIC CHURCH"],

  "NC Zone 1": ["Youth/Teens Ministry", "NA", "Sunrise", "Sunshine", "Alheri Group", "Anguldi Group", "RUKUBA GROUP", "CE Jos Zonal Group", "Central Elite", "Bukuru Group", "Central-Group 1", "Jalingo Group", "NNCVZ1"],

  "NC Zone 2": ["NA", "CE MAKURDI CENTRAL", "CE MAKURDI ENVIRONS", "CE MAKURDI OUTSTATIONS", "CE LOKOJA", "CEILLORIN1", "CEMAKURDI", "CEILLORIN2"],

  "NE Zone 1": ["CE Zonal Church", "CE Gombe", "CE Maiduguri", "CE Mubi Group", "NA", "CE Numan Group", "CE Barracks Road Group", "CE Jalingo", "CHRIST EMBASSY BAUCHI"],

  "Ibadan Zone 1": ["NA", "SAMONDA GROUP", "CE ZONAL CHURCH GROUP", "AJIBODE JUNCTION GROUP", "CE ELEYELE GROUP", "BODIJA GROUP", "CE AKOBO GROUP", "MONIYA GROUP", "AIRPORT GROUP", "NOT SET"],

  "Ibadan Zone 2": ["NA"],
  "Ibadan ministry Centre": ["NA", "NOT SET"],

  "DSC Sub- Zone": ["NA", "NOT SET"],

  // ========== MINISTRY DEPARTMENTS & OTHER ==========
  "MINISTRY DEPEARTMENTS": ["NA", "Loveworld Music Ministry", "Loveworld Cell Ministry", "Loveworld Media Production", "Loveworld Programs", "The InnerCity Mission for Children", "Office of the CEO", "Office of the Chief of Staff", "Healing School", "Loveworld Church Growth International", "Foundation School", "Rhapsody of Realities"],

  "CHILDREN'S CHURCH": ["NA", "NOT SET"],
  "TEENS MINISTRY": ["NA", "NOT SET", "EXPRESS GROUP"],
  "Youth Church": ["youthchurch"],
  "CE YOUTH/TEENS CHURCH": ["ceyouth/teenschurch"],
  "Celebrity Teens & Youth Church 1": ["celebrityteens&youthchurch1"],
  "Xtreme": ["NA", "NOT SET"],
  "New Media": ["NA"],
  "ROR Global Production": ["NA", "NOT SET"],
  "Church Growth Intl": ["NA", "NOT SET"],
  "River of Life": ["NA"],
  "InnerCity Missions": ["NA", "NOT SET"],
  "LW Radio": ["NA"],
  "LW Television Ministry": ["NA"],
  "LW Cell Ministry": ["NA", "NOT SET"],
  "LW Foundation School": ["NA", "NOT SET"],
  "LW Graduate Network": ["NA"],
  "LWNRUS": ["LWNRUS"],
  "QUBATORS": ["NA"],
  "PCDL": ["NA"],
  "ITL OFFICE": ["NA"],
  "sales": ["NA", "NOT SET"],

  // ========== SERVICE CENTERS & MISSIONS ==========
  "Service Centers": ["servicecenters"],
  "CENTRAL MISSIONS 1": ["centralmissions1", "centralmissions1"],
  "CENTRAL MISSIONS 2": ["centralmissions2"],
  "CENTRAL GROUP 1": ["centralgroup1"],
  "CENTRAL GROUP 2": ["centralgroup2"],
  "CENTRAL GROUP 3": ["centralgroup3"],
  "CENTRAL CHURCH GROUP": ["centralchurchgroup"],
  "CENTRAL VIRTUAL ZONE": ["NA"],

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
  "NA": ["na"],
  "NOT SET": ["not set"],
  "Not Applicable": ["NA", "NOT SET"],
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
  if (kingdomZones[zoneName]) {
    // Remove duplicates and sort alphabetically
    const uniqueChurches = [...new Set(kingdomZones[zoneName])];
    uniqueChurches.sort().forEach(church => {
      const option = document.createElement('option');
      option.value = church;
      option.textContent = church;
      selectElement.appendChild(option);
    });
  }
}
