const GNODES_DATA=[
  ['a2',150,120,42,"company","Renters Sp. z o.o.",null,"#8fa0bd",900],
  ['a3',470,-30,30,"person","Kamil Krzyżanowski","prezes","#8fa0bd"],
  ['a4',470,120,28,"person","Sebastian Hejnowski","wspólnik","#8fa0bd"],
  ['a5',470,240,32,"person","Monika Ziółek","zarząd","#c1585f"],
  ['pswk',900,240,34,"flag","PSWK","stowarzyszenie branżowe","#0064d7"],
  ['zur',900,60,28,"person","Grzegorz Żurawski","prezes PSWK","#8fa0bd"],
  ['ustawa',1090,150,50,"law","Ustawa UC135","Rada Ministrów · 14.07.2026","#0064d7"],
  ['b2',150,330,40,"company","BookingHost Sp. z o.o.",null,"#8fa0bd",683],
  ['b3',470,330,30,"person","Andrzej Stecki","założyciel, prezes","#8fa0bd"],
  ['superapart',1090,330,32,"company","SUPERAPART",null,"#8fa0bd",290],
  ['benda',1090,460,28,"person","Paulina Benda","prezeska","#8fa0bd"],
  ['pelczynska',700,-90,26,"person","Katarzyna Pełczyńska-Nałęcz","minister funduszy (Polska 2050)","#0064d7"],
  ['matysiak',1090,-90,26,"person","Paulina Matysiak","posłanka niezrzeszona","#0064d7"],
  ['rutnicki',1400,-90,26,"person","Jakub Rutnicki","minister sportu i turystyki","#c1585f"],
  ['ei',150,560,38,"fund","Enterprise Investors","jeden z największych funduszy PE w Europie Środkowej","#0064d7"],
  ['pronczuk',470,560,28,"person","Dariusz Prończuk","partner EI · rada nadzorcza Renters","#c1585f"],
];
const GEDGES=[
  ['a2','a3','wspólnik','#c8d3ea',0],['a2','a4','wspólnik','#c8d3ea',0],['a2','a5','zarząd','#0064d7',0],
  ['a5','pswk','komisja rewizyjna','#0064d7',0],['zur','pswk','prezes','#0064d7',0],['pswk','ustawa','lobbing / konsultacje','#0064d7',1],['zur','ustawa',null,'#0064d7',1],['a3','ustawa','wywiad + stanowisko','#0064d7',1],['b3','ustawa','komentarz w prasie','#00E1FF',1],
  ['b2','b3','założyciel','#c8d3ea',0],
  ['benda','superapart','prezeska','#0064d7',0],['benda','ustawa','komentarz w prasie','#0064d7',1],
  ['pelczynska','ustawa','krytyka w rządzie','#0064d7',1],['matysiak','ustawa','zarzut o wpływy Airbnb','#0064d7',1],['rutnicki','ustawa','broni projektu','#ff5f7e',1],
  ['ei','a2','do 80% udziałów · 90 mln zł','#0064d7',0],['pronczuk','ei','partner','#0064d7',0],['pronczuk','a2','rada nadzorcza','#c1585f',0]
];
const GSTAGES=[['a2','a3','a4','a5','pswk','zur','ustawa','ei','pronczuk'],['b2','b3','superapart','benda','pelczynska','matysiak','rutnicki']];
const GQUOTES={
  a3:{name:"Kamil Krzyżanowski",role:"prezes, Renters",role_en:"president, Renters",text:"Incydenty związane np. z nocnymi imprezami to promil, co równie dobrze dotyczy mieszkań wynajmowanych na długo czy w ogóle lokali w bloku.",text_en:"Incidents such as nighttime parties are a fraction of a percent, and the same applies just as much to long-term rentals or to any apartment in a building.",src:"rp.pl, wywiad",src_en:"rp.pl, interview",srcUrl:"https://www.rp.pl/nieruchomosci/art43218081-wystarcza-proste-rozwiazania-by-uregulowac-najem-krotkoterminowy-mieszkan",quote:true},
  b3:{name:"Andrzej Stecki",role:"założyciel, BookingHost",role_en:"founder, BookingHost",text:"Można przyjąć, że niemal wszystkie obiekty wynajmowane za pośrednictwem Airbnb przez osoby prywatne, które nie zarejestrowały działalności gospodarczej, stanowią szarą strefę.",text_en:"It can be assumed that nearly all properties rented via Airbnb by private individuals who have not registered a business constitute the grey zone.",src:"rp.pl, wywiad",src_en:"rp.pl, interview",srcUrl:"https://www.rp.pl/nieruchomosci/art41413341-najem-krotkoterminowy-promil-rynku-do-uporzadkowania",quote:true},
  benda:{name:"Paulina Benda",role:"prezeska, SuperApart",role_en:"president, SuperApart",text:"Nie zgadzam się z tezą, że najem krótkoterminowy jest głównym czynnikiem wzrostu czynszów.",text_en:"I don't agree with the claim that short-term rental is the main driver of rising rents.",src:"rp.pl, wywiad",src_en:"rp.pl, interview",srcUrl:"https://www.rp.pl/nieruchomosci/art41413341-najem-krotkoterminowy-promil-rynku-do-uporzadkowania",quote:true},
  zur:{name:"Grzegorz Żurawski",role:"prezes, PSWK",role_en:"president, PSWK",text:"(...) bardzo żałujemy, że ministerstwo nie skorzystało z naszych podpowiedzi, ale nie tracimy nadziei, że może zmieni zdanie po konsultacjach.",text_en:"(...) we very much regret that the ministry did not take up our suggestions, but we have not lost hope that it may change its mind after consultations.",src:"rp.pl, wywiad",src_en:"rp.pl, interview",srcUrl:"https://www.rp.pl/nieruchomosci/art43575201-najem-krotkoterminowy-maja-patent-na-uciazliwych-gosci-ale-rzad-ich-nie-slucha",quote:true},
  pelczynska:{name:"Katarzyna Pełczyńska-Nałęcz",role:"minister funduszy i polityki regionalnej (Polska 2050)",role_en:"minister of funds and regional policy (Polska 2050)",text:"W ustawie były prawa samorządów, i nagle wszystko wykasowano, a wchodzi projekt, który nie daje ludziom, samorządom nic. Będziemy zgłaszać poprawki, takiej antyludzkiej ustawy nie poprzemy.",text_en:"The bill used to contain local-government rights, and suddenly all of that was deleted, and what's coming in is a draft that gives people, local governments, nothing. We will submit amendments; we will not support such an anti-people bill.",src:"bankier.pl",src_en:"bankier.pl",srcUrl:"https://www.bankier.pl/wiadomosc/Bezzebna-ustawa-o-najmie-krotkoterminowym-Pelczynska-Nalecz-Ludzie-maja-prawo-decydowac-czy-chca-miec-burdel-za-sciana-9169921.html",quote:true},
  matysiak:{name:"Paulina Matysiak",role:"posłanka niezrzeszona",role_en:"independent MP",text:"Czy ministerstwo kierowane przez pana ministra Rutnickiego kieruje się polską racją stanu czy może interesem zagranicznej korporacji?",text_en:"Is the ministry led by Minister Rutnicki guided by Poland's national interest, or perhaps by the interest of a foreign corporation?",src:"biznes.interia.pl, relacja sejmowa",src_en:"biznes.interia.pl, parliamentary report",srcUrl:"https://biznes.interia.pl/nieruchomosci/news-zmiany-w-najmie-wywolaly-burze-w-sejmie-oskarzenia-o-wplywy,nId,23515607",quote:true},
  rutnicki:{name:"Jakub Rutnicki",role:"minister sportu i turystyki",role_en:"minister of sport and tourism",text:"Więcej wiary w Polaków, więcej wiary w przedsiębiorczość.",text_en:"More faith in Poles, more faith in entrepreneurship.",src:"e-hotelarz.pl, relacja sejmowa",src_en:"e-hotelarz.pl, parliamentary report",srcUrl:"https://www.e-hotelarz.pl/artykul/122005/najem-krotkoterminowy-wrocil-do-sejmu-rutnicki-broni-projektu-zandberg-zapowiada-poprawki/",quote:true}
};
const PON_DATA=[
  ['c2',400,260,42,"company","Rentujemy Sp. z o.o.","KRS 0001003921 · 159 ofert w Warszawie","#0064d7",159],
  ['c3',700,120,32,"company","Ilkimen Consulting GmbH","Walldorf, Niemcy · wspólnik","#c1585f"],
  ['c6',100,120,34,"person","Adrian Niżnik Barwicki","prezes zarządu, beneficjent","#c1585f"],
  ['c4',200,480,30,"person","Liya Akhramovich","zarząd, wspólniczka","#c1585f"],
  ['c5',600,480,28,"company","Vester Fundacja Rodzinna","wspólnik","#8fa0bd"],
  ['c7',400,620,24,"person","Teresa Barwicka","beneficjentka","#8fa0bd"],
];
const POEDGES=[['c3','c2',"wspólnik",'#c1585f',0],['c6','c2',"prezes / beneficjent",'#c1585f',0],['c4','c2',"zarząd / wspólniczka",'#c1585f',0],['c5','c2',"wspólnik",'#8fa0bd',0],['c7','c2',"beneficjentka",'#8fa0bd',0]];
const TJN_DATA=[
  ['esteur',420,300,42,"company","EstEur Investment LTD","UK nr 11245525 · 9 ofert w Mokotowie, Airbnb: prywatne","#c1585f",9],
  ['tanajno',120,140,32,"person","Paweł Jan Tanajno","ponad 25% udziałów, dyrektor · kandydat na prezydenta RP","#c1585f"],
  ['pabich',120,480,28,"person","Agnieszka Elżbieta Pabich-Tanajno","ponad 25% udziałów, dyrektorka","#8fa0bd"],
  ['listing',760,300,30,"flag","„Walk to Mokotów Business Center.3”","oferta Airbnb w Mokotowie · oznaczona jako prywatna","#c1585f"],
];
const TJEDGES=[['tanajno','esteur',"wspólnik, dyrektor",'#c1585f',0],['pabich','esteur',"wspólniczka, dyrektorka",'#8fa0bd',0],['esteur','listing',"przykładowa oferta",'#c1585f',0]];
const TAXN_DATA=[
  ['nrep',700,50,46,"fund","NREP","Kopenhaga · beneficjent Bülow-Lehnsby","#0064d7"],
  ['lux',280,200,34,"company","NSF V LUX 5 S.à r.l.","Luksemburg → oddział w Warszawie","#8fa0bd"],
  ['vi1',700,200,34,"company","NSF VI POL 1","zagraniczny podmiot → oddział w Warszawie","#8fa0bd"],
  ['vi2',1120,200,34,"company","NSF VI POL 2","zagraniczny podmiot → oddział w Warszawie","#8fa0bd"],
  ['swietochowska',380,390,46,"person","Hanna Świętochowska","zarząd w 12 spółkach klastra","#c1585f",12],
  ['piotrowicz',1020,390,46,"person","Maciej Piotrowicz","zarząd w 12 spółkach klastra","#c1585f",12],
  ['mokotow1',180,560,28,"company","Mokotów I Propco","KRS 0000876332 · 3 oferty w zbiorze","#8fa0bd"],
  ['bemowo',460,600,28,"company","Bemowo Propco","KRS 0000875874 · Lessors of Real Estate (EMIS)","#8fa0bd"],
  ['ebrd',460,720,30,"bank","EBRD","kredyt hipoteczny na aktywach Bemowo Propco","#8fa0bd"],
  ['mokotow2',860,560,26,"company","Mokotów II Propco","w likwidacji","#5a6478"],
  ['parkur',1140,600,26,"company","Parkur Propco","klaster NREP","#8fa0bd"],
  ['stelmach',80,860,28,"person","Edyta Stelmach","pełnomocnik w 7 spółkach","#c1585f",7],
  ['karteczka',1280,860,28,"person","Marta Karteczka","pełnomocnik w 6 spółkach","#c1585f",6],
  ['bik',700,860,30,"company","Biuro Inwestycji Kapitałowych","Kraków · GPW → wykreślona","#c1585f"],
  ['bulow',420,-50,26,"person","Mikkel Bülow-Lehnsby","współzałożyciel NREP, beneficjent","#8fa0bd"],
  ['gaunt',980,-30,24,"person","Christian Guy Gaunt","b. dyrektor spółek klastra","#8fa0bd"],
  ['rasmussen',980,60,24,"person","Bo Holse Rasmussen","b. CFO grupy NREP (2018–2022)","#8fa0bd"],
];
const TAXEDGES=[
  ['ebrd','bemowo','kredyt hipoteczny','#37e5a8',0],
  ['nrep','lux','fundusz-matka','#37e5a8',0],['nrep','vi1','fundusz-matka','#37e5a8',0],['nrep','vi2','fundusz-matka','#37e5a8',0],
  ['bulow','nrep','beneficjent','#c8d3ea',0],['gaunt','nrep','zarząd zawodowy','#c8d3ea',0],['rasmussen','nrep','b. CFO grupy','#c8d3ea',0],
  ['swietochowska','lux','reprezentant','#ff00cd',0],['swietochowska','vi1','reprezentant','#ff00cd',0],
  ['piotrowicz','vi1','reprezentant','#ff00cd',0],['piotrowicz','vi2','reprezentant','#ff00cd',0],
  ['swietochowska','mokotow1','zarząd','#c8d3ea',0],['swietochowska','bemowo','zarząd','#c8d3ea',0],
  ['piotrowicz','mokotow2','zarząd','#c8d3ea',0],['piotrowicz','parkur','zarząd','#c8d3ea',0],
  ['stelmach','mokotow1','pełnomocnik','#0064d7',1],['stelmach','bemowo','pełnomocnik','#0064d7',1],
  ['karteczka','mokotow2','pełnomocnik','#0064d7',1],['karteczka','parkur','pełnomocnik','#0064d7',1],
  ['swietochowska','bik','rada nadzorcza','#ff5f7e',1],['piotrowicz','bik','rada nadzorcza','#ff5f7e',1]
];
const TAXSTAGES=[['mokotow1','bemowo','ebrd'],['nrep','lux','vi1','vi2','bulow','gaunt','rasmussen'],['swietochowska','piotrowicz','mokotow2','parkur'],['stelmach','karteczka','bik']];
const TAXCLOUD=["Kerpantile Investments","Lortenmore Investments","Inverdeno Investments","Domatotill Investments","Talonello Investments","Noli Studios Poland","Urban Partners","NSF V Poland Advisory","NSF VI Poland Advisory","Gowerstille Investments (w likwidacji)","Gabestico Investments (w likwidacji)"];
const SIWN_DATA=[
  ['hub',480,340,44,"flag","Stay in Warsaw","h•••o@stayinwarsaw.com · +48 666 666 •••","#0064d7"],
  ['owsiewska',150,150,28,"person","Agnieszka Owsiewska","twarz marki, 3 oferty","#8fa0bd"],
  ['coolestates',150,530,30,"company","Cool Estates SPV","KRS 0000948578 · Zbigniew Owsiewski, 2 oferty","#8fa0bd"],
  ['darski',810,150,32,"person","Adam Darski (Behemoth)","NIP 5842428801 · Gdańsk, CEIDG, 3 oferty","#c1585f"],
  ['tekima',810,340,26,"company","Tekima Fundacja Rodzinna","1 oferta","#8fa0bd"],
  ['bch',810,530,32,"company","BCH Fundacja Rodzinna","Milanówek, 1 oferta, nadal nie w KRS/RFR","#c1585f"],
];
const SIWEDGES=[
  ['hub','owsiewska',"wspólny kontakt",'#00E1FF'],['hub','coolestates',"wspólny kontakt",'#00E1FF'],
  ['hub','darski',"wspólny kontakt",'#0064d7'],['hub','tekima',"wspólny kontakt",'#00E1FF'],['hub','bch',"wspólny kontakt",'#0064d7']
];
const SIWSTAGES=[['hub','owsiewska','coolestates'],['darski','tekima','bch']];
