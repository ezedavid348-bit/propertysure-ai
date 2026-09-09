/* =========================================================
   ADD PROPERTY
   PropertySure AI
   ========================================================= */

"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import AppShell from "../../AppShell/AppShell";

import { supabase } from "../../lib/supabase";

import styles from "./add-property.module.css";

type Relationship =
  | "owner"
  | "buyer"
  | "agent"
  | "manager"
  | "other";

const relationshipOptions: {
  value: Relationship;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "owner",
    title: "I own this property",
    description:
      "I have already purchased or own this property.",
    icon: "⌂",
  },
  {
    value: "buyer",
    title: "I'm considering buying it",
    description:
      "I'm evaluating this property before purchasing it.",
    icon: "⌕",
  },
  {
    value: "agent",
    title: "I'm an agent",
    description:
      "I'm representing or listing this property.",
    icon: "♙",
  },
  {
    value: "manager",
    title: "I'm managing/developing it",
    description:
      "I manage, develop, or oversee this property.",
    icon: "▣",
  },
  {
    value: "other",
    title: "Other",
    description:
      "Another reason for keeping track of this property.",
    icon: "•••",
  },
];

const propertyTypes = [
  "Land",
  "Residential",
  "Commercial",
  "Industrial",
  "Mixed Use",
  "Estate / Development",
  "Other",
];

const states = [
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
  "Federal Capital Territory",
];

/* =========================================================
   NIGERIA STATE → LGA / AREA COUNCIL DATA
   ========================================================= */

const lgasByState: Record<string, string[]> = {
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
    "Umunneochi",
  ],

  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Gayuk",
    "Gombi",
    "Grie",
    "Hong",
    "Jada",
    "Jimeta",
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
    "Ibiono-Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat-Enin",
    "Nsit-Atai",
    "Nsit-Ibom",
    "Nsit-Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung-Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],

  Anambra: [
    "Aguata",
    "Awka North",
    "Awka South",
    "Anambra East",
    "Anambra West",
    "Anaocha",
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
    "Oturkpo",
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
    "Yakuur",
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
    "Ido-Osi",
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
    "Igbo-Etiti",
    "Igbo-Eze North",
    "Igbo-Eze South",
    "Isi-Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
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
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte Mbaise",
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
    "Dutsin-Ma",
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
    "Dank-Wasagu",
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
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko/Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Sagamu",
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
    "Ayedaade",
    "Ayedire",
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
    "Oriire",
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
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
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
    "Wamako",
    "Wurno",
    "Yabo",
  ],

  Taraba: [
    "Ardo Kola",
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
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],

  "Federal Capital Territory": [
    "Abuja Municipal Area Council",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
  ],
};

