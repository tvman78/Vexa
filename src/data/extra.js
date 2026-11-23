// Motorcycle guides, FAQ and interface text added in Vexa 1.1, in all 11 languages.
const UI_KEYS = 'motorcycles help updates currentVersion latestVersion checkUpdates checking upToDate updateAvailable downloadingUpdate restartNow downloadUpdate whatsNew updErr_network updErr_norelease updErr_corrupt updErr_other faq about madeBy madeByText allEras unknownYear loadMore openWiki genericNote motoNote tier_all tier_economy tier_mid tier_premium tier_exotic tier_other'.split(' ');

const UI = {
  en: `Motorcycles|Help|Updates|Installed version|Latest version|Check for updates|Checking…|Vexa is up to date|A new version is available|Downloading update|Restart and update|Download new version|What's new|Could not reach GitHub. Check your internet connection.|No published version found yet.|The download was damaged and will be retried.|The update could not be completed.|Frequently asked questions|About|Made by|Vexa was created by Tv Man.|All eras|Year unknown|Show more|Open source page|General guide: this model's exact engine and gearbox are not recorded, so common faults and main parts are shown.|General motorcycle guide. Exact parts vary by model and year.|All|Economy|Mid-range|Premium|Exotic|Other`,
  tr: `Motosikletler|Yardım|Güncellemeler|Yüklü sürüm|En son sürüm|Güncellemeleri denetle|Denetleniyor…|Vexa güncel|Yeni sürüm hazır|Güncelleme indiriliyor|Yeniden başlat ve güncelle|Yeni sürümü indir|Yenilikler|GitHub'a bağlanılamadı. İnternet bağlantını kontrol et.|Henüz yayınlanmış sürüm bulunamadı.|İndirilen dosya bozuk çıktı, tekrar denenecek.|Güncelleme tamamlanamadı.|Sık sorulan sorular|Hakkında|Yapımcı|Vexa, Tv Man tarafından yapıldı.|Tüm dönemler|Yılı bilinmiyor|Daha fazla göster|Kaynak sayfayı aç|Genel rehber: bu modelin kesin motor ve şanzıman bilgisi kayıtlı değil, bu yüzden yaygın arızalar ve ana parçalar gösteriliyor.|Genel motosiklet rehberi. Kesin parçalar modele ve yıla göre değişir.|Tümü|Ekonomik|Orta segment|Premium|Egzotik|Diğer`,
  de: `Motorräder|Hilfe|Updates|Installierte Version|Neueste Version|Nach Updates suchen|Wird geprüft…|Vexa ist aktuell|Neue Version verfügbar|Update wird geladen|Neu starten und aktualisieren|Neue Version laden|Neuigkeiten|GitHub nicht erreichbar. Prüfe deine Internetverbindung.|Noch keine Version veröffentlicht.|Der Download war beschädigt und wird wiederholt.|Das Update konnte nicht abgeschlossen werden.|Häufige Fragen|Über|Erstellt von|Vexa wurde von Tv Man erstellt.|Alle Epochen|Jahr unbekannt|Mehr anzeigen|Quellseite öffnen|Allgemeiner Ratgeber: Motor und Getriebe dieses Modells sind nicht erfasst, daher werden häufige Defekte und Hauptteile gezeigt.|Allgemeiner Motorrad-Ratgeber. Genaue Teile variieren je nach Modell und Jahr.|Alle|Günstig|Mittelklasse|Premium|Exotisch|Andere`,
  fr: `Motos|Aide|Mises à jour|Version installée|Dernière version|Rechercher des mises à jour|Vérification…|Vexa est à jour|Nouvelle version disponible|Téléchargement de la mise à jour|Redémarrer et mettre à jour|Télécharger la nouvelle version|Nouveautés|Impossible de joindre GitHub. Vérifiez votre connexion.|Aucune version publiée pour le moment.|Le téléchargement est endommagé et sera relancé.|La mise à jour n'a pas pu aboutir.|Questions fréquentes|À propos|Créé par|Vexa a été créé par Tv Man.|Toutes les époques|Année inconnue|Afficher plus|Ouvrir la page source|Guide général : le moteur et la boîte exacts de ce modèle ne sont pas renseignés, les pannes courantes et pièces principales sont affichées.|Guide moto général. Les pièces exactes varient selon le modèle et l'année.|Toutes|Économique|Milieu de gamme|Premium|Exotique|Autres`,
  es: `Motos|Ayuda|Actualizaciones|Versión instalada|Última versión|Buscar actualizaciones|Comprobando…|Vexa está actualizado|Nueva versión disponible|Descargando actualización|Reiniciar y actualizar|Descargar nueva versión|Novedades|No se pudo conectar con GitHub. Revisa tu conexión.|Aún no hay versiones publicadas.|La descarga está dañada y se reintentará.|No se pudo completar la actualización.|Preguntas frecuentes|Acerca de|Creado por|Vexa fue creado por Tv Man.|Todas las épocas|Año desconocido|Mostrar más|Abrir página de origen|Guía general: el motor y la caja exactos de este modelo no están registrados, así que se muestran averías comunes y piezas principales.|Guía general de motos. Las piezas exactas varían según modelo y año.|Todas|Económica|Gama media|Premium|Exótica|Otras`,
  it: `Moto|Aiuto|Aggiornamenti|Versione installata|Ultima versione|Controlla aggiornamenti|Controllo…|Vexa è aggiornato|Nuova versione disponibile|Download aggiornamento|Riavvia e aggiorna|Scarica nuova versione|Novità|Impossibile raggiungere GitHub. Controlla la connessione.|Nessuna versione pubblicata.|Il download è danneggiato e verrà ripetuto.|Impossibile completare l'aggiornamento.|Domande frequenti|Informazioni|Creato da|Vexa è stato creato da Tv Man.|Tutte le epoche|Anno sconosciuto|Mostra altro|Apri pagina sorgente|Guida generale: motore e cambio esatti di questo modello non sono registrati, quindi sono mostrati guasti comuni e componenti principali.|Guida generale per moto. I componenti esatti variano per modello e anno.|Tutte|Economica|Fascia media|Premium|Esotica|Altre`,
  pt: `Motos|Ajuda|Atualizações|Versão instalada|Versão mais recente|Verificar atualizações|Verificando…|O Vexa está atualizado|Nova versão disponível|Baixando atualização|Reiniciar e atualizar|Baixar nova versão|Novidades|Não foi possível acessar o GitHub. Verifique sua conexão.|Ainda não há versão publicada.|O download foi danificado e será repetido.|Não foi possível concluir a atualização.|Perguntas frequentes|Sobre|Criado por|O Vexa foi criado por Tv Man.|Todas as épocas|Ano desconhecido|Mostrar mais|Abrir página de origem|Guia geral: o motor e o câmbio exatos deste modelo não estão registrados, então são mostrados defeitos comuns e peças principais.|Guia geral de motos. As peças exatas variam por modelo e ano.|Todas|Econômica|Intermediária|Premium|Exótica|Outras`,
  ru: `Мотоциклы|Помощь|Обновления|Установленная версия|Последняя версия|Проверить обновления|Проверка…|Vexa обновлена|Доступна новая версия|Загрузка обновления|Перезапустить и обновить|Скачать новую версию|Что нового|Нет связи с GitHub. Проверьте интернет.|Опубликованных версий пока нет.|Загрузка повреждена и будет повторена.|Не удалось завершить обновление.|Частые вопросы|О приложении|Создатель|Vexa создал Tv Man.|Все эпохи|Год неизвестен|Показать ещё|Открыть источник|Общее руководство: точный двигатель и коробка этой модели не указаны, поэтому показаны типичные неисправности и основные детали.|Общее руководство по мотоциклам. Точные детали зависят от модели и года.|Все|Эконом|Средний класс|Премиум|Эксклюзив|Другие`,
  ar: `الدراجات النارية|المساعدة|التحديثات|الإصدار المثبت|أحدث إصدار|التحقق من التحديثات|جارٍ التحقق…|Vexa محدّث|يتوفر إصدار جديد|جارٍ تنزيل التحديث|إعادة التشغيل والتحديث|تنزيل الإصدار الجديد|الجديد|تعذر الوصول إلى GitHub. تحقق من اتصالك بالإنترنت.|لا يوجد إصدار منشور بعد.|الملف الذي تم تنزيله تالف وستُعاد المحاولة.|تعذر إكمال التحديث.|الأسئلة الشائعة|حول التطبيق|من صنع|أنشأ Tv Man تطبيق Vexa.|كل العصور|السنة غير معروفة|عرض المزيد|فتح صفحة المصدر|دليل عام: المحرك وناقل الحركة الدقيقان لهذا الطراز غير مسجلين، لذلك تُعرض الأعطال الشائعة والقطع الرئيسية.|دليل عام للدراجات النارية. تختلف القطع حسب الطراز والسنة.|الكل|اقتصادية|متوسطة|فاخرة|نادرة|أخرى`,
  zh: `摩托车|帮助|更新|已安装版本|最新版本|检查更新|正在检查…|Vexa 已是最新版本|有新版本可用|正在下载更新|重启并更新|下载新版本|更新内容|无法连接 GitHub，请检查网络。|暂无已发布版本。|下载文件已损坏，将重试。|更新未能完成。|常见问题|关于|制作者|Vexa 由 Tv Man 制作。|所有年代|年份未知|显示更多|打开来源页面|通用指南：该车型的具体发动机和变速箱未记录，因此显示常见故障和主要零部件。|摩托车通用指南。具体零件因车型和年份而异。|全部|经济型|中端|高端|稀有|其他`,
  ja: `バイク|ヘルプ|アップデート|インストール済みバージョン|最新バージョン|アップデートを確認|確認中…|Vexa は最新です|新しいバージョンがあります|アップデートをダウンロード中|再起動して更新|新バージョンをダウンロード|新機能|GitHub に接続できません。インターネット接続を確認してください。|公開済みのバージョンがまだありません。|ダウンロードが破損しました。再試行します。|アップデートを完了できませんでした。|よくある質問|このアプリについて|制作者|Vexa は Tv Man が制作しました。|全年代|年式不明|もっと見る|出典ページを開く|一般ガイド：このモデルの正確なエンジンと変速機は記録がないため、よくある故障と主要部品を表示しています。|バイクの一般ガイドです。正確な部品はモデルと年式で異なります。|すべて|エコノミー|ミドル|プレミアム|エキゾチック|その他`,
};

