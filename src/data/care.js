// Typical faults and part lists, selected from each car's technical configuration.
// These describe the engine/gearbox/drive type; they are not model-specific defect records.
const isTurbo = (c) => c.asp === 'T' || c.asp === 'TT';
const isRotary = (c) => c.engine.startsWith('R');
const startYear = (c) => parseInt(c.years, 10);
const modernSafety = (c) => startYear(c) >= 1995;
const always = () => true;

const PROBLEM_RULES = [
  ['turbo', 'high', isTurbo], ['dpf', 'high', (c) => c.fuel === 'd' && startYear(c) >= 2005], ['egr', 'med', (c) => c.fuel === 'd'],
  ['injector', 'high', (c) => c.fuel === 'd'], ['glow', 'low', (c) => c.fuel === 'd'], ['ignition', 'med', (c) => c.fuel === 'p'],
  ['timing', 'high', (c) => !isRotary(c)], ['oil', 'med', always], ['overheat', 'high', always],
  ['clutch', 'med', (c) => c.gearType === 'M'], ['dct', 'high', (c) => c.gearType === 'D'], ['auto', 'high', (c) => c.gearType === 'A'],
  ['cvt', 'high', (c) => c.gearType === 'CVT'], ['awd', 'med', (c) => c.drive === 'AWD'], ['brakes', 'med', always],
  ['susp', 'med', always], ['battery', 'low', always], ['rust', 'med', (c) => c.cat === 'classic'],
  ['carb', 'med', (c) => c.fuel === 'p' && startYear(c) < 1985], ['screen', 'low', (c) => c.screen > 0], ['apex', 'high', isRotary],
];

const PART_GROUPS = [
  ['engine', ['block', 'head', 'pistons', 'crankshaft', 'camshaft', 'timing', 'valves', 'oilpump', 'oilfilter', 'airfilter', 'mounts', 'turbo', 'intercooler', 'supercharger', 'rotor']],
  ['fuel', ['tank', 'fuelpump', 'injectors', 'fuelfilter', 'sparkplugs', 'coils', 'glowplugs']],
  ['cooling', ['radiator', 'waterpump', 'thermostat', 'hoses']],
  ['exhaust', ['manifold', 'catalyst', 'dpf', 'egrvalve', 'muffler', 'lambda']],
  ['drivetrain', ['clutch', 'flywheel', 'gearbox', 'torque', 'mechatronic', 'cvtbelt', 'axles', 'propshaft', 'diff', 'transfer']],
  ['brakes', ['discs', 'pads', 'calipers', 'mastercyl', 'abs']],
  ['suspension', ['shocks', 'springs', 'arms', 'tierods', 'bearings', 'rack', 'tires']],
  ['electrical', ['battery', 'alternator', 'starter', 'ecu', 'headlights', 'taillights', 'screen', 'cluster']],
  ['body', ['hood', 'doors', 'fenders', 'bumpers', 'windshield', 'mirrors', 'trunk']],
  ['interior', ['seats', 'wheel', 'dash', 'belts', 'airbags', 'ac']],
];

const PART_RULES = {
  head: (c) => !isRotary(c), pistons: (c) => !isRotary(c), camshaft: (c) => !isRotary(c), timing: (c) => !isRotary(c), valves: (c) => !isRotary(c),
  turbo: isTurbo, intercooler: isTurbo, supercharger: (c) => c.asp === 'S', rotor: isRotary,
  sparkplugs: (c) => c.fuel === 'p', coils: (c) => c.fuel === 'p', glowplugs: (c) => c.fuel === 'd',
  injectors: (c) => c.fuel === 'd' || startYear(c) >= 1985,
  catalyst: (c) => startYear(c) >= 1985 || c.fuel === 'd', dpf: (c) => c.fuel === 'd' && startYear(c) >= 2005, egrvalve: (c) => c.fuel === 'd',
  clutch: (c) => c.gearType === 'M' || c.gearType === 'D', flywheel: (c) => c.gearType === 'M' || c.gearType === 'D', torque: (c) => c.gearType === 'A' || c.gearType === 'CVT',
  mechatronic: (c) => c.gearType === 'D', cvtbelt: (c) => c.gearType === 'CVT', axles: (c) => c.drive !== 'RWD' || !isRotary(c),
  propshaft: (c) => c.drive !== 'FWD', transfer: (c) => c.drive === 'AWD',
  abs: modernSafety, screen: (c) => c.screen > 0, airbags: modernSafety, ac: (c) => startYear(c) >= 1980,
};

const UI_KEYS = 'heroText tab_problems tab_parts symptoms solution sev_high sev_med sev_low problemsNote partsNote photoBy noPhoto photo_front photo_rear photo_interior photo_engine group_engine group_fuel group_cooling group_exhaust group_drivetrain group_brakes group_suspension group_electrical group_body group_interior'.split(' ');

