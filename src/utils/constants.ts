import DataTable from '@gravity-ui/react-data-table';
import type {Settings} from '@gravity-ui/react-data-table';

import {EType} from '../types/api/tablet';
import type {QuerySettings} from '../types/store/query';

import {QUERY_MODES, STATISTICS_MODES, TRACING_LEVELS, TRANSACTION_MODES} from './query';

const SECOND = 1000;

export const AUTO_RELOAD_INTERVAL = 10 * SECOND;
export const DEFAULT_POLLING_INTERVAL = 30 * SECOND;
// by agreement, display all byte values in decimal scale
// values in data are always in bytes, never in higher units,
// therefore there is no issue arbitrary converting them in UI
export const KILOBYTE = 1_000;
export const MEGABYTE = 1_000_000;
export const GIGABYTE = 1_000_000_000;
export const TERABYTE = 1_000_000_000_000;

export const SECOND_IN_MS = 1000;
export const MINUTE_IN_SECONDS = 60;
export const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
export const WEEK_IN_SECONDS = 7 * DAY_IN_SECONDS;

export const MS_IN_NANOSECONDS = 1000000;

export const TABLET_COLORS = {
    Created: 'grey',
    ResolveStateStorage: 'lightgrey',
    Candidate: 'lightgrey',
    BlockBlobStorage: 'lightgrey',
    RebuildGraph: 'yellow',
    Restored: 'yellow',
    Discover: 'orange',
    Lock: 'lightblue',
    Dead: 'black',
    Active: 'lightgreen',
};

export const TABLET_SYMBOLS = {
    [EType.OldTxProxy]: 'P',
    [EType.TxProxy]: 'P',
    [EType.BSController]: 'BS',
    [EType.Dummy]: 'DY',
    [EType.RTMRPartition]: 'RP',
    [EType.PersQueueReadBalancer]: 'PB',
    [EType.Cms]: 'CM',
    [EType.BlockStorePartition]: 'BP',
    [EType.BlockStoreVolume]: 'BV',
    [EType.Console]: 'CN',
    [EType.TenantSlotBroker]: 'TB',
    [EType.BlockStoreDiskRegistry]: 'BDR',
};

const isTabletType = (type: string): type is keyof typeof TABLET_SYMBOLS => type in TABLET_SYMBOLS;

export const getTabletLabel = (type?: string) => {
    if (!type) {
        return undefined;
    }
    const defaultValue = type.match(/[A-Z]/g)?.join('');

    return isTabletType(type) ? TABLET_SYMBOLS[type] : defaultValue;
};

export const LOAD_AVERAGE_TIME_INTERVALS = ['1 min', '5 min', '15 min'];

export const COLORS_PRIORITY = {
    green: 5,
    yellow: 4,
    orange: 3,
    red: 2,
    blue: 1,
    grey: 1,
};

export const TENANT_OVERVIEW_TABLES_LIMIT = 5;

export const EMPTY_DATA_PLACEHOLDER = '—';

// ==== Titles ====
export const DEVELOPER_UI_TITLE = 'Developer UI';
export const CLUSTER_DEFAULT_TITLE = 'Cluster';
export const TENANT_DEFAULT_TITLE = 'Database';

// ==== Settings ====
export const THEME_KEY = 'theme';
export const LANGUAGE_KEY = 'language';
export const INVERTED_DISKS_KEY = 'invertedDisks';
export const USE_NODES_ENDPOINT_IN_DIAGNOSTICS_KEY = 'useNodesEndpointInDiagnostics';
export const SAVED_QUERIES_KEY = 'saved_queries';
export const ASIDE_HEADER_COMPACT_KEY = 'asideHeaderCompact';
export const QUERIES_HISTORY_KEY = 'queries_history';
export const DATA_QA_TUNE_COLUMNS_POPUP = 'tune-columns-popup';
export const BINARY_DATA_IN_PLAIN_TEXT_DISPLAY = 'binaryDataInPlainTextDisplay';
export const AUTO_REFRESH_INTERVAL = 'auto-refresh-interval';

export const DEFAULT_SIZE_RESULT_PANE_KEY = 'default-size-result-pane';
export const DEFAULT_SIZE_TENANT_SUMMARY_KEY = 'default-size-tenant-summary-pane';
export const DEFAULT_SIZE_TENANT_KEY = 'default-size-tenant-pane';

export const DEFAULT_IS_TENANT_SUMMARY_COLLAPSED = 'default-is-tenant-summary-collapsed';

export const DEFAULT_IS_TENANT_COMMON_INFO_COLLAPSED = 'default-is-tenant-common-info-collapsed';

export const DEFAULT_IS_QUERY_RESULT_COLLAPSED = 'default-is-query-result-collapsed';

export const DEFAULT_CLUSTER_TAB_KEY = 'default-cluster-tab';

export const DEFAULT_TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    syncHeadOnResize: true,
    dynamicRender: true,
    highlightRows: true,
} as const;

export const TENANT_OVERVIEW_TABLES_SETTINGS = {
    ...DEFAULT_TABLE_SETTINGS,
    stickyHead: 'fixed',
    dynamicRender: false,
} as const;

export const DEFAULT_QUERY_SETTINGS = {
    queryMode: QUERY_MODES.query,
    transactionMode: TRANSACTION_MODES.implicit,
    timeout: '60',
    statisticsMode: STATISTICS_MODES.none,
    tracingLevel: TRACING_LEVELS.detailed,
} satisfies QuerySettings;

export const QUERY_EXECUTION_SETTINGS_KEY = 'queryExecutionSettings';
export const LAST_QUERY_EXECUTION_SETTINGS_KEY = 'last_query_execution_settings';
export const QUERY_SETTINGS_BANNER_LAST_CLOSED_KEY = 'querySettingsBannerLastClosed';

export const LAST_USED_QUERY_ACTION_KEY = 'last_used_query_action';

export const PARTITIONS_HIDDEN_COLUMNS_KEY = 'partitionsHiddenColumns';

// Remain "tab" in key name for backward compatibility
export const TENANT_INITIAL_PAGE_KEY = 'saved_tenant_initial_tab';

// Setting to use paginated tables
// Old key value for backward compatibility
export const USE_PAGINATED_TABLES_KEY = 'useBackendParamsForTables';

// Setting to hide domain in database list
export const SHOW_DOMAIN_DATABASE_KEY = 'showDomainDatabase';

// Enable schema that supports multiple resultsets
export const QUERY_USE_MULTI_SCHEMA_KEY = 'queryUseMultiSchema';

export const USE_CLUSTER_BALANCER_AS_BACKEND_KEY = 'useClusterBalancerAsBacked';

export const ENABLE_AUTOCOMPLETE = 'enableAutocomplete';

export const AUTOCOMPLETE_ON_ENTER = 'autocompleteOnEnter';

export const IS_HOTKEYS_HELP_HIDDEN_KEY = 'isHotKeysHelpHidden';

export const DEV_ENABLE_TRACING_FOR_ALL_REQUESTS = 'enable_tracing_for_all_requests';

export const USE_ADVANCED_STORAGE_KEY = 'use_advanced_storage';
