"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import { supabase } from "../../lib/supabase";
import LoadingScreen from "../../AppShell/LoadingScreen";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "history"
  | "fraud"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "phone"
  | "calendar"
  | "camera"
  | "upload"
  | "shield"
  | "lock"
  | "check"
  | "arrow"
  | "chevron"
  | "menu"
  | "close";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◇",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    phone: "☎",
    calendar: "□",
    camera: "●",
    upload: "↑",
    shield: "♢",
    lock: "▣",
    check: "✓",
    arrow: "←",
    chevron: "⌄",
    menu: "☰",
    close: "×",
  };

  return (
    <span
      className={styles.icon}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
NAVIGATION
============================================================
*/

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },
  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

/*
============================================================
COUNTRIES
============================================================
*/

type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

const countries: CountryOption[] = [
  {
    code: "NG",
    name: "Nigeria",
    dialCode: "+234",
    flag: "🇳🇬",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
  },
  {
    code: "GH",
    name: "Ghana",
    dialCode: "+233",
    flag: "🇬🇭",
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: "🇿🇦",
  },
  {
    code: "KE",
    name: "Kenya",
    dialCode: "+254",
    flag: "🇰🇪",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
  },
  {
    code: "IT",
    name: "Italy",
    dialCode: "+39",
    flag: "🇮🇹",
  },
  {
    code: "ES",
    name: "Spain",
    dialCode: "+34",
    flag: "🇪🇸",
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: "🇳🇱",
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: "🇨🇭",
  },
  {
    code: "IE",
    name: "Ireland",
    dialCode: "+353",
    flag: "🇮🇪",
  },
  {
    code: "PT",
    name: "Portugal",
    dialCode: "+351",
    flag: "🇵🇹",
  },
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
  },
  {
    code: "CN",
    name: "China",
    dialCode: "+86",
    flag: "🇨🇳",
  },
  {
    code: "JP",
    name: "Japan",
    dialCode: "+81",
    flag: "🇯🇵",
  },
  {
    code: "KR",
    name: "South Korea",
    dialCode: "+82",
    flag: "🇰🇷",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: "🇲🇾",
  },
  {
    code: "BR",
    name: "Brazil",
    dialCode: "+55",
    flag: "🇧🇷",
  },
  {
    code: "MX",
    name: "Mexico",
    dialCode: "+52",
    flag: "🇲🇽",
  },
];

/*
============================================================
NIGERIAN STATES
============================================================
*/

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/*
============================================================
NIGERIAN LOCAL GOVERNMENT AREAS
============================================================
*/

const nigerianLgas: Record<string, string[]> = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],

  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],

  "Akwa Ibom": [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat Enin",
    "Nsit Atai",
    "Nsit Ibom",
    "Nsit Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],

  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],

  Bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],

  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],

  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Otukpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],

  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],

  "Cross River": [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakurr",
    "Yala",
  ],

  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],

  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaukwu",
    "Ohaozara",
    "Onicha",
  ],

  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba-Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],

  Ekiti: [
    "Ado Ekiti",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],

  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi-Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],

  "Federal Capital Territory": [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
  ],

  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],

  Imo: [
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
    "Unuimo",
    "Onuimo",
  ],

  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],

  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],

  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],

  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dan Musa",
    "Dandume",
    "Danja",
    "Daura",
    "Dutsi",
    "Dutsin Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],

  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],

  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela-Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Kogi/Koton Karfe",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
    "Bassa Komu",
  ],

  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],

  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],

  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Eggon",
    "Obi",
    "Toto",
    "Wamba",
  ],

  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],

  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Sagamu",
    "Yewa North",
    "Yewa South",
  ],

  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],

  Osun: [
    "Atakunmosa East",
    "Atakunmosa West",
    "Aiyedaade",
    "Aiyedire",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Egbedore",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],

  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomoso North",
    "Ogbomoso South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Oriire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],

  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],

  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emohua",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],

  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamakko",
    "Wurno",
    "Yabo",
  ],

  Taraba: [
    "Ardo-Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],

  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],

  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukkuyum",
    "Bungudu",
    "Chafe",
    "Gummi",
    "Gusau",
    "Isa",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
  ],
};

