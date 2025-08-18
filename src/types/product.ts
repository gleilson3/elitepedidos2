export interface Product {
  id: string;
  name: string;
  category: 'acai' | 'combo' | 'milkshake' | 'vitamina';
  price: number;
  originalPrice?: number;
  pricePerGram?: number;
  description: string;
  image: string;
  sizes?: ProductSize[];
  weight?: number;
  complementGroups?: ComplementGroup[];
  availability?: ProductAvailability;
  isActive?: boolean;
  scheduledDays?: ScheduledDays; // Nova propriedade para dias programados
  is_weighable?: boolean; // Propriedade para produtos pesáveis
}

export interface ProductSize {
  id: string;
  name: string;
  price: number;
  ml?: number;
  description?: string;
}

export interface ProductAvailability {
  type: 'always' | 'scheduled' | 'specific_days'; // Novo tipo para dias específicos
  schedule?: WeeklySchedule;
  scheduledDays?: ScheduledDays;
}

export interface ScheduledDays {
  enabled: boolean;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

interface DaySchedule {
  enabled: boolean;
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
}

export interface ComplementGroup {
  id: string;
  name: string;
  required: boolean;
  minItems: number;
  maxItems: number;
  complements: Complement[];
}

export interface Complement {
  id: string;
  name: string;
  price: number;
  description?: string;
  isActive?: boolean;
}

export interface SelectedComplement {
  groupId: string;
  complementId: string;
  complement: Complement;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize?: ProductSize;
  selectedComplements: SelectedComplement[];
  quantity: number;
  weight?: number;
  totalPrice: number;
  observations?: string;
}

interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'admin';
}

export interface AdminSession {
  isAuthenticated: boolean;
  user?: AdminUser;
}