/**
 * Store locations sourced from `Store Locations25.csv`.
 *
 * Each entry preserves the raw CSV columns we care about so we can display
 * the full ADDRESS in the UI while keying off LOCATION_ID for the form
 * value. Replace this list with a backend feed once the locations API is
 * wired up.
 */
export type StoreLocation = {
    /** Unique LOCATION_ID from the CSV — used as the form value. */
    locationId: string;
    /** Store code (e.g. "WKSB00532") — first line of the ADDRESS column. */
    code: string;
    /** Street line (ADDRESS_ONE). */
    street: string;
    /** City + state + zip (line 3 of ADDRESS, e.g. "PHILADELPHIA PA 19116"). */
    cityStateZip: string;
    /** Country line (line 4 of ADDRESS). */
    country: string;
};

export const storeLocations: StoreLocation[] = [
    { locationId: '4982', code: 'WKSB00532', street: '11000 ROOSEVELT BLVD',          cityStateZip: 'PHILADELPHIA PA 19116',     country: 'United States' },
    { locationId: '4920', code: 'WKSB00469', street: '330 WEST OREGON AVE',           cityStateZip: 'PHILADELPHIA PA 19148',     country: 'United States' },
    { locationId: '5763', code: 'WMSB04333', street: '10040 COUNTY ROAD 48',          cityStateZip: 'FAIRHOPE AL 36532-4520',    country: 'United States' },
    { locationId: '5729', code: 'WMSB01311', street: '5448 WHITTLESEY BLVD STE B',    cityStateZip: 'COLUMBUS GA 31909-7298',    country: 'United States' },
    { locationId: '5731', code: 'WMSB01375', street: '2255 HIGHWAY 71',               cityStateZip: 'MARIANNA FL 32448-2541',    country: 'United States' },
    { locationId: '5739', code: 'WMSB01638', street: '3176 S EUFAULA AVE',            cityStateZip: 'EUFAULA AL 36027-4406',     country: 'United States' },
    { locationId: '5754', code: 'WMSB03386', street: '160 SPRINGVILLE STATION BLVD',  cityStateZip: 'SPRINGVILLE AL 35146-6162', country: 'United States' },
    { locationId: '5718', code: 'WMSB01134', street: '1226 FREEPORT HWY S',           cityStateZip: 'DEFUNIAK SPRINGS FL 32435-3396', country: 'United States' },
    { locationId: '5682', code: 'WMSB00562', street: '8551 WHITFIELD AVE',            cityStateZip: 'LEEDS AL 35094-7560',       country: 'United States' },
    { locationId: '5752', code: 'WMSB03271', street: '5100 HIGHWAY 31',               cityStateZip: 'CALERA AL 35040-5154',      country: 'United States' },
    { locationId: '5727', code: 'WMSB01224', street: '2650 CREIGHTON RD',             cityStateZip: 'PENSACOLA FL 32504-7382',   country: 'United States' },
    { locationId: '5733', code: 'WMSB01408', street: '4400 W TENNESSEE ST',           cityStateZip: 'TALLAHASSEE FL 32304-1029', country: 'United States' },
    { locationId: '5725', code: 'WMSB01223', street: '5500 THOMASVILLE RD',           cityStateZip: 'TALLAHASSEE FL 32312-3814', country: 'United States' },
    { locationId: '5720', code: 'WMSB01174', street: '34301 HIGHWAY 43',              cityStateZip: 'THOMASVILLE AL 36784-3341', country: 'United States' },
    { locationId: '5675', code: 'WMSB00355', street: '2900 PEPPERELL PKWY',           cityStateZip: 'OPELIKA AL 36801-6128',     country: 'United States' },
    { locationId: '5755', code: 'WMSB03439', street: '9360 NAVARRE PKWY',             cityStateZip: 'NAVARRE FL 32566-2910',     country: 'United States' },
    { locationId: '5680', code: 'WMSB00483', street: '1903 COBBS FORD RD',            cityStateZip: 'PRATTVILLE AL 36066-7230',  country: 'United States' },
    { locationId: '5692', code: 'WMSB00733', street: '3501 20TH AVE',                 cityStateZip: 'VALLEY AL 36854-3206',      country: 'United States' },
    { locationId: '5696', code: 'WMSB00809', street: '92 PLAZA LN',                   cityStateZip: 'OXFORD AL 36203-2440',      country: 'United States' },
    { locationId: '5713', code: 'WMSB01063', street: '1608 W MAGNOLIA AVE',           cityStateZip: 'GENEVA AL 36340-1237',      country: 'United States' },
    { locationId: '5671', code: 'WMSB00298', street: '1972 HWY 431',                  cityStateZip: 'BOAZ AL 35957-5901',        country: 'United States' },
    { locationId: '5744', code: 'WMSB02534', street: '3300 S OATES ST',               cityStateZip: 'DOTHAN AL 36301-5694',      country: 'United States' },
    { locationId: '5738', code: 'WMSB01620', street: '2578 DOUGLAS AVE',              cityStateZip: 'BREWTON AL 36426-3552',     country: 'United States' },
    { locationId: '5723', code: 'WMSB01212', street: '1095 INDUSTRIAL PKWY',          cityStateZip: 'SARALAND AL 36571-3719',    country: 'United States' },
    { locationId: '5753', code: 'WMSB03307', street: '35 MIKE STEWART',               cityStateZip: 'CRAWFORDVILLE FL 32327-1164', country: 'United States' },
];

/** Full multi-line ADDRESS string, mirroring the CSV's quoted ADDRESS column. */
export const formatAddress = (l: StoreLocation): string =>
    `${l.code}\n${l.street}\n${l.cityStateZip}\n${l.country}`;
