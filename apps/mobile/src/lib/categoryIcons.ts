/** Icon cho loại đồ (chip lọc ở K3 và khay của trình chỉnh sửa). */
import { Books, Chair, Couch, Lamp, SquaresFour, Table, type Icon as PhosphorIcon } from 'phosphor-react-native';

import type { ProductCategory } from '@/types';

export const CATEGORY_ICON: Record<ProductCategory, PhosphorIcon> = {
  sofa: Couch,
  table: Table,
  lamp: Lamp,
  shelf: Books,
  chair: Chair,
};

export const ALL_CATEGORIES_ICON: PhosphorIcon = SquaresFour;
