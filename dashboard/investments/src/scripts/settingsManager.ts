// src/scripts/settingsManager.ts

/**
 * Interfaz para los datos de perfil del usuario
 */
export interface UserProfile {
  name: string;
  email: string;
  country: string;
  avatar?: string;
}

/**
 * Interfaz para una cuenta bancaria
 */
export interface BankAccount {
  id: number;
  bank: string;
  accountNumber: string;
  primary: boolean;
}

/**
 * Interfaz para una tarjeta de crédito
 */
export interface CreditCard {
  id: number;
  type: string;
  number: string;
  expiry: string;
}

/**
 * Interfaz para una billetera digital
 */
export interface DigitalWallet {
  id: number;
  type: string;
  email: string;
  connected: boolean;
}

/**
 * Interfaz para los métodos de pago
 */
export interface PaymentMethods {
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  digitalWallets: DigitalWallet[];
}

/**
 * Interfaz para la configuración de seguridad
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastLogin: string;
  devices: {
    id: number;
    name: string;
    lastActive: string;
  }[];
}

/**
 * Interfaz para las preferencias generales
 */
export interface UserPreferences {
  language: string;
  darkMode: boolean;
  emailNotifications: boolean;
  investmentAlerts: boolean;
}

/**
 * Interfaz para las preferencias de inversión
 */
export interface InvestmentPreferences {
  riskTolerance: string;
  preferredAssets: string[];
  autoInvest: boolean;
  monthlyContribution: number;
}

/**
 * Interfaz para todos los datos de configuración
 */
export interface SettingsData {
  profile: UserProfile;
  paymentMethods: PaymentMethods;
  security: SecuritySettings;
  preferences: UserPreferences;
  investmentPreferences: InvestmentPreferences;
}

// Clave para almacenar los datos en localStorage
const SETTINGS_STORAGE_KEY = 'userSettings';

// Datos de ejemplo para usar como valores predeterminados
const defaultSettings: SettingsData = {
  profile: {
    name: "Usuario de Ejemplo",
    email: "usuario@ejemplo.com",
    country: "España"
  },
  paymentMethods: {
    bankAccounts: [
      { id: 1, bank: "Banco Santander", accountNumber: "ES91 2100 0418 4502 0005 1332", primary: true }
    ],
    creditCards: [
      { id: 1, type: "Visa", number: "**** **** **** 4242", expiry: "12/28" }
    ],
    digitalWallets: [
      { id: 1, type: "PayPal", email: "usuario@ejemplo.com", connected: true },
      { id: 2, type: "Binance", email: "usuario@ejemplo.com", connected: false }
    ]
  },
  security: {
    twoFactorEnabled: false,
    lastLogin: new Date().toLocaleString(),
    devices: [
      { id: 1, name: "Dispositivo actual", lastActive: "Ahora" }
    ]
  },
  preferences: {
    language: "es",
    darkMode: true,
    emailNotifications: true,
    investmentAlerts: true
  },
  investmentPreferences: {
    riskTolerance: "Moderado",
    preferredAssets: ["Propiedades", "Acciones"],
    autoInvest: false,
    monthlyContribution: 0
  }
};

/**
 * Carga los datos de configuración desde localStorage
 * @returns {SettingsData} Los datos de configuración
 */
export function loadSettings(): SettingsData {
  try {
    const storedData = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData) as SettingsData;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
}

/**
 * Guarda los datos de configuración en localStorage
 * @param {SettingsData} settings Los datos de configuración a guardar
 */
export function saveSettings(settings: SettingsData): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Actualiza el perfil del usuario
 * @param {UserProfile} profile El perfil actualizado
 */
export function updateProfile(profile: UserProfile): void {
  const settings = loadSettings();
  settings.profile = { ...settings.profile, ...profile };
  saveSettings(settings);
}

/**
 * Añade una nueva cuenta bancaria
 * @param {Omit<BankAccount, 'id'>} account La cuenta bancaria a añadir
 * @returns {BankAccount} La cuenta bancaria añadida con ID
 */