/*
============================================================
USER PROFILE TYPE
============================================================
*/

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  residentialAddress: string;
  city: string;
  localGovernment: string;
  state: string;
  country: string;
  occupation: string;
  company: string;
};

/*
============================================================
HELPERS
============================================================
*/

function getInitials(name: string) {
  const cleaned = name.trim();

  if (!cleaned) {
    return "U";
  }

  const parts = cleaned.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function normalizeCountryCode(value: string) {
  const lowerValue = value.toLowerCase();

  const match = countries.find(
    (country) =>
      lowerValue.includes(country.name.toLowerCase()) ||
      lowerValue === country.code.toLowerCase()
  );

  return match?.code || "NG";
}

function getCountryByCode(code: string) {
  return (
    countries.find(
      (country) => country.code === code
    ) || countries[0]
  );
}

function formatDateForInput(value: unknown) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  const parsed = new Date(stringValue);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function extractPhoneNumber(
  phone: string,
  dialCode: string
) {
  if (!phone) {
    return "";
  }

  let normalized = phone.replace(/[^\d+]/g, "");

  if (normalized.startsWith(dialCode)) {
    normalized = normalized.slice(
      dialCode.length
    );
  }

  if (
    dialCode === "+234" &&
    normalized.startsWith("0")
  ) {
    normalized = normalized.slice(1);
  }

  return normalized.replace(/\D/g, "");
}

/*
============================================================
PAGE
============================================================
*/

export default function EditProfilePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");

  const [plan, setPlan] = useState("Free Plan");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    residentialAddress: "",
    city: "",
    localGovernment: "",
    state: "",
    country: "Nigeria",
    occupation: "",
    company: "",
  });

  /*
  ============================================================
  LOAD AUTH USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          authUser.user_metadata || {};

        const email = authUser.email || "";

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(/[._-]+/g, " ")
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const phone =
          authUser.phone ||
          metadata.phone ||
          "";

        const country =
          metadata.country ||
          "Nigeria";

        const normalizedCountry =
          normalizeCountryCode(
            String(country)
          );

        const selected =
          getCountryByCode(
            normalizedCountry
          );

        const state = String(
          metadata.state || ""
        );

        const existingLocalGovernment =
          String(
            metadata.local_government ||
              metadata.local_government_area ||
              metadata.lga ||
              ""
          );

        const city = String(
          metadata.city || ""
        );

        const localGovernment =
          existingLocalGovernment ||
          (normalizedCountry === "NG"
            ? city
            : "");

        setUserId(authUser.id);

        setPlan(
          String(
            metadata.plan ||
              metadata.subscription_plan ||
              metadata.account_plan ||
              "Free Plan"
          )
        );

        setAvatarUrl(
          String(
            metadata.avatar_url ||
              metadata.profile_photo ||
              ""
          )
        );

        setForm({
          fullName,
          email,
          phone: extractPhoneNumber(
            String(phone),
            selected.dialCode
          ),
          dateOfBirth: formatDateForInput(
            metadata.date_of_birth ||
              metadata.dob
          ),
          residentialAddress: String(
            metadata.residential_address ||
              metadata.address ||
              ""
          ),
          city:
            normalizedCountry === "NG"
              ? ""
              : city,
          localGovernment,
          state,
          country: selected.name,
          occupation: String(
            metadata.occupation || ""
          ),
          company: String(
            metadata.company || ""
          ),
        });
      } catch (loadError) {
        console.error(
          "Edit profile loading error:",
          loadError
        );

        if (mounted) {
          setError(
            "Unable to load your profile."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/signin");
    } catch (signOutError) {
      console.error(
        "Sign out error:",
        signOutError
      );
    }
  };

  /*
  ============================================================
  CURRENT COUNTRY
  ============================================================
  */

  const selectedCountry = useMemo(() => {
    return getCountryByCode(
      normalizeCountryCode(form.country)
    );
  }, [form.country]);

  const isNigeria =
    selectedCountry.code === "NG";

  const availableLgas =
    isNigeria && form.state
      ? nigerianLgas[form.state] || []
      : [];

  /*
  ============================================================
  FORM UPDATE
  ============================================================
  */

  const updateField = <
    K extends keyof ProfileForm
  >(
    field: K,
    value: ProfileForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setMessage("");
  };

  /*
  ============================================================
  COUNTRY CHANGE
  ============================================================
  */

  const handleCountryChange = (
    countryCode: string
  ) => {
    const selected =
      getCountryByCode(countryCode);

    setForm((current) => ({
      ...current,
      country: selected.name,
      state: "",
      localGovernment: "",
      city: "",
    }));

    setError("");
    setMessage("");
  };

  /*
  ============================================================
  STATE CHANGE
  ============================================================
  */

  const handleStateChange = (
    state: string
  ) => {
    setForm((current) => ({
      ...current,
      state,
      localGovernment: "",
    }));

    setError("");
    setMessage("");
  };

  /*
  ============================================================
  PHONE CHANGE
  ============================================================
  */

  const handlePhoneChange = (
    value: string
  ) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(
        0,
        selectedCountry.code === "NG"
          ? 10
          : 15
      );

    updateField("phone", digits);
  };

  /*
  ============================================================
  SAVE PROFILE
  ============================================================
  */

  const saveProfile = async () => {
    setError("");
    setMessage("");

    if (!form.fullName.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (
      isNigeria &&
      form.phone &&
      form.phone.length !== 10
    ) {
      setError(
        "Please enter a valid Nigerian phone number."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError) {
        throw currentUserError;
      }

      if (!currentUser) {
        router.replace("/signin");
        return;
      }

      const existingMetadata =
        currentUser.user_metadata || {};

      const internationalPhone =
        form.phone.trim()
          ? `${selectedCountry.dialCode}${form.phone.trim()}`
          : "";

      const updatedMetadata = {
        ...existingMetadata,

        full_name:
          form.fullName.trim(),

        date_of_birth:
          form.dateOfBirth || null,

        residential_address:
          form.residentialAddress.trim(),

        city:
          isNigeria
            ? ""
            : form.city.trim(),

        local_government:
          isNigeria
            ? form.localGovernment.trim()
            : "",

        local_government_area:
          isNigeria
            ? form.localGovernment.trim()
            : "",

        state:
          form.state.trim(),

        country:
          form.country.trim(),

        occupation:
          form.occupation.trim(),

        company:
          form.company.trim(),

        phone:
          internationalPhone,
      };

      const emailChanged =
        form.email.trim() !==
        (currentUser.email || "");

      const { error: updateError } =
        await supabase.auth.updateUser({
          ...(emailChanged
            ? {
                email:
                  form.email.trim(),
              }
            : {}),

          data: updatedMetadata,
        });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        emailChanged
          ? "Profile saved. Please check your email to confirm the new email address."
          : "Profile updated successfully."
      );
    } catch (saveError) {
      console.error(
        "Save profile error:",
        saveError
      );

      const errorMessage =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save your profile.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  PHOTO UPLOAD
  ============================================================
  */

  const openPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, GIF, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setError(
        "Profile photo must be 2MB or smaller."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingPhoto(true);

      const fileExtension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath =
        `${userId}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType: file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate the profile photo URL."
        );
      }

      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError) {
        throw currentUserError;
      }

      if (!currentUser) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const existingMetadata =
        currentUser.user_metadata || {};

      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            ...existingMetadata,
            avatar_url: publicUrl,
          },
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);

      setMessage(
        "Profile photo updated successfully."
      );
    } catch (uploadError) {
      console.error(
        "Profile photo upload error:",
        uploadError
      );

      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload your profile photo.";

      setError(errorMessage);
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  /*
  ============================================================
  SHARED LOADING SCREEN
  ============================================================
  */

  if (loading) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main className={styles.page}>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <div className={styles.brandName}>
            <span
              className={
                styles.brandLogoDiamond
              }
            >
              ◆
            </span>

            <span>
              PropertySure
              <strong> AI</strong>
            </span>
          </div>

          <div
            className={
              styles.brandSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </button>

        <nav
          className={
            styles.sidebarNav
          }
        >
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              className={styles.navItem}
              onClick={() =>
                navigateTo(item.href)
              }
            >
              <span
                className={
                  styles.navIcon
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div
          className={
            styles.accountLabel
          }
        >
          ACCOUNT
        </div>

        <button
          type="button"
          className={`${styles.navItem} ${styles.activeNavItem}`}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="account"
              size={18}
            />
          </span>

          <span>
            Account
          </span>
        </button>

        <button
          type="button"
          className={
            styles.navItem
          }
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>
            Settings
          </span>
        </button>

        <div
          className={
            styles.helpBox
          }
        >
          <div
            className={
              styles.helpTitle
            }
          >
            Need Help?
          </div>

          <div
            className={
              styles.helpText
            }
          >
            Our support team is
            ready
            <br />
            to assist you.
          </div>

          <button
            type="button"
            className={
              styles.supportButton
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            Contact Support
          </button>
        </div>

        <button
          type="button"
          className={
            styles.sidebarUser
          }
          onClick={() =>
            navigateTo("/account")
          }
        >
          <div
            className={
              styles.avatarSmall
            }
          >
            {getInitials(
              form.fullName
            )}
          </div>

          <div
            className={
              styles.sidebarUserText
            }
          >
            <strong>
              {form.fullName ||
                "User"}
            </strong>

            <span>
              {plan}
            </span>
          </div>

          <span
            className={
              styles.sidebarChevron
            }
          >
            ⌄
          </span>
        </button>
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>

        <button
          type="button"
          className={
            styles.mobileLogoButton
          }
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={
              styles.mobileLogoDiamond
            }
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={17}
          />

          <span
            className={
              styles.notificationDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <div
              className={
                styles.mobileMenuLogo
              }
            >
              <span>
                ◆
              </span>

              <strong>
                PropertySure
                <em> AI</em>
              </strong>
            </div>

            <button
              type="button"
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              <Icon
                name="close"
                size={28}
              />
            </button>
          </div>

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property
            Due Diligence
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                className={
                  styles.mobileNavItem
                }
                onClick={() =>
                  navigateTo(
                    item.href
                  )
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />

                <span>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div
            className={
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileActive}`}
            onClick={() =>
              navigateTo("/account")
            }
          >
            <Icon
              name="account"
              size={18}
            />

            <span>
              Account
            </span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/settings")
            }
          >
            <Icon
              name="settings"
              size={18}
            />

            <span>
              Settings
            </span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={signOut}
          >
            <span>
              ↪
            </span>

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={
          styles.main
        }
      >
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header
          className={
            styles.topBar
          }
        >
          <div />

          <div
            className={
              styles.topBarRight
            }
          >
            <button
              type="button"
              className={
                styles.topNotification
              }
              onClick={() =>
                navigateTo(
                  "/account/notifications"
                )
              }
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={17}
              />

              <span
                className={
                  styles.topNotificationDot
                }
              />
            </button>

            <button
              type="button"
              className={
                styles.topUser
              }
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >
              <div
                className={
                  styles.topAvatar
                }
              >
                {getInitials(
                  form.fullName
                )}
              </div>

              <div
                className={
                  styles.topUserText
                }
              >
                <strong>
                  {form.fullName ||
                    "User"}
                </strong>

                <span>
                  {plan}
                </span>
              </div>

              <span
                className={
                  styles.topChevron
                }
              >
                ⌄
              </span>
            </button>
          </div>
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className={
            styles.content
          }
        >
          <div
            className={
              styles.pageIntro
            }
          >
            <h1>
              Edit Profile
            </h1>

            <p>
              Update your personal
              information and profile
              details.
            </p>

            <button
              type="button"
              className={
                styles.backLink
              }
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Account
              </span>
            </button>
          </div>

          <section
            className={
              styles.profileCard
            }
          >
            {/* =================================================
                DESKTOP PHOTO SECTION
            ================================================= */}

            <div
              className={
                styles.photoSection
              }
            >
              <h2>
                Profile Photo
              </h2>

              <p
                className={
                  styles.photoDescription
                }
              >
                Click on the photo to
                upload or change it.
              </p>

              <button
                type="button"
                className={
                  styles.avatarButton
                }
                onClick={
                  openPhotoPicker
                }
                disabled={
                  uploadingPhoto
                }
                aria-label="Change profile photo"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={
                      styles.profileImage
                    }
                  />
                ) : (
                  <span
                    className={
                      styles.avatarLarge
                    }
                  >
                    {getInitials(
                      form.fullName
                    )}
                  </span>
                )}

                <span
                  className={
                    styles.cameraButton
                  }
                >
                  <Icon
                    name="camera"
                    size={17}
                  />
                </span>
              </button>

              <button
                type="button"
                className={
                  styles.changePhotoButton
                }
                onClick={
                  openPhotoPicker
                }
                disabled={
                  uploadingPhoto
                }
              >
                <Icon
                  name="upload"
                  size={17}
                />

                <span>
                  {uploadingPhoto
                    ? "Uploading..."
                    : "Change Photo"}
                </span>
              </button>

              <p
                className={
                  styles.photoHint
                }
              >
                JPG, PNG or GIF. Max
                size 2MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className={
                  styles.hiddenFileInput
                }
                onChange={
                  handlePhotoChange
                }
              />
            </div>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <div
              className={
                styles.personalSection
              }
            >
              <h2>
                Personal Information
              </h2>

              <div
                className={
                  styles.formGrid
                }
              >
                {/* FULL NAME */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={
                      form.fullName
                    }
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target.value
                      )
                    }
                    autoComplete="name"
                  />
                </div>

                {/* EMAIL */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    autoComplete="email"
                  />
                </div>

                {/* PHONE */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <div
                    className={
                      styles.phoneInput
                    }
                  >
                    <div
                      className={
                        styles.phonePrefix
                      }
                    >
                      <span
                        className={
                          styles.phoneFlag
                        }
                      >
                        {
                          selectedCountry.flag
                        }
                      </span>

                      <span
                        className={
                          styles.phoneCountryCode
                        }
                      >
                        {
                          selectedCountry.dialCode
                        }
                      </span>
                    </div>

                    <span
                      className={
                        styles.phoneDivider
                      }
                    />

                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={
                        form.phone
                      }
                      onChange={(event) =>
                        handlePhoneChange(
                          event.target.value
                        )
                      }
                      placeholder={
                        isNigeria
                          ? "803 123 4567"
                          : "Phone number"
                      }
                      autoComplete="tel-national"
                      maxLength={
                        isNigeria
                          ? 10
                          : 15
                      }
                    />
                  </div>

                  {isNigeria && (
                    <p
                      className={
                        styles.fieldHint
                      }
                    >
                      Enter your 10-digit
                      Nigerian mobile
                      number without the
                      leading 0.
                    </p>
                  )}
                </div>

                {/* DATE OF BIRTH */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="dateOfBirth">
                    Date of Birth
                  </label>

                  <div
                    className={
                      styles.dateField
                    }
                  >
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={
                        form.dateOfBirth
                      }
                      max={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) =>
                        updateField(
                          "dateOfBirth",
                          event.target.value
                        )
                      }
                    />

                    <span
                      className={
                        styles.dateIcon
                      }
                    >
                      <Icon
                        name="calendar"
                        size={17}
                      />
                    </span>
                  </div>
                </div>

                {/* ADDRESS */}

                <div
                  className={`${styles.field} ${styles.fullWidth}`}
                >
                  <label htmlFor="address">
                    Residential Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    value={
                      form.residentialAddress
                    }
                    onChange={(event) =>
                      updateField(
                        "residentialAddress",
                        event.target.value
                      )
                    }
                    autoComplete="street-address"
                    placeholder="Enter your residential address"
                  />
                </div>

                {/* NIGERIA LGA */}

                {isNigeria ? (
                  <div
                    className={
                      styles.field
                    }
                  >
                    <label htmlFor="localGovernment">
                      Local Government Area
                    </label>

                    <div
                      className={
                        styles.selectField
                      }
                    >
                      <select
                        id="localGovernment"
                        value={
                          form.localGovernment
                        }
                        onChange={(event) =>
                          updateField(
                            "localGovernment",
                            event.target.value
                          )
                        }
                        disabled={
                          !form.state
                        }
                      >
                        <option value="">
                          {form.state
                            ? "Select Local Government Area"
                            : "Select State first"}
                        </option>

                        {availableLgas.map(
                          (lga) => (
                            <option
                              key={lga}
                              value={lga}
                            >
                              {lga}
                            </option>
                          )
                        )}
                      </select>

                      <Icon
                        name="chevron"
                        size={17}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      styles.field
                    }
                  >
                    <label htmlFor="city">
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      value={
                        form.city
                      }
                      onChange={(event) =>
                        updateField(
                          "city",
                          event.target.value
                        )
                      }
                      autoComplete="address-level2"
                      placeholder="Enter your city"
                    />
                  </div>
                )}

                {/* STATE */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="state">
                    {isNigeria
                      ? "State"
                      : "State / Province / Region"}
                  </label>

                  {isNigeria ? (
                    <div
                      className={
                        styles.selectField
                      }
                    >
                      <select
                        id="state"
                        value={
                          form.state
                        }
                        onChange={(event) =>
                          handleStateChange(
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select State
                        </option>

                        {nigerianStates.map(
                          (state) => (
                            <option
                              key={state}
                              value={state}
                            >
                              {state}
                            </option>
                          )
                        )}
                      </select>

                      <Icon
                        name="chevron"
                        size={17}
                      />
                    </div>
                  ) : (
                    <input
                      id="state"
                      type="text"
                      value={
                        form.state
                      }
                      onChange={(event) =>
                        updateField(
                          "state",
                          event.target.value
                        )
                      }
                      autoComplete="address-level1"
                      placeholder="State, province or region"
                    />
                  )}
                </div>

                {/* COUNTRY */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="country">
                    Country
                  </label>

                  <div
                    className={
                      styles.selectField
                    }
                  >
                    <select
                      id="country"
                      value={
                        normalizeCountryCode(
                          form.country
                        )
                      }
                      onChange={(event) =>
                        handleCountryChange(
                          event.target.value
                        )
                      }
                    >
                      {countries.map(
                        (country) => (
                          <option
                            key={
                              country.code
                            }
                            value={
                              country.code
                            }
                          >
                            {
                              country.flag
                            }{" "}
                            {country.name}
                          </option>
                        )
                      )}
                    </select>

                    <Icon
                      name="chevron"
                      size={17}
                    />
                  </div>
                </div>

                {/* OCCUPATION */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="occupation">
                    Occupation
                  </label>

                  <input
                    id="occupation"
                    type="text"
                    value={
                      form.occupation
                    }
                    onChange={(event) =>
                      updateField(
                        "occupation",
                        event.target.value
                      )
                    }
                    placeholder="Enter your occupation"
                  />
                </div>

                {/* COMPANY */}

                <div
                  className={
                    styles.field
                  }
                >
                  <label htmlFor="company">
                    Company{" "}
                    <span>
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="company"
                    type="text"
                    value={
                      form.company
                    }
                    onChange={(event) =>
                      updateField(
                        "company",
                        event.target.value
                      )
                    }
                    placeholder="Enter your company"
                  />
                </div>
              </div>

              {/* FORM ACTIONS */}

              <div
                className={
                  styles.formActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/account"
                    )
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    styles.saveButton
                  }
                  onClick={
                    saveProfile
                  }
                  disabled={saving}
                >
                  <span>
                    {saving
                      ? "Saving..."
                      : "▣"}
                  </span>

                  <span>
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div
              className={
                styles.errorMessage
              }
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className={
                styles.successMessage
              }
            >
              {message}
            </div>
          )}

          <div
            className={
              styles.pageFooter
            }
          >
            You can manage security,
            connected accounts, and
            notification preferences in
            the{" "}
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings"
                )
              }
            >
              Settings
            </button>{" "}
            page.
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/verify"
            )
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>
            Verify
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>
            Properties
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>
            Reports
          </span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>
            Account
          </span>
        </button>
      </nav>
    </main>
  );
}