const UI = {
  en: `Explore real photos, specifications, common faults and parts of petrol and diesel cars from around the world.|Problems|Parts|Symptoms|Solution|High|Medium|Low|Typical faults for this car's engine, gearbox and drive type. Not every car will have them; ask a qualified mechanic for diagnosis.|Main parts for this car's technical configuration. Exact part numbers vary by year and version.|Photo|No photo available yet|Exterior|Rear|Interior|Engine|Engine|Fuel & ignition|Cooling|Exhaust & emissions|Transmission & drive|Brakes|Suspension & steering|Electrical|Body|Interior`,
  tr: `Dünyanın dört bir yanından benzinli ve dizel arabaların gerçek fotoğraflarını, özelliklerini, yaygın arızalarını ve parçalarını keşfet.|Sorunlar|Parçalar|Belirtiler|Çözüm|Yüksek|Orta|Düşük|Bu arabanın motor, şanzıman ve çekiş tipinde sık görülen arızalardır. Her araçta görülmez, teşhis için yetkin bir ustaya danışın.|Bu arabanın teknik yapısına göre ana parçalar. Kesin parça numaraları yıla ve versiyona göre değişir.|Fotoğraf|Henüz fotoğraf yok|Dış|Arka|İç|Motor|Motor|Yakıt ve ateşleme|Soğutma|Egzoz ve emisyon|Şanzıman ve aktarma|Frenler|Süspansiyon ve direksiyon|Elektrik|Kaporta|İç mekân`,
  de: `Entdecke echte Fotos, technische Daten, häufige Defekte und Teile von Benzin- und Dieselautos aus aller Welt.|Probleme|Teile|Symptome|Lösung|Hoch|Mittel|Niedrig|Typische Defekte für Motor, Getriebe und Antrieb dieses Autos. Nicht jedes Auto ist betroffen; lass die Diagnose von einer Fachwerkstatt stellen.|Hauptteile für die Technik dieses Autos. Genaue Teilenummern variieren je nach Baujahr und Version.|Foto|Noch kein Foto vorhanden|Außen|Heck|Innen|Motor|Motor|Kraftstoff & Zündung|Kühlung|Abgasanlage|Getriebe & Antrieb|Bremsen|Fahrwerk & Lenkung|Elektrik|Karosserie|Innenraum`,
  fr: `Découvrez de vraies photos, les caractéristiques, les pannes courantes et les pièces des voitures essence et diesel du monde entier.|Problèmes|Pièces|Symptômes|Solution|Élevée|Moyenne|Faible|Pannes typiques pour le moteur, la boîte et la transmission de cette voiture. Toutes ne sont pas touchées ; consultez un mécanicien qualifié.|Pièces principales selon la configuration technique. Les références exactes varient selon l'année et la version.|Photo|Pas encore de photo|Extérieur|Arrière|Intérieur|Moteur|Moteur|Carburant et allumage|Refroidissement|Échappement et émissions|Boîte et transmission|Freins|Suspension et direction|Électricité|Carrosserie|Intérieur`,
  es: `Descubre fotos reales, especificaciones, averías comunes y piezas de coches de gasolina y diésel de todo el mundo.|Problemas|Piezas|Síntomas|Solución|Alta|Media|Baja|Averías típicas del motor, la caja y la tracción de este coche. No todos los coches las sufren; consulta a un mecánico cualificado.|Piezas principales según la configuración técnica. Las referencias exactas varían según el año y la versión.|Foto|Aún no hay foto|Exterior|Trasera|Interior|Motor|Motor|Combustible y encendido|Refrigeración|Escape y emisiones|Caja y transmisión|Frenos|Suspensión y dirección|Electricidad|Carrocería|Interior`,
  it: `Scopri foto reali, specifiche, guasti comuni e componenti delle auto a benzina e diesel di tutto il mondo.|Problemi|Componenti|Sintomi|Soluzione|Alta|Media|Bassa|Guasti tipici per motore, cambio e trazione di questa auto. Non tutte le auto ne soffrono; rivolgiti a un meccanico qualificato.|Componenti principali in base alla configurazione tecnica. I codici esatti variano per anno e versione.|Foto|Nessuna foto disponibile|Esterni|Retro|Interni|Motore|Motore|Carburante e accensione|Raffreddamento|Scarico ed emissioni|Cambio e trasmissione|Freni|Sospensioni e sterzo|Impianto elettrico|Carrozzeria|Interni`,
  pt: `Descubra fotos reais, especificações, defeitos comuns e peças de carros a gasolina e diesel do mundo inteiro.|Problemas|Peças|Sintomas|Solução|Alta|Média|Baixa|Defeitos típicos do motor, câmbio e tração deste carro. Nem todo carro os apresenta; consulte um mecânico qualificado.|Peças principais conforme a configuração técnica. Os códigos exatos variam por ano e versão.|Foto|Ainda sem foto|Exterior|Traseira|Interior|Motor|Motor|Combustível e ignição|Arrefecimento|Escape e emissões|Câmbio e transmissão|Freios|Suspensão e direção|Elétrica|Carroceria|Interior`,
  ru: `Настоящие фотографии, характеристики, типичные неисправности и детали бензиновых и дизельных автомобилей со всего мира.|Проблемы|Детали|Симптомы|Решение|Высокая|Средняя|Низкая|Типичные неисправности для двигателя, коробки и привода этого автомобиля. Они есть не у каждой машины; за диагностикой обратитесь к квалифицированному мастеру.|Основные детали для этой технической конфигурации. Точные номера зависят от года и версии.|Фото|Фото пока нет|Экстерьер|Сзади|Салон|Двигатель|Двигатель|Топливо и зажигание|Охлаждение|Выхлоп и экология|Трансмиссия|Тормоза|Подвеска и рулевое|Электрика|Кузов|Салон`,
  ar: `اكتشف صورًا حقيقية ومواصفات وأعطالًا شائعة وقطع سيارات البنزين والديزل من حول العالم.|المشكلات|القطع|الأعراض|الحل|عالية|متوسطة|منخفضة|أعطال شائعة لنوع المحرك وناقل الحركة والدفع في هذه السيارة. لا تظهر في كل سيارة، واستشر ميكانيكيًا مؤهلًا للتشخيص.|القطع الرئيسية حسب التكوين الفني لهذه السيارة. تختلف أرقام القطع حسب السنة والإصدار.|صورة|لا توجد صورة بعد|الخارج|الخلف|الداخل|المحرك|المحرك|الوقود والإشعال|التبريد|العادم والانبعاثات|ناقل الحركة والدفع|المكابح|التعليق والتوجيه|الكهرباء|الهيكل|المقصورة`,
  zh: `探索全球汽油与柴油汽车的真实照片、参数、常见故障和零部件。|常见问题|零部件|症状|解决方法|高|中|低|这些是该车发动机、变速箱和驱动形式的典型故障，并非每辆车都会出现，请由专业技师诊断。|根据该车技术配置列出的主要零部件。具体零件号因年份和版本而异。|照片|暂无照片|外观|车尾|内饰|发动机|发动机|燃油与点火|冷却|排气与排放|变速与传动|制动|悬架与转向|电气|车身|内饰`,
  ja: `世界のガソリン車とディーゼル車の実車写真、仕様、よくある故障、部品を確認できます。|トラブル|部品|症状|対処法|高|中|低|この車のエンジン、変速機、駆動方式で典型的な故障です。すべての車に起こるわけではありません。診断は整備士に依頼してください。|この車の技術構成に基づく主要部品です。正確な部品番号は年式やグレードで異なります。|写真|写真はまだありません|外装|後部|内装|エンジン|エンジン|燃料・点火|冷却|排気・排出ガス|変速機・駆動|ブレーキ|サスペンション・ステアリング|電装|ボディ|内装`,
};

