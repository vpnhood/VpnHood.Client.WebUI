import i18n from '@/locales/i18n';
import { StatusQuality } from '@/services/VpnHood.Client.Api';

const locale = i18n.global.t;

export interface StatusQualityDisplay {
    text: string;
    color: string;
}

export function getStatusQualityDisplay(quality?: StatusQuality): StatusQualityDisplay {
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
