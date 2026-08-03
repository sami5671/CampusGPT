export const ROLE = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  SELLER: "seller",
};

export const DISCOUNT_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed Amount", value: "fixed" },
];

export enum PERMISSIONS {
  Dashboard = "dashboard",
  Order_Management = "order",
  Product_Management = "product",
  Pos_Management = "pos",
  Promotion_Management = "promotion",
  Health_And_Support_Section = "support",
  Blog_Management = "blog",
  System_Settings = "system",
  User_Management = "user",
  Business_Settings = "business",
  Report_And_Analytics = "analytics",
  ALL = "all",
  Third_Party_Setup = "third_party",
  Themes_And_Addons = "addons",
}

export const defaultLocale = "en";

export const COOKIE_NAME = "NEXT_LOCALE";

export const allRoutes = {
  comboOffer: "/combo-offer",
  trackOrder: "/track-order",
  brands: "/brands",
  contact: "/contact-us",
  becomeASeller: "/become-a-seller",
  termsConditions: "/terms-conditions",
  privacyPolicy: "/privacy-policy",
  refundPolicy: "/refund-policy",
  sellerPolicy: "/seller-policy",
  shippingDelivery: "/shipping-delivery",
  returnRefund: "/return-refund",
  sellerLogin: "/seller-login",
  wishlist: "/wishlist",
  orders: "/orders",
  products: "/product-list",
  bestSellers: "/product-list",
  sellerProfile: "/seller-profile",
  categories: "/categories",
  login: "/login",
  howToSell: "/how-to-sell",
  support: "/support",
  cart: "/cart",
  checkout: "/checkout",
};

export const cacheTags = {
  adminProfile: "admin-profile",
  manageTeamMember: "manage-team-member",
};

export const tableIds = {
  productCategory: "product-category",
  productBrand: "product-brand",
  productAttribute: "product-attribute",
};

export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export enum SellerAccountStatus {
  LIVE = "live",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
  ON_VACATION = "on_vacation",
}
export enum ORDER_ACTIVITY_LOG_TYPE {
  ORDER = "ORDER",
  PRODUCT = "PRODUCT",
}
export enum ORDER_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum REFUND_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum REFUND_ITEM_STATUS {
  PENDING = "pending",
  REJECTED = "rejected",
  REFUNDED = "refunded",
}

export const ORDER_STATUS_OPTIONS = Object.values(ORDER_STATUS).map((value) => ({
  label: value,
  value,
}));

export const REFUND_STATUS_OPTIONS = Object.values(REFUND_STATUS).map((value) => ({
  label: value,
  value,
}));

export enum SellerVerificationStatus {
  VERIFIED = "verified",
  REJECTED = "rejected",
  NON_VERIFIED = "non_verified",
}

export enum PaymentMethodType {
  BKASH = "bkash",
  BANK = "bank",
  CASH = "cash",
}

export enum ShopType {
  INHOUSE = "inhouse",
  DEFAULT = "default",
}

export enum DisputeStatus {
  PROCESSING = "processing",
  RESOLVED = "resolved",
}

export enum BusinessType {
  PRIVATE_LIMITED_COMPANY = "private_limited_company",
  PUBLIC_LIMITED_COMPANY = "public_limited_company",
  INDIVIDUAL = "individual",
  SOLE_PROPRIETORSHIP = "sole_proprietorship",
  COMPANIES_LIMITED_BY_GUARANTEE = "companies_limited_by_guarantee",
  COMPANY_WITH_UNLIMITED_LIABILITY = "company_with_unlimited_liability",
}

export enum IdentityType {
  NID = "nid",
  PASSPORT = "passport",
}

export const identityTypeOptions = Object.values(IdentityType).map((value) => ({
  label: value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
  value,
}));

export const storeCategories = [
  { label: "Private Limited Company", value: "private_limited_company" },
  { label: "Public Limited Company", value: "public_limited_company" },
  { label: "Individual", value: "individual" },
  { label: "Companies limited by guarantee", value: "companies_limited_by_guarantee" },
  { label: "Companies with unlimited liabilities", value: "companies_with_unlimited_liabilities" },
  { label: "Sole Proprietorship", value: "sole_proprietorship" },
];

export enum BannerType {
  MAIN_SECTION_BANNER = "MAIN_SECTION_BANNER",
  FLASH_SALE = "FLASH_SALE",
  COMBO_OFFER = "COMBO_OFFER",
  BEST_DEAL = "BEST_DEAL",
}

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export const PAYMENT_STATUS_OPTIONS = Object.values(PAYMENT_STATUS).map((value) => ({
  label: value,
  value,
}));

export enum PAYMENT_METHOD {
  CASH = "CASH",
  CARD = "CARD",
  NET_BANKING = "NET_BANKING",
}

export const PAYMENT_METHOD_OPTIONS = Object.values(PAYMENT_METHOD).map((value) => ({
  label: value,
  value,
}));

export enum UNIT {
  PC = "pc",
  KG = "kg",
  LITER = "liter",
}

export enum DISCOUNT_TYPE {
  PERCENTAGE = "percentage",
  FLAT = "flat",
}

export enum PRODUCT_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}

export const PRODUCT_STATUS_OPTIONS = Object.values(PRODUCT_STATUS).map((value) => ({
  label: value,
  value,
}));

export enum UPDATE_REQUEST_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum Weight {
  LIGHTWEIGHT = "lightweight",
  MEDIUMWEIGHT = "mediumweight",
  HEAVYWEIGHT = "heavyweight",
}