const PROBLEMS = {
  en: `Turbocharger failure|Power loss, blue smoke, whistling, high oil use|Check boost hoses and oil feed, then repair or replace the turbo; change oil on time
Clogged diesel particulate filter (DPF)|DPF warning, limp mode, frequent regeneration|Drive at steady highway speed to regenerate; otherwise service clean or replace
EGR valve clogging|Rough idle, black smoke, power loss, engine light|Clean or replace the EGR valve and check the intake for soot
Diesel injector wear|Hard starting, knocking, smoke, high consumption|Run an injector leak-off test; recondition or replace faulty injectors
Glow plug failure|Hard cold starts, white smoke, glow light flashing|Test the plugs and relay; replace faulty glow plugs
Spark plug or ignition coil fault|Misfire, shaking, poor acceleration, engine light|Read fault codes; replace worn plugs or the failed coil
Timing belt or chain wear|Rattle on start, misfire; failure can destroy the engine|Replace the belt on schedule; inspect chain stretch and tensioners
Engine oil leaks|Oil spots, burning smell, falling oil level|Find the source; renew valve cover, sump or crank seals
Engine overheating|High temperature gauge, steam, coolant loss|Stop safely; check coolant, water pump, thermostat, radiator and head gasket
Clutch wear|Slipping, high pedal, burning smell, hard shifts|Replace the clutch kit and inspect the flywheel
Dual-clutch gearbox fault|Judder at low speed, jerky or delayed shifts|Service fluid if required; diagnose clutch pack and mechatronic unit
Automatic transmission fault|Harsh shifts, slipping, delayed engagement|Check fluid and fault codes; service or repair the transmission
CVT belt or fluid fault|Judder, whining, rpm flare, weak acceleration|Change CVT fluid on schedule; repair belt or pulleys if worn
AWD transfer or coupling fault|Binding in turns, clunks, drivetrain warning|Check transfer case and differential oil; match tire sizes
Brake wear|Squeal, vibration, longer stopping distance|Replace pads and discs; check fluid and calipers
Suspension wear|Knocking, bouncing, uneven tires, wandering|Replace worn shocks, bushings or joints; align the wheels
Battery or charging fault|Slow cranking, dim lights, battery warning|Test battery and alternator; replace the failed part
Body rust|Bubbling paint, holes in sills and floors|Cut out and weld repair, then treat and seal the area
Carburetor problems|Hard starting, stalling, fuel smell, uneven idle|Clean, rebuild and adjust the carburetor
Screen or infotainment fault|Freezing, black screen, touch or Bluetooth errors|Restart and update software; check fuses or replace the unit
Rotary apex seal wear|Low compression, hard hot starts, oil use|Run a compression test; rebuild the rotary engine`,
  tr: `Turbo arızası|Güç kaybı, mavi duman, ıslık sesi, yüksek yağ tüketimi|Turbo hortumlarını ve yağ beslemesini kontrol edin, turboyu onarın veya değiştirin; yağı zamanında değiştirin
Dizel partikül filtresi (DPF) tıkanması|DPF uyarısı, emniyet modu, sık rejenerasyon|Rejenerasyon için otoyolda sabit hızda sürün; olmazsa servis temizliği veya değişim yaptırın
EGR valfi tıkanması|Rölantide titreme, siyah duman, güç kaybı, motor arıza lambası|EGR valfini temizleyin veya değiştirin, emme hattındaki isi kontrol edin
Dizel enjektör aşınması|Zor çalışma, vuruntu, duman, yüksek yakıt tüketimi|Enjektör geri dönüş testi yaptırın; arızalı enjektörleri yenileyin veya değiştirin
Kızdırma bujisi arızası|Soğukta zor çalışma, beyaz duman, yanıp sönen ısıtma lambası|Bujileri ve röleyi test edin; arızalı kızdırma bujilerini değiştirin
Buji veya ateşleme bobini arızası|Tekleme, sarsıntı, zayıf hızlanma, motor arıza lambası|Arıza kodlarını okutun; aşınmış bujileri veya bozuk bobini değiştirin
Triger kayışı veya zinciri aşınması|Çalışırken takırtı, tekleme; kopması motoru parçalayabilir|Kayışı zamanında değiştirin; zincir uzamasını ve gergileri kontrol ettirin
Motor yağ kaçağı|Yağ lekesi, yanık koku, azalan yağ seviyesi|Kaçağın yerini bulun; külbütör, karter veya krank keçelerini yenileyin
Motor hararet yapması|Yüksek sıcaklık göstergesi, buhar, antifriz kaybı|Güvenli şekilde durun; antifriz, devirdaim, termostat, radyatör ve conta kontrolü yaptırın
Debriyaj aşınması|Kaçırma, yüksek pedal, yanık koku, zor vites geçişi|Debriyaj setini değiştirin ve volanı kontrol ettirin
Çift kavramalı şanzıman arızası|Düşük hızda titreme, vuruntulu veya geciken vites geçişi|Gerekiyorsa yağ bakımı yaptırın; kavrama ve mekatronik ünitesini test ettirin
Otomatik şanzıman arızası|Sert vites geçişi, kaçırma, geç kavrama|Yağı ve arıza kodlarını kontrol ettirin; şanzımanın bakım veya onarımını yaptırın
CVT kayış veya yağ arızası|Titreme, uğultu, devir yükselmesi, zayıf hızlanma|CVT yağını zamanında değiştirin; aşınmışsa kayış veya kasnakları onarın
Dört çeker aktarma arızası|Virajda sıkışma, vuruntu, çekiş sistemi uyarısı|Transfer ve diferansiyel yağını kontrol edin; lastik ölçülerini eşit tutun
Fren aşınması|Ciyaklama, titreme, uzayan fren mesafesi|Balata ve diskleri değiştirin; hidrolik ve kaliperleri kontrol edin
Süspansiyon aşınması|Vuruntu, zıplama, düzensiz lastik aşınması, yol tutmama|Aşınmış amortisör, burç veya rotları değiştirin; rot ayarı yaptırın
Akü veya şarj arızası|Zor marş, sönük farlar, akü uyarısı|Aküyü ve alternatörü test edin; arızalı parçayı değiştirin
Kaporta paslanması|Boyada kabarma, marşpiyel ve tabanda delik|Paslı bölgeyi kesip kaynakla onarın, ardından koruma uygulayın
Karbüratör sorunları|Zor çalışma, stop etme, benzin kokusu, düzensiz rölanti|Karbüratörü temizleyin, revize edin ve ayarlayın
Ekran veya multimedya arızası|Donma, siyah ekran, dokunmatik veya Bluetooth hatası|Yeniden başlatıp yazılımı güncelleyin; sigortaları kontrol edin veya üniteyi değiştirin
Rotary apex conta aşınması|Düşük kompresyon, sıcakken zor çalışma, yağ tüketimi|Kompresyon testi yaptırın; rotary motoru revize edin`,
  de: `Turboladerschaden|Leistungsverlust, blauer Rauch, Pfeifen, hoher Ölverbrauch|Ladeschläuche und Ölzufuhr prüfen, Turbo reparieren oder ersetzen; Öl rechtzeitig wechseln
Verstopfter Dieselpartikelfilter (DPF)|DPF-Warnung, Notlauf, häufige Regeneration|Zum Regenerieren konstant auf der Autobahn fahren; sonst reinigen oder ersetzen
Verstopftes AGR-Ventil|Unruhiger Leerlauf, schwarzer Rauch, Leistungsverlust, Motorleuchte|AGR-Ventil reinigen oder ersetzen und Ansaugtrakt auf Ruß prüfen
Verschleiß der Dieselinjektoren|Schlechter Start, Klopfen, Rauch, hoher Verbrauch|Rücklaufmengentest durchführen; defekte Injektoren instand setzen oder ersetzen
Glühkerzendefekt|Schlechter Kaltstart, weißer Rauch, blinkende Glühlampe|Kerzen und Relais prüfen; defekte Glühkerzen ersetzen
Zündkerzen- oder Zündspulendefekt|Zündaussetzer, Rütteln, schwache Beschleunigung, Motorleuchte|Fehlercodes auslesen; verschlissene Kerzen oder defekte Spule ersetzen
Verschleiß von Zahnriemen oder Steuerkette|Rasseln beim Start, Aussetzer; ein Riss kann den Motor zerstören|Riemen nach Plan wechseln; Kettenlängung und Spanner prüfen
Motorölleck|Ölflecken, Brandgeruch, sinkender Ölstand|Quelle finden; Ventildeckel-, Ölwannen- oder Kurbelwellendichtung erneuern
Motorüberhitzung|Hohe Temperaturanzeige, Dampf, Kühlmittelverlust|Sicher anhalten; Kühlmittel, Wasserpumpe, Thermostat, Kühler und Kopfdichtung prüfen
Kupplungsverschleiß|Rutschen, hoher Druckpunkt, Brandgeruch, schweres Schalten|Kupplungssatz ersetzen und Schwungrad prüfen
Defekt am Doppelkupplungsgetriebe|Ruckeln bei niedrigem Tempo, harte oder verzögerte Gangwechsel|Bei Bedarf Ölservice; Kupplungspaket und Mechatronik prüfen
Defekt am Automatikgetriebe|Harte Schaltvorgänge, Rutschen, verzögertes Einlegen|Öl und Fehlercodes prüfen; Getriebe warten oder reparieren
CVT-Riemen- oder Ölproblem|Ruckeln, Heulen, Drehzahlsprünge, schwache Beschleunigung|CVT-Öl nach Plan wechseln; verschlissene Riemen oder Scheiben reparieren
Defekt an Verteilergetriebe oder Kupplung (Allrad)|Verspannen in Kurven, Klacken, Antriebswarnung|Öl von Verteilergetriebe und Differenzial prüfen; gleiche Reifengrößen nutzen
Bremsenverschleiß|Quietschen, Vibration, längerer Bremsweg|Beläge und Scheiben ersetzen; Bremsflüssigkeit und Sättel prüfen
Fahrwerksverschleiß|Klopfen, Nachschwingen, ungleicher Reifenverschleiß, unruhiger Lauf|Verschlissene Dämpfer, Buchsen oder Gelenke ersetzen; Spur einstellen
Batterie- oder Ladefehler|Schwacher Anlasser, dunkles Licht, Batteriewarnung|Batterie und Lichtmaschine testen; defektes Teil ersetzen
Karosserierost|Blasen im Lack, Löcher in Schwellern und Boden|Rost herausschneiden, schweißen, danach behandeln und versiegeln
Vergaserprobleme|Schlechter Start, Absterben, Benzingeruch, unruhiger Leerlauf|Vergaser reinigen, überholen und einstellen
Display- oder Infotainmentfehler|Einfrieren, schwarzer Bildschirm, Touch- oder Bluetooth-Fehler|Neu starten und Software aktualisieren; Sicherungen prüfen oder Gerät ersetzen
Verschleiß der Wankel-Dichtleisten|Niedrige Kompression, schlechter Heißstart, Ölverbrauch|Kompressionstest durchführen; Wankelmotor überholen`,
  fr: `Panne de turbo|Perte de puissance, fumée bleue, sifflement, forte consommation d'huile|Vérifier les durites et l'arrivée d'huile, réparer ou remplacer le turbo ; vidanger à temps
Filtre à particules (FAP) encrassé|Alerte FAP, mode dégradé, régénérations fréquentes|Rouler à vitesse stable sur autoroute ; sinon nettoyage ou remplacement
Vanne EGR encrassée|Ralenti instable, fumée noire, perte de puissance, voyant moteur|Nettoyer ou remplacer la vanne EGR et contrôler la suie à l'admission
Usure des injecteurs diesel|Démarrage difficile, cliquetis, fumée, surconsommation|Faire un test de retour d'injecteurs ; reconditionner ou remplacer
Panne de bougies de préchauffage|Démarrage à froid difficile, fumée blanche, voyant clignotant|Tester les bougies et le relais ; remplacer les bougies défectueuses
Panne de bougie ou bobine d'allumage|Ratés, tremblements, accélération faible, voyant moteur|Lire les codes défaut ; remplacer les bougies usées ou la bobine
Usure de la courroie ou chaîne de distribution|Claquement au démarrage, ratés ; une rupture peut détruire le moteur|Remplacer la courroie à l'échéance ; contrôler la chaîne et les tendeurs
Fuites d'huile moteur|Taches d'huile, odeur de brûlé, baisse du niveau|Trouver l'origine ; refaire joints de cache-culbuteurs, carter ou vilebrequin
Surchauffe moteur|Température élevée, vapeur, perte de liquide|S'arrêter en sécurité ; contrôler liquide, pompe à eau, thermostat, radiateur et joint de culasse
Usure de l'embrayage|Patinage, pédale haute, odeur de brûlé, passages difficiles|Remplacer le kit d'embrayage et contrôler le volant moteur
Panne de boîte à double embrayage|À-coups à basse vitesse, passages brusques ou lents|Vidanger si nécessaire ; diagnostiquer embrayages et mécatronique
Panne de boîte automatique|Passages brusques, patinage, engagement retardé|Contrôler l'huile et les codes défaut ; entretenir ou réparer la boîte
Panne de courroie ou d'huile CVT|À-coups, sifflement, régime qui s'emballe, accélération faible|Vidanger la CVT à l'échéance ; réparer courroie ou poulies usées
Panne de transfert ou coupleur 4x4|Blocage en virage, claquements, alerte transmission|Contrôler l'huile du transfert et du différentiel ; garder des pneus identiques
Usure des freins|Grincement, vibrations, distance de freinage accrue|Remplacer plaquettes et disques ; contrôler liquide et étriers
Usure de la suspension|Claquements, rebonds, pneus usés irrégulièrement, tenue floue|Remplacer amortisseurs, silentblocs ou rotules ; refaire la géométrie
Panne de batterie ou de charge|Démarreur lent, phares faibles, alerte batterie|Tester batterie et alternateur ; remplacer la pièce défaillante
Rouille de carrosserie|Cloques de peinture, trous dans bas de caisse et plancher|Découper, souder, puis traiter et protéger la zone
Problèmes de carburateur|Démarrage difficile, calage, odeur d'essence, ralenti irrégulier|Nettoyer, refaire et régler le carburateur
Panne d'écran ou multimédia|Blocage, écran noir, erreurs tactiles ou Bluetooth|Redémarrer et mettre à jour ; contrôler les fusibles ou remplacer l'unité
Usure des segments d'apex (rotatif)|Compression faible, démarrage à chaud difficile, consommation d'huile|Faire un test de compression ; refaire le moteur rotatif`,
  es: `Avería del turbo|Pérdida de potencia, humo azul, silbido, alto consumo de aceite|Revisar manguitos y engrase, reparar o sustituir el turbo; cambiar el aceite a tiempo
Filtro de partículas (DPF) obstruido|Aviso DPF, modo de emergencia, regeneración frecuente|Conducir a velocidad constante en autopista; si no, limpiar o sustituir
Válvula EGR obstruida|Ralentí inestable, humo negro, pérdida de potencia, testigo motor|Limpiar o sustituir la EGR y revisar el hollín en la admisión
Desgaste de inyectores diésel|Arranque difícil, golpeteo, humo, alto consumo|Hacer prueba de retorno; reacondicionar o sustituir inyectores
Avería de calentadores|Arranque en frío difícil, humo blanco, testigo parpadeante|Probar calentadores y relé; sustituir los defectuosos
Avería de bujía o bobina|Fallos de encendido, vibración, mala aceleración, testigo motor|Leer códigos; sustituir bujías gastadas o la bobina averiada
Desgaste de correa o cadena de distribución|Ruido al arrancar, fallos; su rotura puede destruir el motor|Cambiar la correa a tiempo; revisar cadena y tensores
Fugas de aceite del motor|Manchas, olor a quemado, bajada de nivel|Localizar el origen; renovar juntas de tapa, cárter o cigüeñal
Sobrecalentamiento del motor|Temperatura alta, vapor, pérdida de refrigerante|Detenerse con seguridad; revisar refrigerante, bomba, termostato, radiador y junta de culata
Desgaste del embrague|Patinaje, pedal alto, olor a quemado, cambios duros|Sustituir el kit de embrague y revisar el volante motor
Avería de caja de doble embrague|Tirones a baja velocidad, cambios bruscos o lentos|Cambiar aceite si procede; diagnosticar embragues y mecatrónica
Avería de caja automática|Cambios bruscos, patinaje, acoplamiento lento|Revisar aceite y códigos; mantener o reparar la caja
Avería de correa o aceite CVT|Tirones, zumbido, subida de revoluciones, aceleración débil|Cambiar el aceite CVT a tiempo; reparar correa o poleas gastadas
Avería de transfer o acoplamiento 4x4|Bloqueo en curvas, golpes, aviso de tracción|Revisar aceite de transfer y diferencial; usar neumáticos iguales
Desgaste de frenos|Chirrido, vibración, mayor distancia de frenado|Sustituir pastillas y discos; revisar líquido y pinzas
Desgaste de suspensión|Golpes, rebotes, desgaste irregular, dirección imprecisa|Sustituir amortiguadores, casquillos o rótulas; alinear
Avería de batería o carga|Arranque lento, luces débiles, aviso de batería|Probar batería y alternador; sustituir la pieza averiada
Óxido en la carrocería|Burbujas en la pintura, agujeros en estribos y suelo|Cortar y soldar la zona, después tratar y sellar
Problemas de carburador|Arranque difícil, calado, olor a gasolina, ralentí irregular|Limpiar, reconstruir y ajustar el carburador
Avería de pantalla o multimedia|Bloqueos, pantalla negra, fallos táctiles o Bluetooth|Reiniciar y actualizar; revisar fusibles o sustituir la unidad
Desgaste de sellos de vértice (rotativo)|Baja compresión, mal arranque en caliente, consumo de aceite|Hacer prueba de compresión; reconstruir el motor rotativo`,
  it: `Guasto del turbo|Perdita di potenza, fumo blu, fischio, alto consumo d'olio|Controllare manicotti e lubrificazione, riparare o sostituire il turbo; cambiare l'olio puntualmente
Filtro antiparticolato (DPF) intasato|Spia DPF, modalità di emergenza, rigenerazioni frequenti|Guidare a velocità costante in autostrada; altrimenti pulire o sostituire
Valvola EGR intasata|Minimo irregolare, fumo nero, perdita di potenza, spia motore|Pulire o sostituire la EGR e controllare la fuliggine nell'aspirazione
Usura iniettori diesel|Avviamento difficile, battito, fumo, consumi elevati|Eseguire il test di ritorno; rigenerare o sostituire gli iniettori
Guasto candelette|Avviamento a freddo difficile, fumo bianco, spia lampeggiante|Testare candelette e relè; sostituire quelle guaste
Guasto candela o bobina|Mancate accensioni, vibrazioni, accelerazione debole, spia motore|Leggere i codici; sostituire candele usurate o bobina guasta
Usura cinghia o catena di distribuzione|Rumore all'avvio, perdite di colpi; la rottura può distruggere il motore|Sostituire la cinghia alla scadenza; controllare catena e tenditori
Perdite d'olio motore|Macchie d'olio, odore di bruciato, livello in calo|Trovare l'origine; rinnovare guarnizioni di coperchio, coppa o albero
Surriscaldamento motore|Temperatura alta, vapore, perdita di refrigerante|Fermarsi in sicurezza; controllare refrigerante, pompa, termostato, radiatore e guarnizione testata
Usura frizione|Slittamento, pedale alto, odore di bruciato, cambiate dure|Sostituire il kit frizione e controllare il volano
Guasto cambio a doppia frizione|Strappi a bassa velocità, cambiate brusche o lente|Cambiare l'olio se previsto; diagnosticare frizioni e meccatronica
Guasto cambio automatico|Cambiate brusche, slittamento, innesto ritardato|Controllare olio e codici; manutenzione o riparazione del cambio
Guasto cinghia o olio CVT|Strappi, sibilo, giri che salgono, accelerazione debole|Cambiare l'olio CVT alla scadenza; riparare cinghia o pulegge usurate
Guasto ripartitore o giunto 4x4|Blocchi in curva, colpi, avviso trazione|Controllare l'olio di ripartitore e differenziale; usare pneumatici uguali
Usura freni|Stridio, vibrazioni, spazio di frenata maggiore|Sostituire pastiglie e dischi; controllare liquido e pinze
Usura sospensioni|Colpi, rimbalzi, usura irregolare, guida instabile|Sostituire ammortizzatori, boccole o giunti; allineare le ruote
Guasto batteria o ricarica|Avviamento lento, luci deboli, spia batteria|Testare batteria e alternatore; sostituire il pezzo guasto
Ruggine sulla carrozzeria|Bolle nella vernice, fori in sottoporta e pianale|Tagliare e saldare la zona, poi trattare e sigillare
Problemi al carburatore|Avviamento difficile, spegnimenti, odore di benzina, minimo irregolare|Pulire, revisionare e regolare il carburatore
Guasto schermo o infotainment|Blocchi, schermo nero, errori touch o Bluetooth|Riavviare e aggiornare; controllare i fusibili o sostituire l'unità
Usura tenute d'apice (rotativo)|Bassa compressione, avviamento a caldo difficile, consumo d'olio|Eseguire il test di compressione; revisionare il motore rotativo`,
  pt: `Falha do turbo|Perda de potência, fumaça azul, assobio, alto consumo de óleo|Verificar mangueiras e lubrificação, reparar ou trocar o turbo; trocar o óleo no prazo
Filtro de partículas (DPF) entupido|Alerta DPF, modo de segurança, regenerações frequentes|Rodar em velocidade constante na estrada; se não resolver, limpar ou trocar
Válvula EGR entupida|Marcha lenta irregular, fumaça preta, perda de potência, luz do motor|Limpar ou trocar a EGR e verificar fuligem na admissão
Desgaste dos injetores diesel|Partida difícil, batidas, fumaça, alto consumo|Fazer teste de retorno; recondicionar ou trocar os injetores
Falha das velas aquecedoras|Partida a frio difícil, fumaça branca, luz piscando|Testar velas e relé; trocar as defeituosas
Falha de vela ou bobina|Falhas de ignição, tremor, aceleração fraca, luz do motor|Ler os códigos; trocar velas gastas ou a bobina defeituosa
Desgaste da correia ou corrente dentada|Ruído na partida, falhas; a quebra pode destruir o motor|Trocar a correia no prazo; verificar corrente e tensores
Vazamentos de óleo do motor|Manchas, cheiro de queimado, nível baixando|Localizar a origem; renovar juntas da tampa, cárter ou virabrequim
Superaquecimento do motor|Temperatura alta, vapor, perda de líquido|Parar com segurança; verificar líquido, bomba, termostato, radiador e junta do cabeçote
Desgaste da embreagem|Patinação, pedal alto, cheiro de queimado, trocas duras|Trocar o kit de embreagem e verificar o volante do motor
Falha do câmbio de dupla embreagem|Trancos em baixa velocidade, trocas bruscas ou lentas|Trocar o óleo se indicado; diagnosticar embreagens e mecatrônica
Falha do câmbio automático|Trocas bruscas, patinação, engate demorado|Verificar óleo e códigos; revisar ou reparar o câmbio
Falha da correia ou óleo CVT|Trancos, zumbido, rotação disparando, aceleração fraca|Trocar o óleo CVT no prazo; reparar correia ou polias gastas
Falha da caixa de transferência 4x4|Travamento em curvas, batidas, alerta de tração|Verificar óleo da transferência e diferencial; usar pneus iguais
Desgaste dos freios|Chiado, vibração, maior distância de frenagem|Trocar pastilhas e discos; verificar fluido e pinças
Desgaste da suspensão|Batidas, balanço, desgaste irregular, direção instável|Trocar amortecedores, buchas ou pivôs; alinhar as rodas
Falha da bateria ou carga|Partida lenta, luzes fracas, alerta de bateria|Testar bateria e alternador; trocar a peça defeituosa
Ferrugem na carroceria|Bolhas na pintura, furos nas soleiras e no assoalho|Cortar e soldar a área, depois tratar e selar
Problemas no carburador|Partida difícil, motor morrendo, cheiro de gasolina, marcha lenta irregular|Limpar, reconstruir e regular o carburador
Falha da tela ou multimídia|Travamentos, tela preta, erros de toque ou Bluetooth|Reiniciar e atualizar; verificar fusíveis ou trocar a unidade
Desgaste das vedações de ápice (rotativo)|Baixa compressão, partida a quente difícil, consumo de óleo|Fazer teste de compressão; reconstruir o motor rotativo`,
  ru: `Неисправность турбины|Потеря мощности, синий дым, свист, большой расход масла|Проверить патрубки и подачу масла, отремонтировать или заменить турбину; вовремя менять масло
Засорение сажевого фильтра (DPF)|Сигнал DPF, аварийный режим, частая регенерация|Проехать по трассе с постоянной скоростью; иначе очистить или заменить
Засорение клапана EGR|Неровный холостой ход, чёрный дым, потеря мощности, Check Engine|Очистить или заменить клапан EGR, проверить сажу во впуске
Износ дизельных форсунок|Трудный пуск, стук, дым, высокий расход|Проверить обратный слив; восстановить или заменить форсунки
Неисправность свечей накаливания|Трудный холодный пуск, белый дым, мигающая лампа|Проверить свечи и реле; заменить неисправные свечи
Неисправность свечи или катушки зажигания|Пропуски, тряска, слабый разгон, Check Engine|Считать коды ошибок; заменить изношенные свечи или катушку
Износ ремня или цепи ГРМ|Стук при пуске, пропуски; обрыв может разрушить двигатель|Менять ремень по регламенту; проверять растяжение цепи и натяжители
Утечки моторного масла|Масляные пятна, запах гари, падение уровня|Найти источник; заменить прокладки клапанной крышки, поддона или сальники
Перегрев двигателя|Высокая температура, пар, потеря антифриза|Безопасно остановиться; проверить антифриз, помпу, термостат, радиатор и прокладку ГБЦ
Износ сцепления|Пробуксовка, высокая педаль, запах гари, тугое переключение|Заменить комплект сцепления и проверить маховик
Неисправность коробки с двумя сцеплениями|Рывки на малой скорости, резкие или медленные переключения|Заменить масло при необходимости; проверить сцепления и мехатронику
Неисправность автоматической коробки|Резкие переключения, пробуксовка, задержка включения|Проверить масло и ошибки; обслужить или отремонтировать коробку
Неисправность ремня или масла вариатора|Рывки, вой, скачки оборотов, слабый разгон|Менять масло вариатора по регламенту; ремонтировать ремень или шкивы
Неисправность раздатки или муфты полного привода|Заклинивание в поворотах, стуки, ошибка привода|Проверить масло раздатки и дифференциала; ставить одинаковые шины
Износ тормозов|Скрип, вибрация, увеличенный тормозной путь|Заменить колодки и диски; проверить жидкость и суппорты
Износ подвески|Стуки, раскачка, неровный износ шин, рыскание|Заменить амортизаторы, сайлентблоки или шарниры; сделать развал-схождение
Неисправность аккумулятора или зарядки|Слабый пуск, тусклый свет, сигнал аккумулятора|Проверить аккумулятор и генератор; заменить неисправную деталь
Коррозия кузова|Вздутие краски, дыры в порогах и полу|Вырезать и заварить участок, затем обработать и загерметизировать
Проблемы карбюратора|Трудный пуск, глохнет, запах бензина, неровный холостой ход|Очистить, перебрать и настроить карбюратор
Неисправность экрана или мультимедиа|Зависания, чёрный экран, ошибки сенсора или Bluetooth|Перезагрузить и обновить ПО; проверить предохранители или заменить блок
Износ апексов роторного двигателя|Низкая компрессия, трудный горячий пуск, расход масла|Замерить компрессию; перебрать роторный двигатель`,
  ar: `عطل الشاحن التوربيني|فقدان القوة، دخان أزرق، صفير، استهلاك زيت مرتفع|افحص خراطيم الضغط وتغذية الزيت، ثم أصلح التوربو أو استبدله وغيّر الزيت في موعده
انسداد فلتر جزيئات الديزل (DPF)|تحذير DPF، وضع الطوارئ، تجديد متكرر|قد بسرعة ثابتة على الطريق السريع، وإلا فنظفه أو استبدله
انسداد صمام EGR|اهتزاز في السكون، دخان أسود، فقدان القوة، لمبة المحرك|نظف صمام EGR أو استبدله وافحص السخام في السحب
تآكل بخاخات الديزل|صعوبة التشغيل، طرق، دخان، استهلاك مرتفع|أجرِ اختبار الراجع، ثم جدد البخاخات المعطلة أو استبدلها
عطل شمعات التسخين|صعوبة التشغيل على البارد، دخان أبيض، وميض اللمبة|افحص الشمعات والمرحل واستبدل الشمعات المعطلة
عطل شمعة الإشعال أو الملف|تقطيع، اهتزاز، تسارع ضعيف، لمبة المحرك|اقرأ رموز الأعطال واستبدل الشمعات البالية أو الملف المعطل
تآكل سير أو جنزير التوقيت|صوت عند التشغيل، تقطيع، وقد يدمر انقطاعه المحرك|استبدل السير في موعده وافحص تمدد الجنزير والشدادات
تسرب زيت المحرك|بقع زيت، رائحة احتراق، انخفاض المستوى|حدد المصدر وجدد حشوات الغطاء أو الحوض أو العمود المرفقي
ارتفاع حرارة المحرك|مؤشر حرارة مرتفع، بخار، فقدان سائل التبريد|توقف بأمان وافحص السائل والمضخة والثرموستات والرديتر وحشية الرأس
تآكل القابض|انزلاق، دواسة مرتفعة، رائحة احتراق، صعوبة التعشيق|استبدل طقم القابض وافحص الحدافة
عطل ناقل الحركة مزدوج القابض|ارتجاج عند السرعة المنخفضة، تبديل عنيف أو متأخر|غيّر الزيت عند الحاجة وافحص القوابض ووحدة الميكاترونيك
عطل ناقل الحركة الأوتوماتيكي|تبديل عنيف، انزلاق، تعشيق متأخر|افحص الزيت ورموز الأعطال ثم صن ناقل الحركة أو أصلحه
عطل سير أو زيت CVT|ارتجاج، طنين، ارتفاع الدوران، تسارع ضعيف|غيّر زيت CVT في موعده وأصلح السير أو البكرات البالية
عطل صندوق التوزيع أو وصلة الدفع الكلي|تيبس في المنعطفات، طرقات، تحذير نظام الدفع|افحص زيت التوزيع والترس التفاضلي واستخدم إطارات متماثلة
تآكل المكابح|صرير، اهتزاز، زيادة مسافة التوقف|استبدل الفحمات والأقراص وافحص السائل والفكوك
تآكل نظام التعليق|طرقات، ارتداد، تآكل غير منتظم للإطارات، عدم ثبات|استبدل المساعدات أو الجلب أو المفاصل البالية واضبط الزوايا
عطل البطارية أو الشحن|تشغيل بطيء، أضواء خافتة، تحذير البطارية|افحص البطارية والمولد واستبدل القطعة المعطلة
صدأ الهيكل|فقاعات في الطلاء، ثقوب في العتبات والأرضية|اقطع المنطقة ولحمها ثم عالجها واحمها
مشكلات الكاربراتير|صعوبة التشغيل، توقف المحرك، رائحة بنزين، سكون غير منتظم|نظف الكاربراتير وجدده واضبطه
عطل الشاشة أو نظام الوسائط|تجمد، شاشة سوداء، أخطاء اللمس أو البلوتوث|أعد التشغيل وحدّث البرنامج وافحص المصاهر أو استبدل الوحدة
تآكل موانع القمة في المحرك الدوار|ضغط منخفض، صعوبة التشغيل ساخنًا، استهلاك زيت|أجرِ اختبار الضغط وجدد المحرك الدوار`,
  zh: `涡轮增压器故障|动力下降、冒蓝烟、啸叫、机油消耗大|检查增压管和供油，维修或更换涡轮，按时换机油
柴油颗粒过滤器（DPF）堵塞|DPF 警告、跛行模式、频繁再生|在高速路匀速行驶再生，否则清洗或更换
EGR 阀堵塞|怠速抖动、冒黑烟、动力下降、发动机灯亮|清洗或更换 EGR 阀，检查进气积碳
柴油喷油器磨损|启动困难、敲缸、冒烟、油耗高|做回油量测试，修复或更换故障喷油器
预热塞故障|冷启动困难、冒白烟、预热灯闪烁|检测预热塞和继电器，更换故障件
火花塞或点火线圈故障|失火、抖动、加速无力、发动机灯亮|读取故障码，更换磨损火花塞或故障线圈
正时皮带或链条磨损|启动异响、失火，断裂可能损毁发动机|按期更换皮带，检查链条伸长和张紧器
发动机漏油|地面油渍、焦味、机油液位下降|查明来源，更换气门室盖、油底壳或曲轴油封
发动机过热|水温过高、冒蒸汽、冷却液减少|安全停车，检查冷却液、水泵、节温器、散热器和缸垫
离合器磨损|打滑、踏板行程高、焦味、换挡困难|更换离合器套件并检查飞轮
双离合变速箱故障|低速顿挫、换挡冲击或迟滞|按需换油，诊断离合器组和机电单元
自动变速箱故障|换挡冲击、打滑、挂挡延迟|检查油液和故障码，保养或维修变速箱
CVT 钢带或油液故障|顿挫、异响、转速飘升、加速无力|按期更换 CVT 油，维修磨损钢带或带轮
四驱分动器或耦合器故障|转弯发卡、异响、驱动系统警告|检查分动器和差速器油，保持轮胎规格一致
制动磨损|尖叫、抖动、制动距离变长|更换刹车片和刹车盘，检查制动液和卡钳
悬架磨损|异响、颠簸、轮胎偏磨、跑偏|更换磨损减振器、衬套或球头，做四轮定位
蓄电池或充电故障|启动无力、灯光昏暗、电池警告|检测蓄电池和发电机，更换故障件
车身锈蚀|漆面起泡、门槛和底板穿孔|切除并焊补，再做防锈密封
化油器问题|启动困难、熄火、汽油味、怠速不稳|清洗、翻修并调整化油器
屏幕或车机故障|死机、黑屏、触控或蓝牙错误|重启并更新软件，检查保险丝或更换主机
转子发动机顶封磨损|压缩不足、热车难启动、烧机油|做压缩测试，翻修转子发动机`,
  ja: `ターボチャージャー故障|出力低下、青白い煙、笛のような音、オイル消費増加|ブーストホースとオイル供給を点検し、ターボを修理または交換。オイルは定期交換
ディーゼル微粒子フィルター（DPF）詰まり|DPF警告、リンプモード、頻繁な再生|高速道路を一定速度で走行して再生。改善しなければ洗浄または交換
EGRバルブ詰まり|アイドリング不調、黒煙、出力低下、エンジン警告灯|EGRバルブを清掃または交換し、吸気系のすすを点検
ディーゼルインジェクター摩耗|始動困難、ノック音、煙、燃費悪化|リターン量テストを行い、不良品を再生または交換
グロープラグ故障|冷間始動困難、白煙、予熱ランプ点滅|プラグとリレーを点検し、不良プラグを交換
スパークプラグ・点火コイル故障|失火、振動、加速不良、エンジン警告灯|故障コードを読み、摩耗プラグや不良コイルを交換
タイミングベルト・チェーン摩耗|始動時の異音、失火。破断するとエンジン損傷の恐れ|ベルトを定期交換し、チェーンの伸びとテンショナーを点検
エンジンオイル漏れ|油染み、焦げ臭さ、オイル量低下|漏れ箇所を特定し、カバー、オイルパン、クランクのシールを交換
オーバーヒート|水温上昇、蒸気、冷却水減少|安全に停車し、冷却水、ウォーターポンプ、サーモスタット、ラジエーター、ヘッドガスケットを点検
クラッチ摩耗|滑り、ペダル位置が高い、焦げ臭さ、シフト不良|クラッチキットを交換し、フライホイールを点検
デュアルクラッチ変速機の故障|低速時のジャダー、変速ショックや遅れ|必要に応じてオイル交換し、クラッチとメカトロニクスを診断
オートマチック変速機の故障|変速ショック、滑り、つながりの遅れ|オイルと故障コードを確認し、整備または修理
CVTベルト・フルードの不具合|ジャダー、うなり音、回転の上昇、加速不良|CVTフルードを定期交換し、摩耗したベルトやプーリーを修理
四輪駆動のトランスファー・カップリング故障|旋回時の引きずり、異音、駆動系警告|トランスファーとデフのオイルを点検し、タイヤサイズをそろえる
ブレーキ摩耗|鳴き、振動、制動距離の増加|パッドとディスクを交換し、液とキャリパーを点検
サスペンション摩耗|異音、揺れ、タイヤの偏摩耗、ふらつき|摩耗したショック、ブッシュ、ジョイントを交換し、アライメント調整
バッテリー・充電系の故障|始動が弱い、ライトが暗い、バッテリー警告|バッテリーとオルタネーターを点検し、不良部品を交換
ボディの錆|塗装の膨れ、サイドシルや床の穴|錆部を切除して溶接し、防錆処理と密封を行う
キャブレターの不具合|始動困難、エンスト、ガソリン臭、アイドリング不安定|キャブレターを清掃、オーバーホール、調整
画面・インフォテインメント不具合|フリーズ、画面が黒い、タッチやBluetoothのエラー|再起動してソフトを更新。ヒューズ点検またはユニット交換
ロータリーのアペックスシール摩耗|圧縮低下、高温時の始動困難、オイル消費|圧縮テストを行い、ロータリーエンジンをオーバーホール`,
};

