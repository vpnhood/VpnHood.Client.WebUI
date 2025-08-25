import { VBtn } from 'vuetify/components';

export const buttonAliases = Object.fromEntries(
  Array.from({ length: 7 }, (_, i) => [`BtnStyle${i + 1}`, VBtn])
);

const baseAlert = {
  icon: false,
  density: 'compact',
  rounded: 'lg',
  class: 'text-caption pt-1 text-start',
  VAlertTitle: { style: 'font-weight: 600; font-size: 0.9rem;' },
};

export const vuetifyDefaults = {
  VList: { class: 'py-0' },
  VDialog: {
    maxWidth: '500',
    VCard: {
      rounded: 'xl',
      VCardActions: {
        VBtn: {
          variant: 'text',
          rounded: 'pill',
          class: 'font-weight-bold text-transform-none',
          ripple: false,
        },
      },
    },
  },
  VBtn: { class: 'text-transform-none' },
  VSheet: { class: 'px-4 pb-4 fill-height', color: 'background' },
  VExpansionPanel: { ConfigCard: { color: 'config-card-on-expansion-panel' } },

  BtnStyle1: { variant: 'flat', rounded: 'pill', color: 'btn-style-1', class: 'text-transform-none font-weight-bold' },
  BtnStyle2: { variant: 'flat', rounded: 'pill', color: 'btn-style-2', class: 'btn-style-2 text-transform-none' },
  BtnStyle3: { variant: 'flat', rounded: 'pill', color: 'btn-style-3', class: 'text-transform-none' },
  BtnStyle4: { variant: 'tonal', color: 'btn-style-4', class: 'text-transform-none justify-space-between', block: true },
  BtnStyle5: { variant: 'tonal', rounded: 'pill', density: 'comfortable', color: 'btn-style-5', class: 'text-transform-none' },
  BtnStyle6: { variant: 'flat', rounded: 'pill', color: 'btn-style-6', class: 'text-transform-none' },
  BtnStyle7: { variant: 'text', rounded: '0', color: 'btn-style-7', class: 'text-transform-none justify-space-between', block: true },
  TonalIconBtn: { variant: 'tonal', size: '40', color: 'tonal-icon-btn' },

  ConfigCard: {
    color: 'config-card-bg',
    class: 'config-card',
    rounded: 'lg',
    VCardTitle: { class: 'd-flex justify-space-between align-center pt-3 pb-0' },
    VCardSubtitle: { class: 'text-disabled text-wrap text-caption' },
    VSwitch: { class: 'px-2', color: 'switch-btn', density: 'compact', hideDetails: true },
  },
  CardOnGrad: {
    variant: 'text',
    class: 'card-on-grad-bg',
    rounded: 'lg',
    VCardTitle: { class: 'd-flex justify-space-between align-center pt-3 pb-0' },
    VCardSubtitle: { class: 'text-disabled text-wrap text-caption' },
    VSwitch: { class: 'px-2', color: 'switch-btn', density: 'compact', hideDetails: true },
  },
  HomeConfigBtn: { block: true, variant: 'text', size: 'small', class: 'config-item' },
  PremiumIcon: { icon: 'mdi-crown', size: '18' },

  AlertWarning: { ...baseAlert, type: 'warning' },
  AlertNote: { ...baseAlert, type: 'note' },
  AlertInfo: { ...baseAlert, type: 'info' },
};