const MOTO_PROBLEM_RULES = [['chain', 'med'], ['fuelsys', 'med'], ['clutch', 'med'], ['brakes', 'high'], ['overheat', 'high'], ['charging', 'med'], ['fork', 'med'], ['valves', 'med'], ['tires', 'high'], ['oil', 'med']];

const MOTO_PROBLEMS = {
  en: `Chain and sprocket wear|Jerky drive, noise, loose or tight chain|Clean, lubricate and adjust the chain; replace chain and sprockets together
Carburetor or injection fault|Hard starting, stalling, uneven idle|Clean the carburetor or injectors, renew the fuel filter and read fault codes
Clutch wear|Slipping, burning smell, hard shifts|Adjust the cable or fluid; replace worn plates and springs
Brake wear|Soft lever, squeal, longer stopping distance|Replace pads and discs, bleed the brakes and renew the fluid
Engine overheating|High temperature, fan always on, coolant loss|Stop safely; check coolant, radiator, fan, thermostat and water pump
Battery or charging fault|Weak start, dim lights, battery goes flat|Test battery, stator and regulator; replace the failed part
Fork seal leak|Oil on fork legs, poor damping|Replace fork seals and oil; check tubes for damage
Valve clearance out of spec|Ticking noise, power loss, hard starting|Measure and adjust valve clearance at the service interval
Tire wear or damage|Poor grip, vibration, unstable steering|Check pressure and tread; replace damaged or worn tires
Engine oil leak|Oil spots, burning smell, falling level|Find the source; renew gaskets and seals and top up the oil`,
  tr: `Zincir ve dişli aşınması|Sarsıntılı sürüş, ses, gevşek veya sıkı zincir|Zinciri temizleyin, yağlayın ve ayarlayın; zincir ve dişlileri birlikte değiştirin
Karbüratör veya enjeksiyon arızası|Zor çalışma, stop etme, düzensiz rölanti|Karbüratörü veya enjektörleri temizleyin, yakıt filtresini yenileyin, arıza kodlarını okutun
Debriyaj aşınması|Kaçırma, yanık koku, zor vites geçişi|Teli veya hidroliği ayarlayın; aşınmış balata ve yayları değiştirin
Fren aşınması|Yumuşak manet, ciyaklama, uzayan fren mesafesi|Balata ve diskleri değiştirin, frenin havasını alın, hidroliği yenileyin
Motor hararet yapması|Yüksek sıcaklık, sürekli çalışan fan, antifriz kaybı|Güvenli şekilde durun; antifriz, radyatör, fan, termostat ve su pompasını kontrol edin
Akü veya şarj arızası|Zayıf marş, sönük far, akünün boşalması|Aküyü, statoru ve konjektörü test edin; arızalı parçayı değiştirin
Amortisör keçesi kaçağı|Maşalarda yağ, kötü sönümleme|Keçeleri ve maşa yağını değiştirin; boruları hasar için kontrol edin
Supap ayarının bozulması|Tıkırtı, güç kaybı, zor çalışma|Bakım aralığında supap boşluğunu ölçüp ayarlatın
Lastik aşınması veya hasarı|Zayıf yol tutuş, titreme, dengesiz direksiyon|Basınç ve diş derinliğini kontrol edin; hasarlı veya aşınmış lastiği değiştirin
Motor yağ kaçağı|Yağ lekesi, yanık koku, azalan seviye|Kaçağın yerini bulun; conta ve keçeleri yenileyin, yağı tamamlayın`,
  de: `Verschleiß von Kette und Ritzel|Ruckeln, Geräusche, lockere oder straffe Kette|Kette reinigen, schmieren und spannen; Kette und Ritzel gemeinsam ersetzen
Vergaser- oder Einspritzfehler|Schlechter Start, Absterben, unruhiger Leerlauf|Vergaser oder Düsen reinigen, Kraftstofffilter erneuern, Fehlercodes lesen
Kupplungsverschleiß|Rutschen, Brandgeruch, schweres Schalten|Zug oder Hydraulik einstellen; verschlissene Lamellen und Federn ersetzen
Bremsenverschleiß|Weicher Hebel, Quietschen, längerer Bremsweg|Beläge und Scheiben ersetzen, entlüften und Flüssigkeit erneuern
Motorüberhitzung|Hohe Temperatur, Lüfter läuft dauernd, Kühlmittelverlust|Sicher anhalten; Kühlmittel, Kühler, Lüfter, Thermostat und Wasserpumpe prüfen
Batterie- oder Ladefehler|Schwacher Start, dunkles Licht, leere Batterie|Batterie, Stator und Regler testen; defektes Teil ersetzen
Undichte Gabeldichtung|Öl an den Gabelholmen, schlechte Dämpfung|Dichtungen und Gabelöl erneuern; Rohre auf Schäden prüfen
Ventilspiel außerhalb der Toleranz|Tickern, Leistungsverlust, schlechter Start|Ventilspiel beim Service messen und einstellen
Reifenverschleiß oder -schaden|Wenig Grip, Vibration, instabile Lenkung|Druck und Profil prüfen; beschädigte oder abgefahrene Reifen ersetzen
Motorölleck|Ölflecken, Brandgeruch, sinkender Stand|Quelle finden; Dichtungen erneuern und Öl nachfüllen`,
  fr: `Usure de la chaîne et des pignons|Conduite saccadée, bruit, chaîne détendue ou trop tendue|Nettoyer, graisser et régler ; remplacer chaîne et pignons ensemble
Panne de carburateur ou d'injection|Démarrage difficile, calage, ralenti irrégulier|Nettoyer carburateur ou injecteurs, changer le filtre, lire les codes
Usure de l'embrayage|Patinage, odeur de brûlé, passages difficiles|Régler le câble ou l'hydraulique ; remplacer disques et ressorts usés
Usure des freins|Levier mou, grincement, freinage plus long|Remplacer plaquettes et disques, purger et renouveler le liquide
Surchauffe moteur|Température élevée, ventilateur permanent, perte de liquide|S'arrêter en sécurité ; contrôler liquide, radiateur, ventilateur, thermostat et pompe
Panne de batterie ou de charge|Démarrage faible, phare faible, batterie à plat|Tester batterie, stator et régulateur ; remplacer la pièce défaillante
Fuite de joints de fourche|Huile sur les fourreaux, mauvais amortissement|Remplacer joints et huile ; contrôler les tubes
Jeu aux soupapes incorrect|Claquement, perte de puissance, démarrage difficile|Mesurer et régler le jeu lors de l'entretien
Usure ou dommage des pneus|Adhérence faible, vibrations, direction instable|Vérifier pression et sculptures ; remplacer les pneus usés ou abîmés
Fuite d'huile moteur|Taches d'huile, odeur de brûlé, baisse du niveau|Trouver l'origine ; refaire joints et compléter l'huile`,
  es: `Desgaste de cadena y piñones|Marcha a tirones, ruido, cadena floja o tensa|Limpiar, engrasar y ajustar; sustituir cadena y piñones a la vez
Avería de carburador o inyección|Arranque difícil, calado, ralentí irregular|Limpiar carburador o inyectores, cambiar filtro y leer códigos
Desgaste del embrague|Patinaje, olor a quemado, cambios duros|Ajustar cable o hidráulico; sustituir discos y muelles gastados
Desgaste de frenos|Maneta blanda, chirrido, mayor frenada|Sustituir pastillas y discos, purgar y renovar el líquido
Sobrecalentamiento del motor|Temperatura alta, ventilador constante, pérdida de refrigerante|Detenerse con seguridad; revisar refrigerante, radiador, ventilador, termostato y bomba
Avería de batería o carga|Arranque débil, luz baja, batería descargada|Probar batería, estátor y regulador; sustituir la pieza averiada
Fuga en retenes de horquilla|Aceite en las barras, mala amortiguación|Sustituir retenes y aceite; revisar las barras
Holgura de válvulas incorrecta|Golpeteo, pérdida de potencia, arranque difícil|Medir y ajustar la holgura en el mantenimiento
Desgaste o daño de neumáticos|Poco agarre, vibración, dirección inestable|Revisar presión y dibujo; sustituir neumáticos gastados o dañados
Fuga de aceite del motor|Manchas, olor a quemado, bajada de nivel|Localizar el origen; renovar juntas y rellenar aceite`,
  it: `Usura catena e pignoni|Guida a strappi, rumore, catena lenta o tesa|Pulire, lubrificare e regolare; sostituire catena e pignoni insieme
Guasto carburatore o iniezione|Avviamento difficile, spegnimenti, minimo irregolare|Pulire carburatore o iniettori, cambiare filtro e leggere i codici
Usura frizione|Slittamento, odore di bruciato, cambiate dure|Regolare cavo o idraulica; sostituire dischi e molle usurati
Usura freni|Leva morbida, stridio, frenata più lunga|Sostituire pastiglie e dischi, spurgare e rinnovare il liquido
Surriscaldamento motore|Temperatura alta, ventola sempre attiva, perdita di refrigerante|Fermarsi in sicurezza; controllare refrigerante, radiatore, ventola, termostato e pompa
Guasto batteria o ricarica|Avviamento debole, luce fioca, batteria scarica|Testare batteria, statore e regolatore; sostituire il pezzo guasto
Perdita paraolio forcella|Olio sugli steli, scarso smorzamento|Sostituire paraolio e olio; controllare gli steli
Gioco valvole fuori tolleranza|Ticchettio, perdita di potenza, avviamento difficile|Misurare e regolare il gioco al tagliando
Usura o danno pneumatici|Poca aderenza, vibrazioni, sterzo instabile|Controllare pressione e battistrada; sostituire gomme usurate o danneggiate
Perdita olio motore|Macchie, odore di bruciato, livello in calo|Trovare l'origine; rinnovare guarnizioni e rabboccare l'olio`,
  pt: `Desgaste da corrente e pinhões|Rodar aos trancos, ruído, corrente frouxa ou tensa|Limpar, lubrificar e ajustar; trocar corrente e pinhões juntos
Falha do carburador ou injeção|Partida difícil, motor morrendo, marcha lenta irregular|Limpar carburador ou injetores, trocar o filtro e ler códigos
Desgaste da embreagem|Patinação, cheiro de queimado, trocas duras|Ajustar cabo ou hidráulico; trocar discos e molas gastos
Desgaste dos freios|Manete mole, chiado, frenagem mais longa|Trocar pastilhas e discos, sangrar e renovar o fluido
Superaquecimento do motor|Temperatura alta, ventoinha sempre ligada, perda de líquido|Parar com segurança; verificar líquido, radiador, ventoinha, termostato e bomba
Falha da bateria ou carga|Partida fraca, farol fraco, bateria descarregada|Testar bateria, estator e regulador; trocar a peça defeituosa
Vazamento nos retentores da bengala|Óleo nas bengalas, amortecimento ruim|Trocar retentores e óleo; verificar os tubos
Folga de válvulas fora do padrão|Tique-taque, perda de potência, partida difícil|Medir e ajustar a folga na revisão
Desgaste ou dano dos pneus|Pouca aderência, vibração, direção instável|Verificar pressão e sulcos; trocar pneus gastos ou danificados
Vazamento de óleo do motor|Manchas, cheiro de queimado, nível baixando|Localizar a origem; renovar juntas e completar o óleo`,
  ru: `Износ цепи и звёзд|Рывки, шум, слабая или перетянутая цепь|Очистить, смазать и отрегулировать; менять цепь и звёзды вместе
Неисправность карбюратора или впрыска|Трудный пуск, глохнет, неровный холостой ход|Очистить карбюратор или форсунки, заменить фильтр, считать ошибки
Износ сцепления|Пробуксовка, запах гари, тугое переключение|Отрегулировать трос или гидравлику; заменить диски и пружины
Износ тормозов|Мягкий рычаг, скрип, длинный тормозной путь|Заменить колодки и диски, прокачать и обновить жидкость
Перегрев двигателя|Высокая температура, постоянный вентилятор, потеря антифриза|Безопасно остановиться; проверить антифриз, радиатор, вентилятор, термостат и помпу
Неисправность аккумулятора или зарядки|Слабый пуск, тусклый свет, разряд аккумулятора|Проверить аккумулятор, статор и регулятор; заменить неисправное
Течь сальников вилки|Масло на перьях, плохое демпфирование|Заменить сальники и масло; проверить трубы
Неверный зазор клапанов|Цокот, потеря мощности, трудный пуск|Измерить и отрегулировать зазоры на ТО
Износ или повреждение шин|Слабое сцепление, вибрация, неустойчивый руль|Проверить давление и протектор; заменить изношенные шины
Утечка моторного масла|Пятна масла, запах гари, падение уровня|Найти источник; заменить прокладки и долить масло`,
  ar: `تآكل الجنزير والتروس|قيادة متقطعة، ضجيج، جنزير مرتخٍ أو مشدود|نظف الجنزير وشحمه واضبطه، واستبدل الجنزير والتروس معًا
عطل الكاربراتير أو الحقن|صعوبة التشغيل، توقف المحرك، سكون غير منتظم|نظف الكاربراتير أو البخاخات، وجدد فلتر الوقود، واقرأ رموز الأعطال
تآكل القابض|انزلاق، رائحة احتراق، صعوبة التعشيق|اضبط السلك أو الهيدروليك واستبدل الأقراص والنوابض البالية
تآكل المكابح|ذراع لينة، صرير، زيادة مسافة التوقف|استبدل الفحمات والأقراص، وفرّغ الهواء، وجدد السائل
ارتفاع حرارة المحرك|حرارة عالية، مروحة تعمل دائمًا، فقدان سائل التبريد|توقف بأمان وافحص السائل والرديتر والمروحة والثرموستات والمضخة
عطل البطارية أو الشحن|تشغيل ضعيف، ضوء خافت، نفاد البطارية|افحص البطارية والجزء الثابت والمنظم واستبدل القطعة المعطلة
تسرب موانع الشوكة|زيت على أنابيب الشوكة، تخميد ضعيف|استبدل الموانع والزيت وافحص الأنابيب
خلوص الصمامات غير مضبوط|طقطقة، فقدان القوة، صعوبة التشغيل|قِس الخلوص واضبطه عند الصيانة
تآكل الإطارات أو تلفها|تماسك ضعيف، اهتزاز، توجيه غير مستقر|افحص الضغط والنقشة واستبدل الإطارات البالية أو التالفة
تسرب زيت المحرك|بقع زيت، رائحة احتراق، انخفاض المستوى|حدد المصدر وجدد الحشوات والموانع وأكمل الزيت`,
  zh: `链条和链轮磨损|行驶顿挫、异响、链条过松或过紧|清洁、润滑并调整链条，链条和链轮一起更换
化油器或喷射故障|启动困难、熄火、怠速不稳|清洗化油器或喷油嘴，更换燃油滤清器并读取故障码
离合器磨损|打滑、焦味、换挡困难|调整拉线或液压，更换磨损摩擦片和弹簧
制动磨损|手柄发软、尖叫、制动距离变长|更换刹车片和刹车盘，排气并更换制动液
发动机过热|温度过高、风扇常转、冷却液减少|安全停车，检查冷却液、散热器、风扇、节温器和水泵
蓄电池或充电故障|启动无力、灯光昏暗、电池亏电|检测蓄电池、定子和整流器，更换故障件
前叉油封漏油|前叉管有油、减振变差|更换油封和前叉油，检查叉管
气门间隙异常|哒哒异响、动力下降、启动困难|保养时测量并调整气门间隙
轮胎磨损或损伤|抓地力差、抖动、转向不稳|检查胎压和花纹，更换磨损或损坏的轮胎
发动机漏油|油渍、焦味、液位下降|查明来源，更换垫片和油封并补充机油`,
  ja: `チェーン・スプロケット摩耗|走行のギクシャク、異音、チェーンの緩みや張り過ぎ|清掃、注油、調整し、チェーンとスプロケットは同時に交換
キャブレター・インジェクション不調|始動困難、エンスト、アイドリング不安定|キャブやインジェクターを清掃し、燃料フィルター交換と故障コード確認
クラッチ摩耗|滑り、焦げ臭さ、シフト不良|ワイヤーや油圧を調整し、摩耗したプレートとスプリングを交換
ブレーキ摩耗|レバーが柔らかい、鳴き、制動距離の増加|パッドとディスクを交換し、エア抜きと液交換を行う
オーバーヒート|高水温、ファンが回り続ける、冷却水減少|安全に停車し、冷却水、ラジエーター、ファン、サーモスタット、ポンプを点検
バッテリー・充電系の故障|始動が弱い、ライトが暗い、バッテリー上がり|バッテリー、ステーター、レギュレーターを点検し不良部品を交換
フォークシール漏れ|フォークへの油付着、減衰不足|シールとフォークオイルを交換し、インナーチューブを点検
バルブクリアランス不良|カチカチ音、出力低下、始動困難|点検時にクリアランスを測定し調整
タイヤの摩耗・損傷|グリップ低下、振動、ハンドルの不安定|空気圧と溝を確認し、摩耗や損傷したタイヤを交換
エンジンオイル漏れ|油染み、焦げ臭さ、オイル量低下|漏れ箇所を特定し、ガスケットとシールを交換してオイルを補充`,
};