export default function AddPropertyPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [propertyName, setPropertyName] =
    useState("");

  const [propertyType, setPropertyType] =
    useState("");

  const [relationship, setRelationship] =
    useState<Relationship | null>(null);

  const [ownerName, setOwnerName] =
    useState("");

  const [ownerContact, setOwnerContact] =
    useState("");

  const [propertyImage, setPropertyImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [state, setState] =
    useState("");

  const [lga, setLga] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [size, setSize] =
    useState("");

  const [askingPrice, setAskingPrice] =
    useState("");

  const [description, setDescription] =
    useState("");

  /* =========================================================
     AUTHENTICATION
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          console.error(
            "Add Property getUser error:",
            error
          );

          router.replace("/signin");
          return;
        }

        if (!user) {
          router.replace("/signin");
          return;
        }

        setLoadingUser(false);
      } catch (error) {
        console.error(
          "Add Property authentication error:",
          error
        );

        if (mounted) {
          router.replace("/signin");
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =========================================================
     IMAGE PREVIEW CLEANUP
     ========================================================= */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  /* =========================================================
     STATE
     ========================================================= */

  const handleStateChange = (
    value: string
  ) => {
    setState(value);
    setLga("");
    setErrorMessage("");
  };

  /* =========================================================
     RELATIONSHIP
     ========================================================= */

  const handleRelationshipChange = (
    value: Relationship
  ) => {
    setRelationship(value);
    setErrorMessage("");
  };

  /* =========================================================
     PROPERTY IMAGE SELECTION
     ========================================================= */

  const handlePropertyImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      setErrorMessage(
        "Please select a JPG, PNG, or WEBP property image."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        "Property image must be 5MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPropertyImage(file);
    setImagePreview(previewUrl);
  };

  /* =========================================================
     REMOVE PROPERTY IMAGE
     ========================================================= */

  const handleRemovePropertyImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setPropertyImage(null);
    setImagePreview("");
    setErrorMessage("");

    const input =
      document.getElementById(
        "propertyImage"
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  };

  /* =========================================================
     SAFE UNIQUE ID
     
     IMPORTANT:
     crypto.randomUUID() is not available in some
     mobile browsers / local development environments.

     We therefore use it when available and fall
     back to a compatible timestamp + random string.
     ========================================================= */

  const createUniqueId = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 12)}`;
  };

  /* =========================================================
     SAVE PROPERTY
     ========================================================= */

  const handleSaveProperty = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    /* -------------------------------------------------------
       CLIENT VALIDATION
       ------------------------------------------------------- */

    if (!propertyName.trim()) {
      setErrorMessage(
        "Please enter a property name or title."
      );
      return;
    }

    if (!propertyType) {
      setErrorMessage(
        "Please select a property type."
      );
      return;
    }

    if (!relationship) {
      setErrorMessage(
        "Please tell us how you are connected to this property."
      );
      return;
    }

    if (!state) {
      setErrorMessage(
        "Please select the property state."
      );
      return;
    }

    if (!lga) {
      setErrorMessage(
        "Please select the property LGA / Area Council."
      );
      return;
    }

    if (!address.trim()) {
      setErrorMessage(
        "Please enter the property address or location."
      );
      return;
    }

    setSaving(true);

    let uploadedImagePath:
      | string
      | null = null;

    try {
      /* -----------------------------------------------------
         STEP 1 — GET CURRENT USER
         ----------------------------------------------------- */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Supabase authentication error:",
          userError
        );

        setErrorMessage(
          `Authentication error: ${userError.message}`
        );

        return;
      }

      if (!user) {
        router.replace("/signin");
        return;
      }

      console.log(
        "Add Property — authenticated user:",
        user.id
      );

      /* -----------------------------------------------------
         STEP 2 — UPLOAD PROPERTY IMAGE
         ----------------------------------------------------- */

      let imageUrl:
        | string
        | null = null;

      if (propertyImage) {
        console.log(
          "Add Property — image selected:",
          {
            name: propertyImage.name,
            type: propertyImage.type,
            size: propertyImage.size,
          }
        );

        const extension =
          propertyImage.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const allowedExtensions = [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ];

        if (
          !allowedExtensions.includes(
            extension
          )
        ) {
          setErrorMessage(
            "Unsupported image format. Please use JPG, PNG, or WEBP."
          );

          return;
        }

        /*
         * FIX:
         *
         * Previously:
         *
         * crypto.randomUUID()
         *
         * That caused the iPhone error:
         *
         * "crypto.randomUUID is not a function"
         *
         * We now use the compatibility helper.
         */

        const imageFileName =
          `${createUniqueId()}.${extension}`;

        /*
         * Supabase Storage path:
         *
         * USER_ID / properties / IMAGE_FILE
         *
         * Example:
         *
         * 123456/properties/abc123.jpg
         */

        uploadedImagePath =
          `${user.id}/properties/${imageFileName}`;

        console.log(
          "Add Property — upload path:",
          uploadedImagePath
        );

        const {
          data: uploadData,
          error: imageUploadError,
        } = await supabase.storage
          .from("property-images")
          .upload(
            uploadedImagePath,
            propertyImage,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                propertyImage.type,
            }
          );

        if (imageUploadError) {
          console.error(
            "PROPERTY IMAGE UPLOAD FAILED:",
            imageUploadError
          );

          setErrorMessage(
            `Image upload failed: ${imageUploadError.message}`
          );

          uploadedImagePath = null;

          return;
        }

        console.log(
          "Add Property — image upload successful:",
          uploadData
        );

        /* ---------------------------------------------------
           STEP 3 — GET PUBLIC IMAGE URL
           --------------------------------------------------- */

        const {
          data: publicImageData,
        } = supabase.storage
          .from("property-images")
          .getPublicUrl(
            uploadedImagePath
          );

        if (
          !publicImageData?.publicUrl
        ) {
          console.error(
            "Could not generate public image URL."
          );

          await supabase.storage
            .from("property-images")
            .remove([
              uploadedImagePath,
            ]);

          uploadedImagePath = null;

          setErrorMessage(
            "The property image uploaded, but PropertySure AI could not create its image URL. Please try again."
          );

          return;
        }

        imageUrl =
          publicImageData.publicUrl;

        console.log(
          "Add Property — public image URL:",
          imageUrl
        );
      }

      /* -----------------------------------------------------
         STEP 4 — CREATE PROPERTY RECORD
         ----------------------------------------------------- */

      console.log(
        "Add Property — creating database record..."
      );

      const {
        data,
        error: propertyInsertError,
      } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,

          name:
            propertyName.trim(),

          property_type:
            propertyType,

          relationship,

          owner_name:
            ownerName.trim() || null,

          owner_contact:
            ownerContact.trim() || null,

          image_url:
            imageUrl,

          state,

          lga,

          address:
            address.trim(),

          size:
            size.trim() || null,

          asking_price:
            askingPrice.trim() || null,

          description:
            description.trim() || null,

          verification_status:
            "not_verified",
        })
        .select("id")
        .single();

      /* -----------------------------------------------------
         STEP 5 — DATABASE ERROR
         ----------------------------------------------------- */

      if (propertyInsertError) {
        console.error(
          "PROPERTY DATABASE INSERT FAILED:",
          propertyInsertError
        );

        /*
         * If the image uploaded successfully but
         * the database record failed, remove the
         * image so we don't leave orphaned files.
         */

        if (uploadedImagePath) {
          console.log(
            "Removing orphaned uploaded image:",
            uploadedImagePath
          );

          const {
            error: removeError,
          } = await supabase.storage
            .from("property-images")
            .remove([
              uploadedImagePath,
            ]);

          if (removeError) {
            console.error(
              "Could not remove orphaned image:",
              removeError
            );
          }
        }

        setErrorMessage(
          `Property could not be saved: ${propertyInsertError.message}`
        );

        return;
      }

      /* -----------------------------------------------------
         STEP 6 — SUCCESS
         ----------------------------------------------------- */

      console.log(
        "Add Property — property created successfully:",
        data?.id
      );

      setSuccessMessage(
        "Property added successfully."
      );

      setTimeout(() => {
        if (data?.id) {
          router.push(
            `/my-properties/${data.id}`
          );
        } else {
          router.push(
            "/my-properties"
          );
        }
      }, 700);
    } catch (error) {
      console.error(
        "UNEXPECTED ADD PROPERTY ERROR:",
        error
      );

      /*
       * If something unexpected happened after
       * the image was uploaded, clean it up.
       */

      if (uploadedImagePath) {
        try {
          await supabase.storage
            .from("property-images")
            .remove([
              uploadedImagePath,
            ]);
        } catch (cleanupError) {
          console.error(
            "Image cleanup error:",
            cleanupError
          );
        }
      }

      if (
        error instanceof Error
      ) {
        setErrorMessage(
          `Unexpected error: ${error.message}`
        );
      } else {
        setErrorMessage(
          "An unexpected error occurred while adding the property."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
     Exact Dashboard / Verify treatment
     ========================================================= */

  if (loadingUser) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
        </p>
      </main>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <AppShell
      activePath="/my-properties"
    >
      <main
        className={styles.page}
      >
        <div
          className={styles.content}
        >
          {/* PAGE HEADER */}

          <div
            className={
              styles.pageHeader
            }
          >
            <div
              className={
                styles.headingBlock
              }
            >
              <h1>
                Add Property
              </h1>

              <p>
                Add a property to your
                portfolio. You can verify
                it whenever you are ready.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.backButton
              }
              onClick={() =>
                router.push(
                  "/my-properties"
                )
              }
            >
              <span aria-hidden="true">
                ←
              </span>

              Back to My Properties
            </button>
          </div>

          <form
            className={styles.form}
            onSubmit={
              handleSaveProperty
            }
          >
            {/* STEP INDICATOR */}

            <div
              className={
                styles.stepper
              }
            >
              <div
                className={`${styles.step} ${styles.activeStep}`}
              >
                <span
                  className={
                    styles.stepNumber
                  }
                >
                  1
                </span>

                <div>
                  <strong>
                    Property Information
                  </strong>

                  <span>
                    Basic details
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.stepLine
                }
              />

              <div
                className={
                  styles.step
                }
              >
                <span
                  className={
                    styles.stepNumber
                  }
                >
                  2
                </span>

                <div>
                  <strong>
                    Location & Details
                  </strong>

                  <span>
                    Property location
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.stepLine
                }
              />

              <div
                className={
                  styles.step
                }
              >
                <span
                  className={
                    styles.stepNumber
                  }
                >
                  3
                </span>

                <div>
                  <strong>
                    Review & Save
                  </strong>

                  <span>
                    Confirm information
                  </span>
                </div>
              </div>
            </div>

            {/* BASIC INFORMATION */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div>
                  <h2>
                    Basic Information
                  </h2>

                  <p>
                    Tell us about the
                    property you want to
                    add.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.formGrid
                }
              >
                {/* PROPERTY IMAGE */}

                <div
                  className={`${styles.fullWidth} ${styles.imageField}`}
                >
                  <label htmlFor="propertyImage">
                    Property Image
                    <small>
                      Optional
                    </small>
                  </label>

                  <p
                    className={
                      styles.fieldDescription
                    }
                  >
                    Add a photo of the property.
                    This image will appear on
                    your property record and
                    Property Details page.
                  </p>

                  <div
                    className={
                      styles.imageUpload
                    }
                  >
                    {imagePreview ? (
                      <div
                        className={
                          styles.imagePreviewWrapper
                        }
                      >
                        <img
                          src={
                            imagePreview
                          }
                          alt="Property preview"
                          className={
                            styles.imagePreview
                          }
                        />

                        <div
                          className={
                            styles.imagePreviewOverlay
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.changeImageButton
                            }
                            onClick={() =>
                              document
                                .getElementById(
                                  "propertyImage"
                                )
                                ?.click()
                            }
                          >
                            Change Image
                          </button>

                          <button
                            type="button"
                            className={
                              styles.removeImageButton
                            }
                            onClick={
                              handleRemovePropertyImage
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="propertyImage"
                        className={
                          styles.imageUploadBox
                        }
                      >
                        <span
                          className={
                            styles.imageUploadIcon
                          }
                          aria-hidden="true"
                        >
                          +
                        </span>

                        <strong>
                          Add property image
                        </strong>

                        <small>
                          JPG, PNG or WEBP ·
                          Maximum 5MB
                        </small>
                      </label>
                    )}

                    <input
                      id="propertyImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handlePropertyImageChange
                      }
                      className={
                        styles.hiddenFileInput
                      }
                    />
                  </div>
                </div>

                {/* PROPERTY NAME */}

                <div
                  className={
                    styles.fullWidth
                  }
                >
                  <label htmlFor="propertyName">
                    Property Name / Title
                    <span>*</span>
                  </label>

                  <input
                    id="propertyName"
                    type="text"
                    value={
                      propertyName
                    }
                    onChange={(event) =>
                      setPropertyName(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 4 Bedroom Duplex, Residential Plot, Commercial Building"
                  />
                </div>

                {/* PROPERTY TYPE */}

                <div>
                  <label htmlFor="propertyType">
                    Property Type
                    <span>*</span>
                  </label>

                  <select
                    id="propertyType"
                    value={
                      propertyType
                    }
                    onChange={(event) =>
                      setPropertyType(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select property type
                    </option>

                    {propertyTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* RELATIONSHIP */}

              <div
                className={
                  styles.relationshipSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <h3>
                    How are you connected
                    to this property?
                  </h3>

                  <span>*</span>
                </div>

                <p
                  className={
                    styles.sectionDescription
                  }
                >
                  This helps PropertySure
                  AI understand the context
                  of the property. You do not
                  have to already own it.
                </p>

                <div
                  className={
                    styles.relationshipGrid
                  }
                >
                  {relationshipOptions.map(
                    (option) => {
                      const selected =
                        relationship ===
                        option.value;

                      return (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          className={`${styles.relationshipCard} ${
                            selected
                              ? styles.relationshipCardSelected
                              : ""
                          }`}
                          onClick={() =>
                            handleRelationshipChange(
                              option.value
                            )
                          }
                        >
                          <span
                            className={
                              styles.relationshipIcon
                            }
                          >
                            {
                              option.icon
                            }
                          </span>

                          <span
                            className={
                              styles.relationshipText
                            }
                          >
                            <strong>
                              {
                                option.title
                              }
                            </strong>

                            <small>
                              {
                                option.description
                              }
                            </small>
                          </span>

                          {selected && (
                            <span
                              className={
                                styles.selectedCheck
                              }
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* OWNER / SELLER */}

              <div
                className={
                  styles.ownerSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <h3>
                    Owner / Seller Information
                  </h3>

                  <span
                    className={
                      styles.optionalLabel
                    }
                  >
                    Optional
                  </span>
                </div>

                <p
                  className={
                    styles.sectionDescription
                  }
                >
                  If you know the property
                  owner or seller, you can
                  record their details here.
                  This does not have to be
                  your name.
                </p>

                <div
                  className={
                    styles.formGrid
                  }
                >
                  <div>
                    <label htmlFor="ownerName">
                      Owner / Seller Name
                      <small>
                        Optional
                      </small>
                    </label>

                    <input
                      id="ownerName"
                      type="text"
                      value={
                        ownerName
                      }
                      onChange={(event) =>
                        setOwnerName(
                          event.target.value
                        )
                      }
                      placeholder="Enter owner or seller name"
                    />
                  </div>

                  <div>
                    <label htmlFor="ownerContact">
                      Owner / Seller Contact
                      <small>
                        Optional
                      </small>
                    </label>

                    <input
                      id="ownerContact"
                      type="text"
                      value={
                        ownerContact
                      }
                      onChange={(event) =>
                        setOwnerContact(
                          event.target.value
                        )
                      }
                      placeholder="Phone number or email"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION & DETAILS */}

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardHeader
                }
              >
                <div>
                  <h2>
                    Location & Details
                  </h2>

                  <p>
                    Add the information you
                    currently have. Optional
                    fields can be completed
                    later.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.formGrid
                }
              >
                {/* STATE */}

                <div>
                  <label htmlFor="state">
                    State
                    <span>*</span>
                  </label>

                  <select
                    id="state"
                    value={state}
                    onChange={(event) =>
                      handleStateChange(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select state
                    </option>

                    {states.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* LGA */}

                <div>
                  <label htmlFor="lga">
                    LGA / Area Council
                    <span>*</span>
                  </label>

                  <select
                    id="lga"
                    value={lga}
                    onChange={(event) =>
                      setLga(
                        event.target.value
                      )
                    }
                    disabled={!state}
                  >
                    <option value="">
                      {state
                        ? "Select LGA / Area Council"
                        : "Select state first"}
                    </option>

                    {state &&
                      lgasByState[
                        state
                      ]?.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                  </select>

                  <small
                    className={
                      styles.fieldHint
                    }
                  >
                    Select a state first to
                    see the available LGAs or
                    Area Councils.
                  </small>
                </div>

                {/* ADDRESS */}

                <div
                  className={
                    styles.fullWidth
                  }
                >
                  <label htmlFor="address">
                    Address / District /
                    Location
                    <span>*</span>
                  </label>

                  <input
                    id="address"
                    type="text"
                    value={
                      address
                    }
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    placeholder="e.g. No. 2 Guzape District, Abuja or nearest landmark"
                  />

                  <small
                    className={
                      styles.fieldHint
                    }
                  >
                    You can enter the district,
                    street, plot number,
                    landmark, or other
                    location information here.
                  </small>
                </div>

                {/* SIZE */}

                <div>
                  <label htmlFor="size">
                    Property Size
                    <small>
                      Optional
                    </small>
                  </label>

                  <input
                    id="size"
                    type="text"
                    value={size}
                    onChange={(event) =>
                      setSize(
                        event.target.value
                      )
                    }
                    placeholder="e.g. 600 sqm, 2 acres"
                  />
                </div>

                {/* ASKING PRICE */}

                <div>
                  <label htmlFor="askingPrice">
                    Asking Price
                    <small>
                      Optional
                    </small>
                  </label>

                  <input
                    id="askingPrice"
                    type="text"
                    value={
                      askingPrice
                    }
                    onChange={(event) =>
                      setAskingPrice(
                        event.target.value
                      )
                    }
                    placeholder="e.g. ₦25,000,000"
                  />
                </div>

                {/* DESCRIPTION */}

                <div
                  className={
                    styles.fullWidth
                  }
                >
                  <label htmlFor="description">
                    Property Description
                    <small>
                      Optional
                    </small>
                  </label>

                  <textarea
                    id="description"
                    value={
                      description
                    }
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Write a short description about the property..."
                    rows={5}
                    maxLength={500}
                  />

                  <div
                    className={
                      styles.characterCount
                    }
                  >
                    {
                      description.length
                    }
                    /500
                  </div>
                </div>
              </div>
            </section>

            {/* VERIFICATION NOTICE */}

            <div
              className={
                styles.verificationNotice
              }
            >
              <div
                className={
                  styles.noticeIcon
                }
              >
                ✓
              </div>

              <div>
                <strong>
                  Verification can happen
                  later
                </strong>

                <p>
                  Adding a property does
                  not mean it has been
                  verified. You can save
                  this property now and
                  start verification from its
                  Property Details page
                  whenever you are ready.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {errorMessage && (
              <div
                className={
                  styles.errorMessage
                }
                role="alert"
              >
                <span
                  aria-hidden="true"
                >
                  !
                </span>

                <p>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div
                className={
                  styles.successMessage
                }
                role="status"
              >
                <span
                  aria-hidden="true"
                >
                  ✓
                </span>

                <p>
                  {successMessage}
                </p>
              </div>
            )}

            {/* ACTIONS */}

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
                  router.push(
                    "/my-properties"
                  )
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className={
                        styles.buttonSpinner
                      }
                    />

                    Saving Property...
                  </>
                ) : (
                  <>
                    Save Property

                    <span
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AppShell>
  );
}