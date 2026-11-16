import heroSuvImg from '../assets/images/exact_hero_indian_suvs_1794555115763.jpg';
import cretaImg from '../assets/images/exact_hyundai_creta_1794555111412.jpg';
import nexonImg from '../assets/images/exact_tata_nexon_1794555112575.jpg';
import seltosImg from '../assets/images/exact_kia_seltos_1794555111716.jpg';
import scorpionImg from '../assets/images/exact_mahindra_scorpion_1794555113510.jpg';
import brezzaImg from '../assets/images/exact_maruti_brezza_1794555112180.jpg';

export const HERO_IMAGE = heroSuvImg;

export const CAR_IMAGE_MAP: Record<string, string> = {
  creta: cretaImg,
  nexon: nexonImg,
  seltos: seltosImg,
  scorpion: scorpionImg,
  brezza: brezzaImg,
};

export function getCarImage(imageKey: string): string {
  return CAR_IMAGE_MAP[imageKey] || cretaImg;
}