const MOTO_PART_GROUPS = [['engine', 8], ['fuel', 4], ['cooling', 2], ['exhaust', 2], ['drivetrain', 5], ['brakes', 4], ['suspension', 6], ['electrical', 6], ['body', 4], ['interior', 4]];

const MOTO_PARTS = {
  en: `Cylinder|Piston|Crankshaft|Valves|Camshaft|Oil filter|Air filter|Spark plug
Fuel tank|Fuel pump|Carburetor/injector|Throttle body
Radiator|Oil cooler
Exhaust header|Muffler
Clutch|Gearbox|Chain/belt|Sprockets|Shift lever
Brake discs|Brake pads|Calipers|Brake lever and pedal
Front fork|Rear shock|Swingarm|Steering head bearings|Wheels|Tires
Battery|Stator|Regulator/rectifier|Starter motor|Headlight|Instrument panel
Frame|Fairing|Fenders|Mirrors
Seat|Handlebar|Footpegs|Grips`,
  tr: `Silindir|Piston|Krank mili|Supaplar|Eksantrik mili|Yağ filtresi|Hava filtresi|Buji
Yakıt deposu|Yakıt pompası|Karbüratör/enjektör|Gaz kelebeği
Radyatör|Yağ soğutucu
Egzoz manifoldu|Egzoz susturucu
Debriyaj|Şanzıman|Zincir/kayış|Dişliler|Vites kolu
Fren diskleri|Fren balataları|Kaliperler|Fren maneti ve pedalı
Ön maşa|Arka amortisör|Salınım kolu|Furş rulmanları|Jantlar|Lastikler
Akü|Stator|Konjektör/regülatör|Marş motoru|Far|Gösterge paneli
Şasi|Grenaj|Çamurluklar|Aynalar
Sele|Gidon|Basamaklar|Elcikler`,
  de: `Zylinder|Kolben|Kurbelwelle|Ventile|Nockenwelle|Ölfilter|Luftfilter|Zündkerze
Kraftstofftank|Kraftstoffpumpe|Vergaser/Einspritzdüse|Drosselklappe
Kühler|Ölkühler
Krümmer|Schalldämpfer
Kupplung|Getriebe|Kette/Riemen|Ritzel|Schalthebel
Bremsscheiben|Bremsbeläge|Bremssättel|Bremshebel und -pedal
Vorderradgabel|Federbein|Schwinge|Lenkkopflager|Räder|Reifen
Batterie|Stator|Regler/Gleichrichter|Anlasser|Scheinwerfer|Instrumente
Rahmen|Verkleidung|Schutzbleche|Spiegel
Sitzbank|Lenker|Fußrasten|Griffe`,
  fr: `Cylindre|Piston|Vilebrequin|Soupapes|Arbre à cames|Filtre à huile|Filtre à air|Bougie
Réservoir|Pompe à carburant|Carburateur/injecteur|Boîtier papillon
Radiateur|Radiateur d'huile
Collecteur|Silencieux
Embrayage|Boîte de vitesses|Chaîne/courroie|Pignons|Sélecteur
Disques de frein|Plaquettes|Étriers|Levier et pédale de frein
Fourche|Amortisseur arrière|Bras oscillant|Roulements de direction|Roues|Pneus
Batterie|Stator|Régulateur/redresseur|Démarreur|Phare|Tableau de bord
Cadre|Carénage|Garde-boue|Rétroviseurs
Selle|Guidon|Repose-pieds|Poignées`,
  es: `Cilindro|Pistón|Cigüeñal|Válvulas|Árbol de levas|Filtro de aceite|Filtro de aire|Bujía
Depósito|Bomba de combustible|Carburador/inyector|Cuerpo de acelerador
Radiador|Enfriador de aceite
Colector de escape|Silenciador
Embrague|Caja de cambios|Cadena/correa|Piñones|Palanca de cambios
Discos de freno|Pastillas|Pinzas|Maneta y pedal de freno
Horquilla|Amortiguador trasero|Basculante|Rodamientos de dirección|Ruedas|Neumáticos
Batería|Estátor|Regulador/rectificador|Motor de arranque|Faro|Cuadro de instrumentos
Chasis|Carenado|Guardabarros|Retrovisores
Asiento|Manillar|Estriberas|Puños`,
  it: `Cilindro|Pistone|Albero motore|Valvole|Albero a camme|Filtro olio|Filtro aria|Candela
Serbatoio|Pompa carburante|Carburatore/iniettore|Corpo farfallato
Radiatore|Radiatore olio
Collettore|Silenziatore
Frizione|Cambio|Catena/cinghia|Pignoni|Leva del cambio
Dischi freno|Pastiglie|Pinze|Leva e pedale freno
Forcella|Ammortizzatore posteriore|Forcellone|Cuscinetti di sterzo|Ruote|Pneumatici
Batteria|Statore|Regolatore/raddrizzatore|Motorino di avviamento|Faro|Strumentazione
Telaio|Carena|Parafanghi|Specchietti
Sella|Manubrio|Pedane|Manopole`,
  pt: `Cilindro|Pistão|Virabrequim|Válvulas|Comando de válvulas|Filtro de óleo|Filtro de ar|Vela
Tanque|Bomba de combustível|Carburador/injetor|Corpo de borboleta
Radiador|Radiador de óleo
Coletor de escape|Silencioso
Embreagem|Câmbio|Corrente/correia|Pinhões|Pedal de câmbio
Discos de freio|Pastilhas|Pinças|Manete e pedal de freio
Bengala|Amortecedor traseiro|Balança|Rolamentos de direção|Rodas|Pneus
Bateria|Estator|Regulador/retificador|Motor de partida|Farol|Painel
Quadro|Carenagem|Paralamas|Retrovisores
Banco|Guidão|Pedaleiras|Manoplas`,
  ru: `Цилиндр|Поршень|Коленвал|Клапаны|Распредвал|Масляный фильтр|Воздушный фильтр|Свеча зажигания
Топливный бак|Топливный насос|Карбюратор/форсунка|Дроссель
Радиатор|Масляный радиатор
Выпускной коллектор|Глушитель
Сцепление|Коробка передач|Цепь/ремень|Звёзды|Рычаг переключения
Тормозные диски|Тормозные колодки|Суппорты|Рычаг и педаль тормоза
Передняя вилка|Задний амортизатор|Маятник|Подшипники рулевой|Колёса|Шины
Аккумулятор|Статор|Регулятор-выпрямитель|Стартер|Фара|Приборная панель
Рама|Обтекатель|Крылья|Зеркала
Сиденье|Руль|Подножки|Грипсы`,
  ar: `الأسطوانة|المكبس|العمود المرفقي|الصمامات|عمود الكامات|فلتر الزيت|فلتر الهواء|شمعة الإشعال
خزان الوقود|مضخة الوقود|الكاربراتير/البخاخ|جسم الخانق
الرديتر|مبرد الزيت
مجمع العادم|كاتم الصوت
القابض|ناقل الحركة|الجنزير/السير|التروس|ذراع التبديل
أقراص المكابح|فحمات المكابح|الفكوك|ذراع ودواسة المكابح
الشوكة الأمامية|المساعد الخلفي|الذراع المتأرجح|رولمان التوجيه|العجلات|الإطارات
البطارية|الجزء الثابت|المنظم/المقوم|بادئ الحركة|المصباح الأمامي|لوحة العدادات
الهيكل|الغطاء الانسيابي|الرفارف|المرايا
المقعد|المقود|مساند القدم|المقابض`,
  zh: `气缸|活塞|曲轴|气门|凸轮轴|机油滤清器|空气滤清器|火花塞
油箱|燃油泵|化油器/喷油嘴|节气门体
散热器|机油冷却器
排气歧管|消声器
离合器|变速箱|链条/皮带|链轮|换挡杆
刹车盘|刹车片|卡钳|刹车手柄和踏板
前叉|后减振器|后摇臂|转向轴承|车轮|轮胎
蓄电池|定子|整流调压器|起动机|前大灯|仪表板
车架|整流罩|挡泥板|后视镜
座垫|车把|脚踏|握把`,
  ja: `シリンダー|ピストン|クランクシャフト|バルブ|カムシャフト|オイルフィルター|エアフィルター|スパークプラグ
燃料タンク|燃料ポンプ|キャブレター/インジェクター|スロットルボディ
ラジエーター|オイルクーラー
エキゾーストパイプ|マフラー
クラッチ|トランスミッション|チェーン/ベルト|スプロケット|シフトレバー
ブレーキディスク|ブレーキパッド|キャリパー|ブレーキレバーとペダル
フロントフォーク|リアショック|スイングアーム|ステムベアリング|ホイール|タイヤ
バッテリー|ステーター|レギュレーター|スターター|ヘッドライト|メーター
フレーム|カウル|フェンダー|ミラー
シート|ハンドル|ステップ|グリップ`,
};

