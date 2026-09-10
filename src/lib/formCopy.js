export const FORM_TITLE = "Захтев за гласање у иностранству";

export const HEADER_LINES = [
  "У складу са чланом 16. став 1. Закона о Јединственом бирачком списку („Службени",
  "гласник Републике Србије“ број 104/09,  99/11, 44/24 и 96/25) подносим:",
];

export const TITLE_LINES = [
  "З А Х Т Е В",
  "ЗА УПИС У БИРАЧКИ СПИСАК ПОДАТКА",
  "ДА ЋЕ БИРАЧ ГЛАСАТИ У ИНОСТРАНСТВУ",
];

export const FIELDS = [
  {
    id: "fullName",
    number: "1",
    label: "Име и презиме",
    helper: "Као у пасошу или личној карти",
    autoComplete: "name",
  },
  {
    id: "parentName",
    number: "2",
    label: "Име једног родитеља",
    helper: "Име оца или мајке",
    autoComplete: "off",
  },
  {
    id: "jmbg",
    number: "3",
    label: "Јединствени матични број грађана",
    helper: "13 цифара",
    autoComplete: "off",
    inputMode: "numeric",
  },
  {
    id: "serbiaAddress",
    number: "4",
    label: "Адреса пребивалишта у Р. Србији",
    helper: "Улица, број, место",
    autoComplete: "off",
  },
  {
    id: "abroadAddress",
    number: "5",
    label: "Адреса боравка у иностранству",
    helper: "Улица, број, град, држава",
    autoComplete: "street-address",
  },
  {
    id: "voteCityCountry",
    number: "6",
    label: "Град, држава – где желим да гласам у иностранству",
    helper: "Нпр. Франкфурт, Немачка",
    autoComplete: "off",
  },
];

export const PASSPORT_NOTE =
  "Уз захтев прилажем копију пасоша/личне карте Републике Србије.";

export const NOTE_LINES = [
  "Напомена: Образац попунити читко и унети све податке који се траже. Попуњен и потписан образац са копијом",
  "пасоша или личне карте доставити дипломатско-конзуларном представништву Републике Србије на један од",
  "следећих начина: лично - доласком у представништво, путем поште, телефакса или електронским путем.",
];

export const LABELS = {
  date: "(датум)",
  signature: "(потпис)",
  phone: "(контакт телефон)",
  email: "(и-мејл)",
};

export const EMPTY_FORM_VALUES = {
  fullName: "",
  parentName: "",
  jmbg: "",
  serbiaAddress: "",
  abroadAddress: "",
  voteCityCountry: "",
  date: "",
  phone: "",
  email: "",
};

export const REQUIRED_FIELD_IDS = [
  "fullName",
  "parentName",
  "jmbg",
  "serbiaAddress",
  "abroadAddress",
  "voteCityCountry",
  "date",
  "phone",
  "email",
];