export function addBankAccount(account: Omit<BankAccount, 'id'>): BankAccount {
  const settings = loadSettings();
  const newId = settings.paymentMethods.bankAccounts.length > 0 
    ? Math.max(...settings.paymentMethods.bankAccounts.map(a => a.id)) + 1 
    : 1;
  
  const newAccount = { ...account, id: newId };
  settings.paymentMethods.bankAccounts.push(newAccount);
  saveSettings(settings);
  return newAccount;
}

/**
 * Elimina una cuenta bancaria
 * @param {number} id El ID de la cuenta bancaria a eliminar
 */
export function removeBankAccount(id: number): void {
  const settings = loadSettings();
  settings.paymentMethods.bankAccounts = settings.paymentMethods.bankAccounts.filter(
    account => account.id !== id
  );
  saveSettings(settings);
}

/**
 * Añade una nueva tarjeta de crédito
 * @param {Omit<CreditCard, 'id'>} card La tarjeta de crédito a añadir
 * @returns {CreditCard} La tarjeta de crédito añadida con ID
 */
export function addCreditCard(card: Omit<CreditCard, 'id'>): CreditCard {
  const settings = loadSettings();
  const newId = settings.paymentMethods.creditCards.length > 0 
    ? Math.max(...settings.paymentMethods.creditCards.map(c => c.id)) + 1 
    : 1;
  
  const newCard = { ...card, id: newId };
  settings.paymentMethods.creditCards.push(newCard);
  saveSettings(settings);
  return newCard;
}

/**
 * Elimina una tarjeta de crédito
 * @param {number} id El ID de la tarjeta de crédito a eliminar
 */
export function removeCreditCard(id: number): void {
  const settings = loadSettings();
  settings.paymentMethods.creditCards = settings.paymentMethods.creditCards.filter(
    card => card.id !== id
  );
  saveSettings(settings);
}

/**
 * Añade una nueva billetera digital
 * @param {Omit<DigitalWallet, 'id'>} wallet La billetera digital a añadir
 * @returns {DigitalWallet} La billetera digital añadida con ID
 */
export function addDigitalWallet(wallet: Omit<DigitalWallet, 'id'>): DigitalWallet {
  const settings = loadSettings();
  const newId = settings.paymentMethods.digitalWallets.length > 0 
    ? Math.max(...settings.paymentMethods.digitalWallets.map(w => w.id)) + 1 
    : 1;
  
  const newWallet = { ...wallet, id: newId };
  settings.paymentMethods.digitalWallets.push(newWallet);
  saveSettings(settings);
  return newWallet;
}

/**
 * Elimina una billetera digital
 * @param {number} id El ID de la billetera digital a eliminar
 */
export function removeDigitalWallet(id: number): void {
  const settings = loadSettings();
  settings.paymentMethods.digitalWallets = settings.paymentMethods.digitalWallets.filter(
    wallet => wallet.id !== id
  );
  saveSettings(settings);
}

/**
 * Actualiza la configuración de seguridad
 * @param {Partial<SecuritySettings>} securitySettings La configuración de seguridad actualizada
 */
export function updateSecuritySettings(securitySettings: Partial<SecuritySettings>): void {
  const settings = loadSettings();
  settings.security = { ...settings.security, ...securitySettings };
  saveSettings(settings);
}

/**
 * Elimina un dispositivo
 * @param {number} id El ID del dispositivo a eliminar
 */
export function removeDevice(id: number): void {
  const settings = loadSettings();
  settings.security.devices = settings.security.devices.filter(
    device => device.id !== id
  );
  saveSettings(settings);
}

/**
 * Actualiza las preferencias del usuario
 * @param {Partial<UserPreferences>} preferences Las preferencias actualizadas
 */
export function updatePreferences(preferences: Partial<UserPreferences>): void {
  const settings = loadSettings();
  settings.preferences = { ...settings.preferences, ...preferences };
  saveSettings(settings);
}

/**
 * Actualiza las preferencias de inversión
 * @param {Partial<InvestmentPreferences>} preferences Las preferencias de inversión actualizadas
 */
export function updateInvestmentPreferences(preferences: Partial<InvestmentPreferences>): void {
  const settings = loadSettings();
  settings.investmentPreferences = { ...settings.investmentPreferences, ...preferences };
  saveSettings(settings);
}