const FAQ = {
  en: `What is Vexa?|A reference app for petrol and diesel cars and motorcycles, with models from all eras, photos, specifications, common faults and parts.
Why are there no electric vehicles?|Vexa is dedicated to combustion engines. Electric and hybrid models are filtered out; if you spot one, it will be removed in an update.
How do I update the app?|Open Settings and press Check for updates. Windows downloads and installs the update itself. Android, iPhone and Mac open the new version's download.
Are the specifications exact?|No. Figures are approximate and vary by market, year and version. Check the manufacturer's documents before buying parts.
Where do the photos come from?|Photos come from Wikimedia Commons under free licenses. The author and license are shown on detailed car pages.
Do I need the internet?|Detailed cars work offline. Photos of the full catalog and update checks need an internet connection.
Can I repair my vehicle using these guides?|They help you understand a fault. For brakes, steering, fuel or safety systems, always use a qualified mechanic.
How do I change the language?|Open Settings and choose a language. All interface text changes instantly.
Who made Vexa?|Vexa was created by Tv Man.`,
  tr: `Vexa nedir?|Benzinli ve dizel arabalar ile motosikletler için tüm dönemlerden modelleri, fotoğrafları, özellikleri, yaygın arızaları ve parçaları içeren bir başvuru uygulamasıdır.
Neden elektrikli araç yok?|Vexa içten yanmalı motorlara ayrılmıştır. Elektrikli ve hibrit modeller ayıklanır; gözden kaçan olursa bir güncellemeyle kaldırılır.
Uygulamayı nasıl güncellerim?|Ayarlar'ı açıp Güncellemeleri denetle'ye basın. Windows güncellemeyi kendisi indirip kurar. Android, iPhone ve Mac yeni sürümün indirme bağlantısını açar.
Teknik değerler kesin mi?|Hayır. Değerler yaklaşıktır; pazara, yıla ve versiyona göre değişir. Parça almadan önce üretici belgelerini kontrol edin.
Fotoğraflar nereden geliyor?|Fotoğraflar özgür lisanslarla Wikimedia Commons'tan alınır. Fotoğrafçı ve lisans bilgisi detaylı araba sayfalarında görünür.
İnternet gerekli mi?|Detaylı arabalar internetsiz çalışır. Tüm kataloğun fotoğrafları ve güncelleme denetimi için internet gerekir.
Bu rehberlerle aracımı tamir edebilir miyim?|Rehberler arızayı anlamanıza yardım eder. Fren, direksiyon, yakıt ve güvenlik sistemleri için mutlaka yetkin bir ustaya gidin.
Dili nasıl değiştiririm?|Ayarlar'ı açıp bir dil seçin. Tüm arayüz yazıları anında değişir.
Vexa'yı kim yaptı?|Vexa, Tv Man tarafından yapıldı.`,
  de: `Was ist Vexa?|Eine Nachschlage-App für Benzin- und Dieselautos sowie Motorräder mit Modellen aller Epochen, Fotos, Daten, häufigen Defekten und Teilen.
Warum gibt es keine Elektrofahrzeuge?|Vexa ist Verbrennungsmotoren gewidmet. Elektro- und Hybridmodelle werden herausgefiltert; ein übersehenes Modell wird per Update entfernt.
Wie aktualisiere ich die App?|Öffne die Einstellungen und tippe auf Nach Updates suchen. Windows lädt und installiert selbst. Android, iPhone und Mac öffnen den Download der neuen Version.
Sind die technischen Daten exakt?|Nein. Die Werte sind ungefähr und variieren nach Markt, Jahr und Version. Prüfe vor dem Teilekauf die Herstellerunterlagen.
Woher stammen die Fotos?|Die Fotos stammen unter freien Lizenzen von Wikimedia Commons. Urheber und Lizenz stehen auf den Detailseiten.
Brauche ich Internet?|Detaillierte Autos funktionieren offline. Fotos des Gesamtkatalogs und die Update-Prüfung brauchen Internet.
Kann ich mein Fahrzeug mit diesen Ratgebern reparieren?|Sie helfen, einen Defekt zu verstehen. Bei Bremsen, Lenkung, Kraftstoff oder Sicherheitssystemen immer eine Fachwerkstatt aufsuchen.
Wie ändere ich die Sprache?|Öffne die Einstellungen und wähle eine Sprache. Alle Texte ändern sich sofort.
Wer hat Vexa gemacht?|Vexa wurde von Tv Man erstellt.`,
  fr: `Qu'est-ce que Vexa ?|Une application de référence sur les voitures et motos essence et diesel, avec des modèles de toutes les époques, photos, caractéristiques, pannes courantes et pièces.
Pourquoi aucun véhicule électrique ?|Vexa est dédié aux moteurs thermiques. Les modèles électriques et hybrides sont filtrés ; un oubli sera retiré par une mise à jour.
Comment mettre à jour l'application ?|Ouvrez Réglages et appuyez sur Rechercher des mises à jour. Windows télécharge et installe seul. Android, iPhone et Mac ouvrent le téléchargement.
Les caractéristiques sont-elles exactes ?|Non. Les valeurs sont approximatives et varient selon le marché, l'année et la version. Vérifiez les documents du constructeur avant d'acheter.
D'où viennent les photos ?|Elles viennent de Wikimedia Commons sous licences libres. L'auteur et la licence figurent sur les pages détaillées.
Faut-il Internet ?|Les voitures détaillées fonctionnent hors ligne. Les photos du catalogue complet et les mises à jour nécessitent Internet.
Puis-je réparer mon véhicule avec ces guides ?|Ils aident à comprendre une panne. Pour les freins, la direction, le carburant ou la sécurité, consultez toujours un mécanicien qualifié.
Comment changer la langue ?|Ouvrez Réglages et choisissez une langue. Tous les textes changent instantanément.
Qui a créé Vexa ?|Vexa a été créé par Tv Man.`,
  es: `¿Qué es Vexa?|Una aplicación de consulta sobre coches y motos de gasolina y diésel, con modelos de todas las épocas, fotos, especificaciones, averías comunes y piezas.
¿Por qué no hay vehículos eléctricos?|Vexa está dedicado a los motores de combustión. Los eléctricos e híbridos se filtran; si se escapa alguno, se retirará en una actualización.
¿Cómo actualizo la aplicación?|Abre Ajustes y pulsa Buscar actualizaciones. Windows la descarga e instala solo. Android, iPhone y Mac abren la descarga de la nueva versión.
¿Son exactas las especificaciones?|No. Los valores son aproximados y varían según mercado, año y versión. Consulta la documentación del fabricante antes de comprar piezas.
¿De dónde salen las fotos?|Proceden de Wikimedia Commons con licencias libres. El autor y la licencia aparecen en las páginas detalladas.
¿Necesito Internet?|Los coches detallados funcionan sin conexión. Las fotos del catálogo completo y las actualizaciones necesitan Internet.
¿Puedo reparar mi vehículo con estas guías?|Ayudan a entender una avería. Para frenos, dirección, combustible o seguridad, acude siempre a un mecánico cualificado.
¿Cómo cambio el idioma?|Abre Ajustes y elige un idioma. Todos los textos cambian al instante.
¿Quién creó Vexa?|Vexa fue creado por Tv Man.`,
  it: `Che cos'è Vexa?|Un'app di consultazione su auto e moto a benzina e diesel, con modelli di tutte le epoche, foto, specifiche, guasti comuni e componenti.
Perché non ci sono veicoli elettrici?|Vexa è dedicata ai motori a combustione. I modelli elettrici e ibridi vengono filtrati; se ne sfugge uno, sarà rimosso con un aggiornamento.
Come aggiorno l'app?|Apri Impostazioni e premi Controlla aggiornamenti. Windows scarica e installa da solo. Android, iPhone e Mac aprono il download della nuova versione.
Le specifiche sono esatte?|No. I valori sono approssimativi e variano per mercato, anno e versione. Controlla i documenti del costruttore prima di acquistare ricambi.
Da dove provengono le foto?|Da Wikimedia Commons con licenze libere. Autore e licenza sono indicati nelle pagine dettagliate.
Serve Internet?|Le auto dettagliate funzionano offline. Le foto del catalogo completo e gli aggiornamenti richiedono Internet.
Posso riparare il mio veicolo con queste guide?|Aiutano a capire un guasto. Per freni, sterzo, carburante o sicurezza rivolgiti sempre a un meccanico qualificato.
Come cambio la lingua?|Apri Impostazioni e scegli una lingua. Tutti i testi cambiano subito.
Chi ha creato Vexa?|Vexa è stato creato da Tv Man.`,
  pt: `O que é o Vexa?|Um aplicativo de consulta sobre carros e motos a gasolina e diesel, com modelos de todas as épocas, fotos, especificações, defeitos comuns e peças.
Por que não há veículos elétricos?|O Vexa é dedicado a motores a combustão. Modelos elétricos e híbridos são filtrados; se algum escapar, será removido em uma atualização.
Como atualizo o aplicativo?|Abra Definições e toque em Verificar atualizações. O Windows baixa e instala sozinho. Android, iPhone e Mac abrem o download da nova versão.
As especificações são exatas?|Não. Os valores são aproximados e variam por mercado, ano e versão. Confira os documentos do fabricante antes de comprar peças.
De onde vêm as fotos?|Do Wikimedia Commons, com licenças livres. O autor e a licença aparecem nas páginas detalhadas.
Preciso de internet?|Os carros detalhados funcionam offline. As fotos do catálogo completo e as atualizações precisam de internet.
Posso consertar meu veículo com estes guias?|Eles ajudam a entender um defeito. Para freios, direção, combustível ou segurança, procure sempre um mecânico qualificado.
Como mudo o idioma?|Abra Definições e escolha um idioma. Todos os textos mudam na hora.
Quem criou o Vexa?|O Vexa foi criado por Tv Man.`,
  ru: `Что такое Vexa?|Справочник по бензиновым и дизельным автомобилям и мотоциклам: модели всех эпох, фото, характеристики, типичные неисправности и детали.
Почему нет электромобилей?|Vexa посвящена двигателям внутреннего сгорания. Электрические и гибридные модели отфильтрованы; пропущенная модель будет удалена в обновлении.
Как обновить приложение?|Откройте Настройки и нажмите Проверить обновления. Windows сама скачает и установит. Android, iPhone и Mac откроют загрузку новой версии.
Точны ли характеристики?|Нет. Значения приблизительны и зависят от рынка, года и версии. Перед покупкой деталей сверьтесь с документами производителя.
Откуда фотографии?|Из Wikimedia Commons по свободным лицензиям. Автор и лицензия указаны на подробных страницах.
Нужен ли интернет?|Подробные автомобили работают офлайн. Для фото всего каталога и обновлений нужен интернет.
Можно ли чинить машину по этим руководствам?|Они помогают понять неисправность. Для тормозов, рулевого, топливной системы и систем безопасности обращайтесь к квалифицированному мастеру.
Как сменить язык?|Откройте Настройки и выберите язык. Весь текст изменится мгновенно.
Кто создал Vexa?|Vexa создал Tv Man.`,
  ar: `ما هو Vexa؟|تطبيق مرجعي لسيارات ودراجات البنزين والديزل يضم طرازات من كل العصور وصورًا ومواصفات وأعطالًا شائعة وقطعًا.
لماذا لا توجد مركبات كهربائية؟|يختص Vexa بمحركات الاحتراق. تتم تصفية الطرازات الكهربائية والهجينة، وإذا ظهر أحدها فسيُزال في تحديث.
كيف أحدّث التطبيق؟|افتح الإعدادات واضغط التحقق من التحديثات. ينزّل Windows التحديث ويثبته تلقائيًا، بينما يفتح Android وiPhone وMac رابط تنزيل الإصدار الجديد.
هل المواصفات دقيقة؟|لا. القيم تقريبية وتختلف حسب السوق والسنة والإصدار. راجع وثائق الشركة المصنعة قبل شراء القطع.
من أين تأتي الصور؟|من Wikimedia Commons بتراخيص حرة، ويظهر المصور والترخيص في صفحات السيارات التفصيلية.
هل أحتاج إلى الإنترنت؟|تعمل السيارات التفصيلية دون إنترنت. تحتاج صور الكتالوج الكامل والتحديثات إلى اتصال.
هل يمكنني إصلاح مركبتي بهذه الأدلة؟|تساعدك على فهم العطل. أما المكابح والتوجيه والوقود وأنظمة السلامة فاستعن دائمًا بميكانيكي مؤهل.
كيف أغيّر اللغة؟|افتح الإعدادات واختر لغة، وستتغير جميع النصوص فورًا.
من صنع Vexa؟|أنشأ Tv Man تطبيق Vexa.`,
  zh: `Vexa 是什么？|一款汽油和柴油汽车及摩托车资料应用，收录各年代车型、照片、参数、常见故障和零部件。
为什么没有电动车？|Vexa 专注于内燃机。电动和混动车型已被过滤，如有遗漏将在更新中移除。
如何更新应用？|打开设置并点击检查更新。Windows 会自动下载并安装，Android、iPhone 和 Mac 会打开新版本下载。
参数准确吗？|不完全准确。数值为近似值，因市场、年份和版本而异。购买零件前请核对厂家资料。
照片来自哪里？|照片来自 Wikimedia Commons，采用自由许可。作者和许可证显示在详细车型页面。
需要联网吗？|详细车型可离线使用。完整目录的照片和检查更新需要联网。
可以按这些指南自己修车吗？|指南帮助您了解故障。涉及制动、转向、燃油或安全系统时，请务必交给专业技师。
如何更改语言？|打开设置并选择语言，所有界面文字会立即切换。
Vexa 是谁制作的？|Vexa 由 Tv Man 制作。`,
  ja: `Vexa とは？|ガソリン車・ディーゼル車とバイクの資料アプリです。全年代のモデル、写真、仕様、よくある故障、部品を確認できます。
なぜ電気自動車がないのですか？|Vexa は内燃機関専門です。電気・ハイブリッドモデルは除外しており、漏れがあればアップデートで削除します。
アプリの更新方法は？|設定を開き、アップデートを確認を押します。Windows は自動でダウンロードしてインストールします。Android、iPhone、Mac は新バージョンのダウンロードを開きます。
仕様は正確ですか？|いいえ。数値は概算で、市場、年式、グレードにより異なります。部品購入前にメーカー資料を確認してください。
写真の出典は？|自由ライセンスの Wikimedia Commons です。撮影者とライセンスは詳細ページに表示されます。
インターネットは必要ですか？|詳細な車はオフラインで使えます。全カタログの写真と更新確認には接続が必要です。
このガイドで自分で修理できますか？|故障の理解に役立ちます。ブレーキ、ステアリング、燃料、安全装置は必ず整備士に依頼してください。
言語の変更方法は？|設定を開いて言語を選ぶと、すべての表示がすぐに切り替わります。
Vexa の制作者は？|Vexa は Tv Man が制作しました。`,
};