const PARTS = {
  en: `Engine block|Cylinder head|Pistons|Crankshaft|Camshaft|Timing belt/chain|Valves|Oil pump|Oil filter|Air filter|Engine mounts|Turbocharger|Intercooler|Supercharger|Rotors
Fuel tank|Fuel pump|Fuel injectors|Fuel filter|Spark plugs|Ignition coils|Glow plugs
Radiator|Water pump|Thermostat|Coolant hoses
Exhaust manifold|Catalytic converter|Diesel particulate filter|EGR valve|Muffler|Oxygen sensor
Clutch|Flywheel|Gearbox|Torque converter|Mechatronic unit|CVT belt|Drive axles|Propeller shaft|Differential|Transfer case
Brake discs|Brake pads|Calipers|Master cylinder|ABS unit
Shock absorbers|Springs|Control arms|Tie rods|Wheel bearings|Steering rack|Tires
Battery|Alternator|Starter motor|Engine control unit|Headlights|Tail lights|Center screen|Instrument cluster
Hood|Doors|Fenders|Bumpers|Windshield|Mirrors|Trunk lid
Seats|Steering wheel|Dashboard|Seat belts|Airbags|Air conditioning`,
  tr: `Motor bloğu|Silindir kapağı|Pistonlar|Krank mili|Eksantrik mili|Triger kayışı/zinciri|Supaplar|Yağ pompası|Yağ filtresi|Hava filtresi|Motor takozları|Turbo|Intercooler|Kompresör|Rotorlar
Yakıt deposu|Yakıt pompası|Enjektörler|Yakıt filtresi|Bujiler|Ateşleme bobinleri|Kızdırma bujileri
Radyatör|Devirdaim pompası|Termostat|Radyatör hortumları
Egzoz manifoldu|Katalitik konvertör|Dizel partikül filtresi|EGR valfi|Egzoz susturucu|Oksijen sensörü
Debriyaj|Volan|Şanzıman|Tork konvertörü|Mekatronik ünite|CVT kayışı|Aks milleri|Kardan mili|Diferansiyel|Transfer kutusu
Fren diskleri|Fren balataları|Kaliperler|Ana merkez|ABS ünitesi
Amortisörler|Helezon yaylar|Salıncaklar|Rot başları|Teker rulmanları|Direksiyon kutusu|Lastikler
Akü|Alternatör|Marş motoru|Motor beyni (ECU)|Farlar|Stop lambaları|Orta ekran|Gösterge paneli
Kaput|Kapılar|Çamurluklar|Tamponlar|Ön cam|Aynalar|Bagaj kapağı
Koltuklar|Direksiyon|Torpido/ön panel|Emniyet kemerleri|Hava yastıkları|Klima`,
  de: `Motorblock|Zylinderkopf|Kolben|Kurbelwelle|Nockenwelle|Zahnriemen/Steuerkette|Ventile|Ölpumpe|Ölfilter|Luftfilter|Motorlager|Turbolader|Ladeluftkühler|Kompressor|Rotoren
Kraftstofftank|Kraftstoffpumpe|Einspritzdüsen|Kraftstofffilter|Zündkerzen|Zündspulen|Glühkerzen
Kühler|Wasserpumpe|Thermostat|Kühlmittelschläuche
Abgaskrümmer|Katalysator|Dieselpartikelfilter|AGR-Ventil|Schalldämpfer|Lambdasonde
Kupplung|Schwungrad|Getriebe|Drehmomentwandler|Mechatronik|CVT-Riemen|Antriebswellen|Kardanwelle|Differenzial|Verteilergetriebe
Bremsscheiben|Bremsbeläge|Bremssättel|Hauptbremszylinder|ABS-Einheit
Stoßdämpfer|Federn|Querlenker|Spurstangen|Radlager|Lenkgetriebe|Reifen
Batterie|Lichtmaschine|Anlasser|Motorsteuergerät|Scheinwerfer|Rückleuchten|Zentraldisplay|Kombiinstrument
Motorhaube|Türen|Kotflügel|Stoßfänger|Windschutzscheibe|Spiegel|Kofferraumdeckel
Sitze|Lenkrad|Armaturenbrett|Sicherheitsgurte|Airbags|Klimaanlage`,
  fr: `Bloc moteur|Culasse|Pistons|Vilebrequin|Arbre à cames|Courroie/chaîne de distribution|Soupapes|Pompe à huile|Filtre à huile|Filtre à air|Supports moteur|Turbo|Échangeur|Compresseur|Rotors
Réservoir|Pompe à carburant|Injecteurs|Filtre à carburant|Bougies d'allumage|Bobines d'allumage|Bougies de préchauffage
Radiateur|Pompe à eau|Thermostat|Durites
Collecteur d'échappement|Catalyseur|Filtre à particules|Vanne EGR|Silencieux|Sonde lambda
Embrayage|Volant moteur|Boîte de vitesses|Convertisseur de couple|Mécatronique|Courroie CVT|Arbres de roue|Arbre de transmission|Différentiel|Boîte de transfert
Disques de frein|Plaquettes|Étriers|Maître-cylindre|Bloc ABS
Amortisseurs|Ressorts|Triangles|Biellettes de direction|Roulements de roue|Crémaillère|Pneus
Batterie|Alternateur|Démarreur|Calculateur moteur|Phares|Feux arrière|Écran central|Combiné d'instruments
Capot|Portes|Ailes|Pare-chocs|Pare-brise|Rétroviseurs|Hayon/coffre
Sièges|Volant|Tableau de bord|Ceintures|Airbags|Climatisation`,
  es: `Bloque motor|Culata|Pistones|Cigüeñal|Árbol de levas|Correa/cadena de distribución|Válvulas|Bomba de aceite|Filtro de aceite|Filtro de aire|Soportes de motor|Turbo|Intercooler|Compresor|Rotores
Depósito|Bomba de combustible|Inyectores|Filtro de combustible|Bujías|Bobinas de encendido|Calentadores
Radiador|Bomba de agua|Termostato|Manguitos
Colector de escape|Catalizador|Filtro de partículas|Válvula EGR|Silenciador|Sonda lambda
Embrague|Volante motor|Caja de cambios|Convertidor de par|Mecatrónica|Correa CVT|Palieres|Árbol de transmisión|Diferencial|Caja de transferencia
Discos de freno|Pastillas|Pinzas|Bomba de freno|Unidad ABS
Amortiguadores|Muelles|Trapecios|Bieletas de dirección|Rodamientos|Cremallera|Neumáticos
Batería|Alternador|Motor de arranque|Centralita|Faros|Pilotos traseros|Pantalla central|Cuadro de instrumentos
Capó|Puertas|Aletas|Parachoques|Parabrisas|Retrovisores|Portón del maletero
Asientos|Volante|Salpicadero|Cinturones|Airbags|Aire acondicionado`,
  it: `Blocco motore|Testata|Pistoni|Albero motore|Albero a camme|Cinghia/catena distribuzione|Valvole|Pompa olio|Filtro olio|Filtro aria|Supporti motore|Turbo|Intercooler|Compressore|Rotori
Serbatoio|Pompa carburante|Iniettori|Filtro carburante|Candele|Bobine|Candelette
Radiatore|Pompa acqua|Termostato|Manicotti
Collettore di scarico|Catalizzatore|Filtro antiparticolato|Valvola EGR|Silenziatore|Sonda lambda
Frizione|Volano|Cambio|Convertitore di coppia|Meccatronica|Cinghia CVT|Semiassi|Albero di trasmissione|Differenziale|Ripartitore
Dischi freno|Pastiglie|Pinze|Pompa freni|Centralina ABS
Ammortizzatori|Molle|Bracci|Tiranti sterzo|Cuscinetti ruota|Scatola sterzo|Pneumatici
Batteria|Alternatore|Motorino di avviamento|Centralina motore|Fari|Luci posteriori|Schermo centrale|Quadro strumenti
Cofano|Portiere|Parafanghi|Paraurti|Parabrezza|Specchietti|Portellone
Sedili|Volante|Plancia|Cinture|Airbag|Climatizzatore`,
  pt: `Bloco do motor|Cabeçote|Pistões|Virabrequim|Comando de válvulas|Correia/corrente dentada|Válvulas|Bomba de óleo|Filtro de óleo|Filtro de ar|Coxins do motor|Turbo|Intercooler|Compressor|Rotores
Tanque|Bomba de combustível|Injetores|Filtro de combustível|Velas de ignição|Bobinas|Velas aquecedoras
Radiador|Bomba d'água|Termostato|Mangueiras
Coletor de escape|Catalisador|Filtro de partículas|Válvula EGR|Silencioso|Sonda lambda
Embreagem|Volante do motor|Câmbio|Conversor de torque|Mecatrônica|Correia CVT|Semieixos|Eixo cardã|Diferencial|Caixa de transferência
Discos de freio|Pastilhas|Pinças|Cilindro mestre|Módulo ABS
Amortecedores|Molas|Bandejas|Terminais de direção|Rolamentos de roda|Caixa de direção|Pneus
Bateria|Alternador|Motor de partida|Módulo do motor|Faróis|Lanternas traseiras|Tela central|Painel de instrumentos
Capô|Portas|Paralamas|Para-choques|Para-brisa|Retrovisores|Tampa traseira
Bancos|Volante|Painel|Cintos|Airbags|Ar-condicionado`,
  ru: `Блок цилиндров|ГБЦ|Поршни|Коленвал|Распредвал|Ремень/цепь ГРМ|Клапаны|Масляный насос|Масляный фильтр|Воздушный фильтр|Опоры двигателя|Турбина|Интеркулер|Компрессор|Роторы
Топливный бак|Топливный насос|Форсунки|Топливный фильтр|Свечи зажигания|Катушки зажигания|Свечи накаливания
Радиатор|Помпа|Термостат|Патрубки
Выпускной коллектор|Катализатор|Сажевый фильтр|Клапан EGR|Глушитель|Лямбда-зонд
Сцепление|Маховик|Коробка передач|Гидротрансформатор|Мехатроник|Ремень вариатора|Приводные валы|Карданный вал|Дифференциал|Раздаточная коробка
Тормозные диски|Тормозные колодки|Суппорты|Главный цилиндр|Блок ABS
Амортизаторы|Пружины|Рычаги|Рулевые тяги|Ступичные подшипники|Рулевая рейка|Шины
Аккумулятор|Генератор|Стартер|ЭБУ двигателя|Фары|Задние фонари|Центральный экран|Приборная панель
Капот|Двери|Крылья|Бамперы|Лобовое стекло|Зеркала|Крышка багажника
Сиденья|Руль|Торпедо|Ремни безопасности|Подушки безопасности|Кондиционер`,
  ar: `كتلة المحرك|رأس الأسطوانات|المكابس|العمود المرفقي|عمود الكامات|سير/جنزير التوقيت|الصمامات|مضخة الزيت|فلتر الزيت|فلتر الهواء|قواعد المحرك|الشاحن التوربيني|مبرد الهواء|الشاحن الفائق|الدوارات
خزان الوقود|مضخة الوقود|البخاخات|فلتر الوقود|شمعات الإشعال|ملفات الإشعال|شمعات التسخين
الرديتر|مضخة الماء|الثرموستات|خراطيم التبريد
مجمع العادم|المحول الحفاز|فلتر جزيئات الديزل|صمام EGR|كاتم الصوت|حساس الأكسجين
القابض|الحدافة|ناقل الحركة|محول العزم|وحدة الميكاترونيك|سير CVT|أعمدة الدفع|عمود الكردان|الترس التفاضلي|صندوق التوزيع
أقراص المكابح|فحمات المكابح|الفكوك|الأسطوانة الرئيسية|وحدة ABS
المساعدات|النوابض|أذرع التحكم|أذرع التوجيه|رولمان العجلات|علبة التوجيه|الإطارات
البطارية|المولد|بادئ الحركة|وحدة تحكم المحرك|المصابيح الأمامية|المصابيح الخلفية|الشاشة الوسطى|لوحة العدادات
غطاء المحرك|الأبواب|الرفارف|الصدامات|الزجاج الأمامي|المرايا|غطاء الصندوق
المقاعد|عجلة القيادة|لوحة القيادة|أحزمة الأمان|الوسائد الهوائية|التكييف`,
  zh: `缸体|缸盖|活塞|曲轴|凸轮轴|正时皮带/链条|气门|机油泵|机油滤清器|空气滤清器|发动机支架|涡轮增压器|中冷器|机械增压器|转子
油箱|燃油泵|喷油器|燃油滤清器|火花塞|点火线圈|预热塞
散热器|水泵|节温器|冷却水管
排气歧管|三元催化器|柴油颗粒过滤器|EGR 阀|消声器|氧传感器
离合器|飞轮|变速箱|液力变矩器|机电单元|CVT 钢带|驱动半轴|传动轴|差速器|分动器
刹车盘|刹车片|卡钳|制动总泵|ABS 单元
减振器|弹簧|控制臂|转向拉杆|轮毂轴承|转向机|轮胎
蓄电池|发电机|起动机|发动机控制单元|前大灯|尾灯|中控屏|仪表盘
发动机盖|车门|翼子板|保险杠|前挡风玻璃|后视镜|行李厢盖
座椅|方向盘|仪表台|安全带|安全气囊|空调`,
  ja: `シリンダーブロック|シリンダーヘッド|ピストン|クランクシャフト|カムシャフト|タイミングベルト/チェーン|バルブ|オイルポンプ|オイルフィルター|エアフィルター|エンジンマウント|ターボチャージャー|インタークーラー|スーパーチャージャー|ローター
燃料タンク|燃料ポンプ|インジェクター|燃料フィルター|スパークプラグ|点火コイル|グロープラグ
ラジエーター|ウォーターポンプ|サーモスタット|冷却ホース
エキゾーストマニホールド|触媒コンバーター|ディーゼル微粒子フィルター|EGRバルブ|マフラー|O2センサー
クラッチ|フライホイール|トランスミッション|トルクコンバーター|メカトロニクス|CVTベルト|ドライブシャフト|プロペラシャフト|デファレンシャル|トランスファー
ブレーキディスク|ブレーキパッド|キャリパー|マスターシリンダー|ABSユニット
ショックアブソーバー|スプリング|コントロールアーム|タイロッド|ホイールベアリング|ステアリングラック|タイヤ
バッテリー|オルタネーター|スターター|エンジンECU|ヘッドライト|テールランプ|センター画面|メーター
ボンネット|ドア|フェンダー|バンパー|フロントガラス|ミラー|トランクリッド
シート|ステアリングホイール|ダッシュボード|シートベルト|エアバッグ|エアコン`,
};

