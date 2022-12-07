import type {Reducer} from 'redux';

import '../../services/api';
import type {
    IShardsWorkloadAction,
    IShardsWorkloadFilters,
    IShardsWorkloadState,
} from '../../types/store/shardsWorkload';

import {parseQueryAPIExecuteResponse} from '../../utils/query';

import {createRequestActionTypes, createApiRequest} from '../utils';

export const SEND_SHARD_QUERY = createRequestActionTypes('query', 'SEND_SHARD_QUERY');
const SET_SHARD_QUERY_OPTIONS = 'query/SET_SHARD_QUERY_OPTIONS';
const SET_TOP_SHARDS_FILTERS = 'shardsWorkload/SET_TOP_SHARDS_FILTERS';

const initialState = {
    loading: false,
    wasLoaded: false,
    filters: {},
};

export interface SortOrder {
    columnId: string;
    order: string;
}

function formatSortOrder({columnId, order}: SortOrder) {
    return `${columnId} ${order}`;
}

function getFiltersConditions(filters?: IShardsWorkloadFilters) {
    const conditions: string[] = [];

    if (filters?.from && filters?.to && filters.from > filters.to) {
        throw new Error('Invalid date range');
    }

    if (filters?.from) {
        // matching `from` & `to` is an edge case
        // other cases should not include the starting point, since intervals are stored using the ending time
        const gt = filters.to === filters.from ? '>=' : '>';
        conditions.push(`IntervalEnd ${gt} Timestamp('${new Date(filters.from).toISOString()}')`);
    }

    if (filters?.to) {
        conditions.push(`IntervalEnd <= Timestamp('${new Date(filters.to).toISOString()}')`);
    }

    return conditions.join(' AND ');
}

function createShardQuery(
    path: string,
    filters?: IShardsWorkloadFilters,
    sortOrder?: SortOrder[],
    tenantName?: string,
) {
    const pathSelect = tenantName
        ? `CAST(SUBSTRING(CAST(Path AS String), ${tenantName.length}) AS Utf8) AS Path`
        : 'Path';

    let where = `Path='${path}' OR Path LIKE '${path}/%'`;

    const filterConditions = getFiltersConditions(filters);
    if (filterConditions.length) {
        where = `(${where}) AND ${filterConditions}`;
    }

    const orderBy = sortOrder ? `ORDER BY ${sortOrder.map(formatSortOrder).join(', ')}` : '';

    return `SELECT
    ${pathSelect},
    TabletId,
    CPUCores,
    DataSize,
    NodeId,
    PeakTime,
    InFlightTxCount
FROM \`.sys/top_partitions_one_hour\`
WHERE ${where}
${orderBy}
LIMIT 20`;
}

const queryAction = 'execute-scan';

const shardsWorkload: Reducer<IShardsWorkloadState, IShardsWorkloadAction> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case SEND_SHARD_QUERY.REQUEST: {
            return {
                ...state,
                loading: true,
                error: undefined,
            };
        }
        case SEND_SHARD_QUERY.SUCCESS: {
            return {
                ...state,
                data: action.data,
                loading: false,
                error: undefined,
                wasLoaded: true,
            };
        }
        // 401 Unauthorized error is handled by GenericAPI
        case SEND_SHARD_QUERY.FAILURE: {
            return {
                ...state,
                error: action.error || 'Unauthorized',
                loading: false,
            };
        }
        case SET_SHARD_QUERY_OPTIONS:
            return {
                ...state,
                ...action.data,
            };
        case SET_TOP_SHARDS_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.filters,
                },
            };
        default:
            return state;
    }
};

interface SendShardQueryParams {
    database?: string;
    path?: string;
    sortOrder?: SortOrder[];
    filters?: IShardsWorkloadFilters;
}

export const sendShardQuery = ({database, path = '', sortOrder, filters}: SendShardQueryParams) => {
    try {
        return createApiRequest({
            request: window.api.sendQuery(
                {
                    schema: 'modern',
                    query: createShardQuery(path, filters, sortOrder, database),
                    database,
                    action: queryAction,
                },
                {
                    concurrentId: 'topShards',
                },
            ),
            actions: SEND_SHARD_QUERY,
            dataHandler: parseQueryAPIExecuteResponse,
        });
    } catch (error) {
        return {
            type: SEND_SHARD_QUERY.FAILURE,
            error,
        };
    }
};

export function setShardQueryOptions(options: Partial<IShardsWorkloadState>) {
    return {
        type: SET_SHARD_QUERY_OPTIONS,
        data: options,
    } as const;
}

export function setTopShardFilters(filters: Partial<IShardsWorkloadFilters>) {
    return {
        type: SET_TOP_SHARDS_FILTERS,
        filters,
    } as const;
}

export default shardsWorkload;
