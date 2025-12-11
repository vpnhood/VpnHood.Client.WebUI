import i18n from '@/locales/i18n';
import { StatusQuality } from '@/services/VpnHood.Client.Api';

const locale = i18n.global.t;

export function GetStatusQualityDisplay(quality?: StatusQuality): StatusQualityDisplay {
  switch (quality) {
    case StatusQuality.Excellent:
      return { text: locale('PROXY_STATUS_EXCELLENT'), color: 'success' };
    case StatusQuality.Good:
      return { text: locale('PROXY_STATUS_GOOD'), color: 'enable-premium' };
    case StatusQuality.Fair:
      return { text: locale('PROXY_STATUS_FAIR'), color: 'warning' };
    case StatusQuality.Poor:
      return { text: locale('PROXY_STATUS_POOR'), color: 'error' };
    case StatusQuality.VeryPoor:
      return { text: locale('PROXY_STATUS_VERY_POOR'), color: 'error' };
    case StatusQuality.Failed:
      return { text: locale('PROXY_STATUS_FAILED'), color: 'error' };
    case StatusQuality.Unknown:
    default:
      return { text: locale('PROXY_STATUS_NO_DATA'), color: '' };
  }
}

export interface StatusQualityDisplay {
  text: string;
  color: string;
}
export enum ProxySheetType {
  add = 'ADD_PROXY',
  addList = 'ADD_PROXY_LIST',
  edit = 'EDIT_PROXY'
}
