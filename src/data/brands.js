// [id, name, ISO country, founded, active]. Electric-only makers are intentionally excluded.
const rows = [
  ['abarth','Abarth','IT',1949,1],['acura','Acura','JP',1986,1],['alfa','Alfa Romeo','IT',1910,1],['alpina','Alpina','DE',1965,1],['alpine','Alpine','FR',1955,1],
  ['amc','AMC','US',1954,0],['anadol','Anadol','TR',1966,0],['ariel','Ariel','GB',1991,1],['aston','Aston Martin','GB',1913,1],['audi','Audi','DE',1909,1],
  ['austin','Austin','GB',1905,0],['autobianchi','Autobianchi','IT',1955,0],['bac','BAC','GB',2009,1],['baic','BAIC','CN',1958,1],['bentley','Bentley','GB',1919,1],
  ['bizzarrini','Bizzarrini','IT',1964,1],['bmw','BMW','DE',1916,1],['borgward','Borgward','DE',1919,0],['brilliance','Brilliance','CN',1992,1],['bugatti','Bugatti','FR',1909,1],
  ['buick','Buick','US',1903,1],['byd','BYD','CN',2003,1],['cadillac','Cadillac','US',1902,1],['caterham','Caterham','GB',1973,1],['changan','Changan','CN',1862,1],
  ['chery','Chery','CN',1997,1],['chevrolet','Chevrolet','US',1911,1],['chrysler','Chrysler','US',1925,1],['citroen','Citroën','FR',1919,1],['cupra','Cupra','ES',2018,1],
  ['dacia','Dacia','RO',1966,1],['daewoo','Daewoo','KR',1967,0],['daihatsu','Daihatsu','JP',1907,1],['datsun','Datsun','JP',1931,0],['delorean','DeLorean','US',1975,0],
  ['detomaso','De Tomaso','IT',1959,1],['dodge','Dodge','US',1900,1],['donkervoort','Donkervoort','NL',1978,1],['ds','DS Automobiles','FR',2014,1],['dongfeng','Dongfeng','CN',1969,1],
  ['eagle','Eagle','US',1988,0],['faw','FAW','CN',1953,1],['ferrari','Ferrari','IT',1939,1],['fiat','Fiat','IT',1899,1],['ford','Ford','US',1903,1],
  ['foton','Foton','CN',1996,1],['gaz','GAZ','RU',1932,1],['geely','Geely','CN',1986,1],['genesis','Genesis','KR',2015,1],['ginetta','Ginetta','GB',1958,1],
  ['gmc','GMC','US',1911,1],['greatwall','Great Wall','CN',1984,1],['gumpert','Gumpert','DE',2004,0],['haval','Haval','CN',2013,1],['hennessey','Hennessey','US',1991,1],
  ['hillman','Hillman','GB',1907,0],['hindustan','Hindustan','IN',1942,0],['holden','Holden','AU',1856,0],['honda','Honda','JP',1948,1],['hummer','Hummer','US',1992,0],
  ['hyundai','Hyundai','KR',1967,1],['infiniti','Infiniti','JP',1989,1],['innocenti','Innocenti','IT',1947,0],['isuzu','Isuzu','JP',1916,1],['iveco','Iveco','IT',1975,1],
  ['jaguar','Jaguar','GB',1922,1],['jac','JAC','CN',1964,1],['jeep','Jeep','US',1941,1],['jensen','Jensen','GB',1934,0],['kia','Kia','KR',1944,1],
  ['koenigsegg','Koenigsegg','SE',1994,1],['ktm','KTM','AT',1992,1],['lada','Lada','RU',1966,1],['lamborghini','Lamborghini','IT',1963,1],['lancia','Lancia','IT',1906,1],
  ['landrover','Land Rover','GB',1948,1],['lexus','Lexus','JP',1989,1],['lincoln','Lincoln','US',1917,1],['lotus','Lotus','GB',1952,1],['mahindra','Mahindra','IN',1945,1],
  ['marcos','Marcos','GB',1959,0],['maruti','Maruti Suzuki','IN',1981,1],['maserati','Maserati','IT',1914,1],['maybach','Maybach','DE',1909,1],['mazda','Mazda','JP',1920,1],
  ['mclaren','McLaren','GB',1985,1],['mercedes','Mercedes-Benz','DE',1926,1],['mercury','Mercury','US',1938,0],['mg','MG','GB',1924,1],['mini','MINI','GB',1959,1],
  ['mitsubishi','Mitsubishi','JP',1917,1],['morgan','Morgan','GB',1910,1],['morris','Morris','GB',1912,0],['moskvich','Moskvich','RU',1930,1],['nissan','Nissan','JP',1933,1],
  ['noble','Noble','GB',1999,1],['oldsmobile','Oldsmobile','US',1897,0],['opel','Opel','DE',1862,1],['pagani','Pagani','IT',1992,1],['perodua','Perodua','MY',1993,1],
  ['peugeot','Peugeot','FR',1810,1],['plymouth','Plymouth','US',1928,0],['pontiac','Pontiac','US',1926,0],['porsche','Porsche','DE',1931,1],['proton','Proton','MY',1983,1],
  ['ram','RAM','US',2010,1],['renault','Renault','FR',1899,1],['rollsroyce','Rolls-Royce','GB',1906,1],['rover','Rover','GB',1878,0],['saab','Saab','SE',1945,0],
  ['saleen','Saleen','US',1983,1],['samsung','Renault Samsung','KR',1994,1],['saturn','Saturn','US',1985,0],['scion','Scion','US',2003,0],['seat','SEAT','ES',1950,1],
  ['simca','Simca','FR',1934,0],['skoda','Škoda','CZ',1895,1],['spyker','Spyker','NL',1999,0],['ssangyong','KGM SsangYong','KR',1954,1],['subaru','Subaru','JP',1953,1],
  ['suzuki','Suzuki','JP',1909,1],['talbot','Talbot','FR',1903,0],['tata','Tata','IN',1945,1],['tofas','Tofaş','TR',1968,1],['toyota','Toyota','JP',1937,1],
  ['triumph','Triumph','GB',1885,0],['tvr','TVR','GB',1946,1],['uaz','UAZ','RU',1941,1],['vauxhall','Vauxhall','GB',1857,1],['vector','Vector','US',1971,0],
  ['volkswagen','Volkswagen','DE',1937,1],['volvo','Volvo','SE',1927,1],['wartburg','Wartburg','DE',1898,0],['westfield','Westfield','GB',1982,1],['wiesmann','Wiesmann','DE',1988,1],
  ['zastava','Zastava','RS',1953,0],['zaz','ZAZ','UA',1923,1],['zenvo','Zenvo','DK',2007,1],['zil','ZiL','RU',1916,0],['zotye','Zotye','CN',2005,0],
];

export const BRANDS = rows.map(([id, name, country, founded, active]) => ({ id, name, country, founded, active: !!active }));
export const brandById = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
