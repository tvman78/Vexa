const KEYS = `home brands cars compare favorites settings tagline heroText explore statBrands statModels statCountries featured search all allCountries noResults noModelsBrand founded active defunct models back
cat_sport cat_classic cat_economy cat_luxury cat_suv body_sedan body_hatch body_coupe body_wagon body_suv body_convertible body_pickup body_supercar fuel_p fuel_d
tab_overview tab_engine tab_perf tab_dims tab_interior tab_exterior engine displacement aspiration asp_NA asp_T asp_TT asp_S cylinders power torque drive drive_FWD drive_RWD drive_AWD gearbox gb_M gb_A gb_D gb_CVT speeds
accel topSpeed weight consumption powerWeight specificPower length width height wheelbase trunk seats screen noScreen cluster cl_a cl_d production category bodyType fuel country
view_orbit view_front view_side view_rear view_driver view_rearseat view_engine paint autoRotate dragHint modelNote dataNote language languageHint pickCar addFav removeFav noFavs present`.split(/\s+/);

const PACKS = {
  en: `Home|Brands|Cars|Compare|Favorites|Settings|Every engine. Every detail.|Explore petrol and diesel cars from around the world, inside and out, in interactive 3D.|Explore cars|Brands|Models|Countries|Featured cars|Search brand or model…|All|All countries|No results found|Detailed models for this brand are coming soon.|Founded|Active|Defunct|models|Back
Sport|Classic|Economy|Luxury|SUV & Off-road|Sedan|Hatchback|Coupe|Wagon|SUV|Convertible|Pickup|Supercar|Petrol|Diesel
Overview|Engine|Performance|Dimensions|Interior|Exterior|Engine|Displacement|Aspiration|Naturally aspirated|Turbo|Twin-turbo|Supercharged|Cylinders|Power|Torque|Drivetrain|Front-wheel drive|Rear-wheel drive|All-wheel drive|Gearbox|Manual|Automatic|Dual-clutch|CVT|speed
0–100 km/h|Top speed|Weight|Consumption|Power to weight|Power per litre|Length|Width|Height|Wheelbase|Luggage|Seats|Center screen|None|Instrument cluster|Analog|Digital|Production|Category|Body type|Fuel|Country
Orbit|Front|Side|Rear|Driver|Rear seat|Engine|Paint|Auto-rotate|Drag to look around|Stylized 3D model generated from this car's body type and dimensions.|Figures are approximate and vary by market and version.|Language|All interface text changes instantly.|Choose a car|Add to favorites|Remove from favorites|You have no favorites yet.|present`,
  tr: `Ana Sayfa|Markalar|Arabalar|Karşılaştır|Favoriler|Ayarlar|Her motor. Her detay.|Dünyanın dört bir yanından benzinli ve dizel arabaları içten dışa etkileşimli 3D ile keşfet.|Arabaları keşfet|Marka|Model|Ülke|Öne çıkan arabalar|Marka veya model ara…|Tümü|Tüm ülkeler|Sonuç bulunamadı|Bu markanın detaylı modelleri yakında eklenecek.|Kuruluş|Aktif|Üretimi bitti|model|Geri
Spor|Klasik|Ekonomik|Lüks|SUV ve Arazi|Sedan|Hatchback|Coupe|Station Wagon|SUV|Cabrio|Pickup|Süper Araba|Benzinli|Dizel
Genel|Motor|Performans|Boyutlar|İç Mekân|Dış Tasarım|Motor|Silindir hacmi|Emiş tipi|Atmosferik|Turbo|Çift turbo|Kompresörlü|Silindir|Güç|Tork|Çekiş|Önden çekiş|Arkadan itiş|Dört çeker|Şanzıman|Manuel|Otomatik|Çift kavrama|CVT|ileri
0–100 km/s|Maksimum hız|Ağırlık|Tüketim|Güç/ağırlık|Litre başına güç|Uzunluk|Genişlik|Yükseklik|Dingil mesafesi|Bagaj|Koltuk|Orta ekran|Yok|Gösterge paneli|Analog|Dijital|Üretim|Kategori|Kasa tipi|Yakıt|Ülke
Serbest|Ön|Yan|Arka|Sürücü|Arka koltuk|Motor|Boya|Otomatik döndür|Bakmak için sürükle|Bu arabanın kasa tipi ve ölçülerinden üretilmiş stilize 3D model.|Değerler yaklaşıktır, pazara ve versiyona göre değişir.|Dil|Tüm arayüz yazıları anında değişir.|Araba seç|Favorilere ekle|Favorilerden çıkar|Henüz favorin yok.|günümüz`,
  de: `Start|Marken|Autos|Vergleichen|Favoriten|Einstellungen|Jeder Motor. Jedes Detail.|Entdecke Benzin- und Dieselautos aus aller Welt, innen und außen, in interaktivem 3D.|Autos entdecken|Marken|Modelle|Länder|Ausgewählte Autos|Marke oder Modell suchen…|Alle|Alle Länder|Keine Ergebnisse|Detaillierte Modelle dieser Marke folgen in Kürze.|Gegründet|Aktiv|Eingestellt|Modelle|Zurück
Sport|Klassiker|Sparsam|Luxus|SUV & Gelände|Limousine|Schrägheck|Coupé|Kombi|SUV|Cabrio|Pickup|Supersportwagen|Benzin|Diesel
Übersicht|Motor|Leistung|Abmessungen|Innenraum|Exterieur|Motor|Hubraum|Aufladung|Saugmotor|Turbo|Biturbo|Kompressor|Zylinder|Leistung|Drehmoment|Antrieb|Frontantrieb|Heckantrieb|Allradantrieb|Getriebe|Manuell|Automatik|Doppelkupplung|CVT|Gänge
0–100 km/h|Höchstgeschwindigkeit|Gewicht|Verbrauch|Leistungsgewicht|Literleistung|Länge|Breite|Höhe|Radstand|Kofferraum|Sitze|Zentraldisplay|Keines|Kombiinstrument|Analog|Digital|Produktion|Kategorie|Karosserie|Kraftstoff|Land
Frei|Vorne|Seite|Hinten|Fahrer|Rücksitz|Motor|Lack|Automatisch drehen|Zum Umsehen ziehen|Stilisiertes 3D-Modell, erzeugt aus Karosserieform und Maßen dieses Autos.|Werte sind ungefähr und variieren je nach Markt und Version.|Sprache|Alle Texte ändern sich sofort.|Auto wählen|Zu Favoriten|Aus Favoriten entfernen|Noch keine Favoriten.|heute`,
  fr: `Accueil|Marques|Voitures|Comparer|Favoris|Réglages|Chaque moteur. Chaque détail.|Explorez les voitures essence et diesel du monde entier, dedans comme dehors, en 3D interactive.|Explorer les voitures|Marques|Modèles|Pays|Voitures à la une|Rechercher une marque ou un modèle…|Tout|Tous les pays|Aucun résultat|Les modèles détaillés de cette marque arrivent bientôt.|Fondée en|Active|Disparue|modèles|Retour
Sport|Classique|Économique|Luxe|SUV & Tout-terrain|Berline|Compacte|Coupé|Break|SUV|Cabriolet|Pick-up|Supercar|Essence|Diesel
Aperçu|Moteur|Performances|Dimensions|Intérieur|Extérieur|Moteur|Cylindrée|Admission|Atmosphérique|Turbo|Biturbo|Compresseur|Cylindres|Puissance|Couple|Transmission|Traction|Propulsion|Quatre roues motrices|Boîte|Manuelle|Automatique|Double embrayage|CVT|rapports
0–100 km/h|Vitesse maximale|Poids|Consommation|Rapport poids/puissance|Puissance par litre|Longueur|Largeur|Hauteur|Empattement|Coffre|Places|Écran central|Aucun|Combiné d'instruments|Analogique|Numérique|Production|Catégorie|Carrosserie|Carburant|Pays
Libre|Avant|Côté|Arrière|Conducteur|Place arrière|Moteur|Peinture|Rotation auto|Faites glisser pour regarder|Modèle 3D stylisé généré à partir de la carrosserie et des dimensions de cette voiture.|Valeurs approximatives, variables selon le marché et la version.|Langue|Tous les textes changent instantanément.|Choisir une voiture|Ajouter aux favoris|Retirer des favoris|Aucun favori pour le moment.|aujourd'hui`,
  es: `Inicio|Marcas|Coches|Comparar|Favoritos|Ajustes|Cada motor. Cada detalle.|Explora coches de gasolina y diésel de todo el mundo, por dentro y por fuera, en 3D interactivo.|Explorar coches|Marcas|Modelos|Países|Coches destacados|Buscar marca o modelo…|Todos|Todos los países|Sin resultados|Los modelos detallados de esta marca llegarán pronto.|Fundada|Activa|Desaparecida|modelos|Atrás
Deportivo|Clásico|Económico|Lujo|SUV y Todoterreno|Sedán|Hatchback|Cupé|Familiar|SUV|Descapotable|Pickup|Superdeportivo|Gasolina|Diésel
Resumen|Motor|Prestaciones|Dimensiones|Interior|Exterior|Motor|Cilindrada|Aspiración|Atmosférico|Turbo|Biturbo|Sobrealimentado|Cilindros|Potencia|Par|Tracción|Delantera|Trasera|Total|Caja de cambios|Manual|Automática|Doble embrague|CVT|velocidades
0–100 km/h|Velocidad máxima|Peso|Consumo|Relación peso/potencia|Potencia por litro|Longitud|Anchura|Altura|Batalla|Maletero|Plazas|Pantalla central|Ninguna|Cuadro de instrumentos|Analógico|Digital|Producción|Categoría|Carrocería|Combustible|País
Libre|Frontal|Lateral|Trasera|Conductor|Asiento trasero|Motor|Pintura|Giro automático|Arrastra para mirar|Modelo 3D estilizado generado a partir de la carrocería y las medidas de este coche.|Valores aproximados, varían según mercado y versión.|Idioma|Todos los textos cambian al instante.|Elegir coche|Añadir a favoritos|Quitar de favoritos|Aún no tienes favoritos.|actualidad`,
  it: `Home|Marche|Auto|Confronta|Preferiti|Impostazioni|Ogni motore. Ogni dettaglio.|Esplora auto a benzina e diesel di tutto il mondo, dentro e fuori, in 3D interattivo.|Esplora le auto|Marche|Modelli|Paesi|Auto in evidenza|Cerca marca o modello…|Tutti|Tutti i paesi|Nessun risultato|I modelli dettagliati di questa marca arriveranno presto.|Fondata|Attiva|Cessata|modelli|Indietro
Sportiva|Classica|Economica|Lusso|SUV e Fuoristrada|Berlina|Hatchback|Coupé|Station wagon|SUV|Cabriolet|Pickup|Supercar|Benzina|Diesel
Panoramica|Motore|Prestazioni|Dimensioni|Interni|Esterni|Motore|Cilindrata|Alimentazione|Aspirato|Turbo|Biturbo|Compressore|Cilindri|Potenza|Coppia|Trazione|Anteriore|Posteriore|Integrale|Cambio|Manuale|Automatico|Doppia frizione|CVT|marce
0–100 km/h|Velocità massima|Peso|Consumo|Rapporto peso/potenza|Potenza per litro|Lunghezza|Larghezza|Altezza|Passo|Bagagliaio|Posti|Schermo centrale|Nessuno|Quadro strumenti|Analogico|Digitale|Produzione|Categoria|Carrozzeria|Carburante|Paese
Libera|Fronte|Lato|Retro|Guidatore|Sedile posteriore|Motore|Vernice|Rotazione automatica|Trascina per guardare|Modello 3D stilizzato generato da carrozzeria e misure di questa auto.|Valori approssimativi, variano per mercato e versione.|Lingua|Tutti i testi cambiano subito.|Scegli un'auto|Aggiungi ai preferiti|Rimuovi dai preferiti|Non hai ancora preferiti.|oggi`,
  pt: `Início|Marcas|Carros|Comparar|Favoritos|Definições|Cada motor. Cada detalhe.|Explore carros a gasolina e diesel do mundo inteiro, por dentro e por fora, em 3D interativo.|Explorar carros|Marcas|Modelos|Países|Carros em destaque|Pesquisar marca ou modelo…|Todos|Todos os países|Nenhum resultado|Os modelos detalhados desta marca chegarão em breve.|Fundada|Ativa|Extinta|modelos|Voltar
Esportivo|Clássico|Econômico|Luxo|SUV e Off-road|Sedã|Hatch|Cupê|Perua|SUV|Conversível|Picape|Superesportivo|Gasolina|Diesel
Visão geral|Motor|Desempenho|Dimensões|Interior|Exterior|Motor|Cilindrada|Aspiração|Aspirado|Turbo|Biturbo|Com compressor|Cilindros|Potência|Torque|Tração|Dianteira|Traseira|Integral|Câmbio|Manual|Automático|Dupla embreagem|CVT|marchas
0–100 km/h|Velocidade máxima|Peso|Consumo|Relação peso/potência|Potência por litro|Comprimento|Largura|Altura|Entre-eixos|Porta-malas|Lugares|Tela central|Nenhuma|Painel de instrumentos|Analógico|Digital|Produção|Categoria|Carroceria|Combustível|País
Livre|Frente|Lateral|Traseira|Motorista|Banco traseiro|Motor|Pintura|Giro automático|Arraste para olhar|Modelo 3D estilizado gerado a partir da carroceria e das medidas deste carro.|Valores aproximados, variam por mercado e versão.|Idioma|Todos os textos mudam na hora.|Escolher carro|Adicionar aos favoritos|Remover dos favoritos|Você ainda não tem favoritos.|atual`,
  ru: `Главная|Марки|Автомобили|Сравнение|Избранное|Настройки|Каждый мотор. Каждая деталь.|Изучайте бензиновые и дизельные автомобили со всего мира снаружи и внутри в интерактивном 3D.|Смотреть автомобили|Марки|Модели|Страны|Избранные модели|Поиск марки или модели…|Все|Все страны|Ничего не найдено|Подробные модели этой марки скоро появятся.|Основана|Активна|Закрыта|моделей|Назад
Спорт|Классика|Эконом|Люкс|SUV и внедорожники|Седан|Хэтчбек|Купе|Универсал|Кроссовер|Кабриолет|Пикап|Суперкар|Бензин|Дизель
Обзор|Двигатель|Динамика|Размеры|Салон|Экстерьер|Двигатель|Объём|Наддув|Атмосферный|Турбо|Битурбо|Компрессор|Цилиндры|Мощность|Крутящий момент|Привод|Передний|Задний|Полный|Коробка передач|Механика|Автомат|Робот с двумя сцеплениями|Вариатор|ступ.
0–100 км/ч|Макс. скорость|Масса|Расход|Мощность/масса|Литровая мощность|Длина|Ширина|Высота|Колёсная база|Багажник|Мест|Центральный экран|Нет|Приборная панель|Аналоговая|Цифровая|Выпуск|Категория|Тип кузова|Топливо|Страна
Обзор 360|Спереди|Сбоку|Сзади|Водитель|Задний ряд|Двигатель|Цвет|Автовращение|Потяните, чтобы осмотреться|Стилизованная 3D-модель, созданная по типу кузова и размерам этого автомобиля.|Значения приблизительны и зависят от рынка и версии.|Язык|Весь текст меняется мгновенно.|Выбрать автомобиль|В избранное|Убрать из избранного|В избранном пока пусто.|н.в.`,
  ar: `الرئيسية|العلامات|السيارات|مقارنة|المفضلة|الإعدادات|كل محرك. كل تفصيل.|استكشف سيارات البنزين والديزل من حول العالم من الداخل والخارج بتقنية ثلاثية الأبعاد تفاعلية.|استكشف السيارات|العلامات|الطرازات|الدول|سيارات مميزة|ابحث عن علامة أو طراز…|الكل|كل الدول|لا توجد نتائج|ستتوفر الطرازات التفصيلية لهذه العلامة قريبًا.|التأسيس|نشطة|متوقفة|طراز|رجوع
رياضية|كلاسيكية|اقتصادية|فاخرة|دفع رباعي|سيدان|هاتشباك|كوبيه|ستيشن|SUV|مكشوفة|بيك أب|سوبر كار|بنزين|ديزل
نظرة عامة|المحرك|الأداء|الأبعاد|المقصورة|التصميم الخارجي|المحرك|سعة المحرك|نظام السحب|تنفس طبيعي|تيربو|تيربو مزدوج|شاحن فائق|الأسطوانات|القوة|عزم الدوران|نظام الدفع|دفع أمامي|دفع خلفي|دفع كلي|ناقل الحركة|يدوي|أوتوماتيك|قابض مزدوج|CVT|سرعات
0–100 كم/س|السرعة القصوى|الوزن|الاستهلاك|القوة إلى الوزن|القوة لكل لتر|الطول|العرض|الارتفاع|قاعدة العجلات|الصندوق|المقاعد|الشاشة الوسطى|لا يوجد|لوحة العدادات|تناظرية|رقمية|الإنتاج|الفئة|نوع الهيكل|الوقود|الدولة
حر|أمام|جانب|خلف|السائق|المقعد الخلفي|المحرك|الطلاء|دوران تلقائي|اسحب للنظر حولك|نموذج ثلاثي الأبعاد منمق مولد من نوع هيكل هذه السيارة وأبعادها.|القيم تقريبية وتختلف حسب السوق والإصدار.|اللغة|تتغير جميع النصوص فورًا.|اختر سيارة|أضف إلى المفضلة|أزل من المفضلة|لا توجد مفضلات بعد.|حتى الآن`,
  zh: `首页|品牌|汽车|对比|收藏|设置|每台引擎，每个细节。|以交互式 3D 从内到外探索全球汽油与柴油汽车。|探索汽车|品牌|车型|国家|精选车型|搜索品牌或车型…|全部|所有国家|未找到结果|该品牌的详细车型即将上线。|创立|在营|已停产|款车型|返回
运动|经典|经济|豪华|SUV与越野|轿车|掀背车|轿跑|旅行车|SUV|敞篷车|皮卡|超级跑车|汽油|柴油
概览|发动机|性能|尺寸|内饰|外观|发动机|排量|进气方式|自然吸气|涡轮增压|双涡轮|机械增压|气缸数|功率|扭矩|驱动方式|前驱|后驱|四驱|变速箱|手动|自动|双离合|CVT|挡
0–100 km/h|最高车速|重量|油耗|功重比|升功率|车长|车宽|车高|轴距|行李厢|座位数|中控屏|无|仪表盘|机械|数字|生产年份|类别|车身类型|燃料|国家
自由|正面|侧面|后方|驾驶位|后排|发动机|车漆|自动旋转|拖动以环视|根据该车车身类型和尺寸生成的风格化 3D 模型。|数据为近似值，因市场和版本而异。|语言|所有界面文字立即切换。|选择汽车|加入收藏|取消收藏|暂无收藏。|至今`,
  ja: `ホーム|ブランド|車種|比較|お気に入り|設定|すべてのエンジン、すべての細部を。|世界のガソリン車とディーゼル車を、内装も外装もインタラクティブな3Dで。|車を探す|ブランド|モデル|国|注目の車|ブランドやモデルを検索…|すべて|すべての国|結果がありません|このブランドの詳細モデルは近日追加予定です。|創業|現行|消滅|モデル|戻る
スポーツ|クラシック|エコノミー|ラグジュアリー|SUV・オフロード|セダン|ハッチバック|クーペ|ワゴン|SUV|オープン|ピックアップ|スーパーカー|ガソリン|ディーゼル
概要|エンジン|性能|サイズ|内装|外装|エンジン|排気量|吸気方式|自然吸気|ターボ|ツインターボ|スーパーチャージャー|気筒数|最高出力|最大トルク|駆動方式|前輪駆動|後輪駆動|四輪駆動|トランスミッション|マニュアル|オートマチック|デュアルクラッチ|CVT|速
0–100 km/h|最高速度|車両重量|燃費|パワーウェイトレシオ|リッター出力|全長|全幅|全高|ホイールベース|荷室|乗車定員|センター画面|なし|メーター|アナログ|デジタル|生産年|カテゴリー|ボディタイプ|燃料|国
自由視点|前|横|後|運転席|後席|エンジン|塗装|自動回転|ドラッグして見回す|この車のボディタイプと寸法から生成したスタイライズ3Dモデルです。|数値は概算で、市場やグレードにより異なります。|言語|すべての表示がすぐに切り替わります。|車を選択|お気に入りに追加|お気に入りから削除|お気に入りはまだありません。|現在`,
};

export const LANGUAGES = [
  ['en', 'English'], ['tr', 'Türkçe'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'],
  ['pt', 'Português'], ['ru', 'Русский'], ['ar', 'العربية'], ['zh', '中文'], ['ja', '日本語'],
];

export const DICTS = Object.fromEntries(Object.entries(PACKS).map(([lang, text]) => {
  const values = text.split(/[|\n]/);
  if (values.length !== KEYS.length) throw new Error(`i18n ${lang}: ${values.length}/${KEYS.length}`);
  return [lang, Object.fromEntries(KEYS.map((key, i) => [key, values[i]]))];
}));

export function detectLanguage() {
  try {
    const saved = localStorage.getItem('vexa.lang');
    if (saved && DICTS[saved]) return saved;
  } catch {}
  const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return DICTS[browser] ? browser : 'en';
}

export function countryName(code, lang) {
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code); } catch { return code; }
}
