import wilayasData from './wilayas.json';
import communesData from './communes.json';

export interface Wilaya {
  id: string;
  code: string;
  name: string;
  ar_name: string;
  longitude: string;
  latitude: string;
}

export interface Commune {
  id: string;
  post_code: string;
  name: string;
  wilaya_id: string;
  ar_name: string;
  longitude: string;
  latitude: string;
}

const ALL_WILAYAS = wilayasData as Wilaya[];
const ALL_COMMUNES = communesData as Commune[];

export const DELIVERY_WILAYA_CODES = ['2', '9', '15', '16', '26', '31', '35', '42', '44', '48'];

export const DELIVERY_WILAYAS: Wilaya[] = DELIVERY_WILAYA_CODES
  .map(code => ALL_WILAYAS.find(w => w.code === code))
  .filter((w): w is Wilaya => !!w);

export const getCommunesByWilaya = (wilayaCode: string): Commune[] =>
  ALL_COMMUNES.filter(c => c.wilaya_id === wilayaCode);
