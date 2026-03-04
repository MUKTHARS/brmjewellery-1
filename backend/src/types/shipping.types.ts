export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  fullName: string;
  phone: string;
}

export interface ShippingLabel {
  courier: string;
  trackingNumber: string;
  labelUrl: string;
  estimatedDelivery?: Date;
}

export interface ShippingRate {
  method: string;
  name: string;
  price: number;
  daysMin: number;
  daysMax: number;
}

export interface TrackingUpdate {
  trackingNumber: string;
  courier: string;
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
}