export const EXTRA_UI = Object.fromEntries(Object.entries(UI).map(([lang, text]) => {
  const values = text.split('|');
  if (values.length !== UI_KEYS.length) throw new Error(`extra UI ${lang}: ${values.length}/${UI_KEYS.length}`);
  return [lang, Object.fromEntries(UI_KEYS.map((key, i) => [key, values[i]]))];
}));

const partCount = MOTO_PART_GROUPS.reduce((sum, [, n]) => sum + n, 0);

export function motoProblems(lang) {
  const lines = MOTO_PROBLEMS[lang].split('\n');
  return MOTO_PROBLEM_RULES.map(([id, severity], i) => {
    const [title, symptoms, solution] = lines[i].split('|');
    return { id, severity, title, symptoms, solution };
  });
}

export function motoParts(lang) {
  const values = MOTO_PARTS[lang].split(/[|\n]/);
  let cursor = 0;
  return MOTO_PART_GROUPS.map(([group, count]) => {
    const parts = values.slice(cursor, cursor + count).map((name, i) => ({ id: `${group}-${i}`, name }));
    cursor += count;
    return { group, parts };
  });
}

export const faqFor = (lang) => FAQ[lang].split('\n').map((line) => { const [q, a] = line.split('|'); return { q, a }; });

// Self-check so a missing translation fails the build instead of showing blank text.
for (const lang of Object.keys(UI)) {
  if (MOTO_PROBLEMS[lang].split('\n').length !== MOTO_PROBLEM_RULES.length || MOTO_PROBLEMS[lang].split('\n').some((l) => l.split('|').length !== 3)) throw new Error(`moto problems ${lang}`);
  if (MOTO_PARTS[lang].split(/[|\n]/).length !== partCount) throw new Error(`moto parts ${lang}`);
  if (FAQ[lang].split('\n').length !== 9 || FAQ[lang].split('\n').some((l) => l.split('|').length !== 2)) throw new Error(`faq ${lang}`);
}