const PART_IDS = PART_GROUPS.flatMap(([, ids]) => ids);

export const CARE_UI = Object.fromEntries(Object.entries(UI).map(([lang, text]) => {
  const values = text.split('|');
  if (values.length !== UI_KEYS.length) throw new Error(`care UI ${lang}: ${values.length}/${UI_KEYS.length}`);
  return [lang, Object.fromEntries(UI_KEYS.map((key, i) => [key, values[i]]))];
}));

const problemText = Object.fromEntries(Object.entries(PROBLEMS).map(([lang, text]) => {
  const lines = text.split('\n');
  if (lines.length !== PROBLEM_RULES.length) throw new Error(`problems ${lang}: ${lines.length}/${PROBLEM_RULES.length}`);
  return [lang, Object.fromEntries(lines.map((line, i) => {
    const cells = line.split('|');
    if (cells.length !== 3) throw new Error(`problems ${lang} line ${i + 1}: ${cells.length} cells`);
    return [PROBLEM_RULES[i][0], { title: cells[0], symptoms: cells[1], solution: cells[2] }];
  }))];
}));

const partText = Object.fromEntries(Object.entries(PARTS).map(([lang, text]) => {
  const values = text.split(/[|\n]/);
  if (values.length !== PART_IDS.length) throw new Error(`parts ${lang}: ${values.length}/${PART_IDS.length}`);
  return [lang, Object.fromEntries(PART_IDS.map((id, i) => [id, values[i]]))];
}));

export function problemsFor(car, lang) {
  return PROBLEM_RULES.filter(([, , applies]) => applies(car)).map(([id, severity]) => ({ id, severity, ...problemText[lang][id] }));
}

export function partsFor(car, lang) {
  return PART_GROUPS
    .map(([group, ids]) => ({ group, parts: ids.filter((id) => (PART_RULES[id] || always)(car)).map((id) => ({ id, name: partText[lang][id] })) }))
    .filter(({ parts }) => parts.length);
}
