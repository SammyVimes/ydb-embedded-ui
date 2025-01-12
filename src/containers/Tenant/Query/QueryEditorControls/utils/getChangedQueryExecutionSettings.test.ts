import type {QuerySettings} from '../../../../../types/store/query';
import {
    QUERY_MODES,
    STATISTICS_MODES,
    TRACING_LEVELS,
    TRANSACTION_MODES,
} from '../../../../../utils/query';

const DEFAULT_QUERY_SETTINGS: QuerySettings = {
    queryMode: QUERY_MODES.query,
    transactionMode: TRANSACTION_MODES.implicit,
    timeout: '60',
    statisticsMode: STATISTICS_MODES.none,
    tracingLevel: TRACING_LEVELS.detailed,
};

import getChangedQueryExecutionSettings from './getChangedQueryExecutionSettings';

describe('getChangedQueryExecutionSettings', () => {
    it('should return an empty array if no settings have changed', () => {
        const currentSettings: QuerySettings = {...DEFAULT_QUERY_SETTINGS};
        const result = getChangedQueryExecutionSettings(currentSettings, DEFAULT_QUERY_SETTINGS);
        expect(result).toEqual([]);
    });

    it('should return the keys of settings that have changed', () => {
        const currentSettings: QuerySettings = {
            ...DEFAULT_QUERY_SETTINGS,
            queryMode: QUERY_MODES.data,
            timeout: '30',
        };
        const result = getChangedQueryExecutionSettings(currentSettings, DEFAULT_QUERY_SETTINGS);
        expect(result).toEqual(['queryMode', 'timeout']);
    });

    it('should return all keys if all settings have changed', () => {
        const currentSettings: QuerySettings = {
            queryMode: QUERY_MODES.data,
            transactionMode: TRANSACTION_MODES.onlinero,
            timeout: '90',
            statisticsMode: STATISTICS_MODES.basic,
            tracingLevel: TRACING_LEVELS.basic,
        };
        const result = getChangedQueryExecutionSettings(currentSettings, DEFAULT_QUERY_SETTINGS);
        expect(result).toEqual([
            'queryMode',
            'transactionMode',
            'timeout',
            'statisticsMode',
            'tracingLevel',
        ]);
    });
});
