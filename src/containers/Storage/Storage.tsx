import React from 'react';

import {ArrayParam, StringParam, useQueryParams, withDefault} from 'use-query-params';

import {AccessDenied} from '../../components/Errors/403';
import {isAccessError} from '../../components/Errors/PageError/PageError';
import {ResponseError} from '../../components/Errors/ResponseError';
import {TableWithControlsLayout} from '../../components/TableWithControlsLayout/TableWithControlsLayout';
import {
    useCapabilitiesLoaded,
    useStorageGroupsHandlerAvailable,
} from '../../store/reducers/capabilities/hooks';
import type {NodesSortParams} from '../../store/reducers/nodes/types';
import {STORAGE_TYPES, VISIBLE_ENTITIES} from '../../store/reducers/storage/constants';
import {
    filterGroups,
    filterNodes,
    getUsageFilterOptions,
} from '../../store/reducers/storage/selectors';
import {storageApi} from '../../store/reducers/storage/storage';
import {storageTypeSchema, visibleEntitiesSchema} from '../../store/reducers/storage/types';
import type {
    StorageSortParams,
    StorageType,
    VisibleEntities,
} from '../../store/reducers/storage/types';
import type {AdditionalNodesProps} from '../../types/additionalProps';
import {DEFAULT_TABLE_SETTINGS} from '../../utils/constants';
import {useAutoRefreshInterval, useTableSort} from '../../utils/hooks';
import {NodesUptimeFilterValues, nodesUptimeFilterValuesSchema} from '../../utils/nodes';

import {StorageControls} from './StorageControls/StorageControls';
import {StorageGroups} from './StorageGroups/StorageGroups';
import {StorageNodes} from './StorageNodes/StorageNodes';
import {b} from './shared';
import {defaultSortNode, getDefaultSortGroup} from './utils';

import './Storage.scss';

const UsageFilterParam = withDefault(
    {
        encode: ArrayParam.encode,
        decode: (input) => {
            if (input === null || input === undefined) {
                return input;
            }

            if (!Array.isArray(input)) {
                return input ? [input] : [];
            }
            return input.filter(Boolean) as string[];
        },
    },
    [],
);

interface StorageProps {
    additionalNodesProps?: AdditionalNodesProps;
    database?: string;
    nodeId?: string;
}

export const Storage = ({additionalNodesProps, database, nodeId}: StorageProps) => {
    const capabilitiesLoaded = useCapabilitiesLoaded();
    const groupsHandlerAvailable = useStorageGroupsHandlerAvailable();
    const [autoRefreshInterval] = useAutoRefreshInterval();

    const [queryParams, setQueryParams] = useQueryParams({
        type: StringParam,
        visible: StringParam,
        search: StringParam,
        uptimeFilter: StringParam,
        usageFilter: UsageFilterParam,
    });
    const storageType = storageTypeSchema.parse(queryParams.type);
    const visibleEntities = visibleEntitiesSchema.parse(queryParams.visible);
    const filter = queryParams.search ?? '';
    const uptimeFilter = nodesUptimeFilterValuesSchema.parse(queryParams.uptimeFilter);
    const usageFilter = queryParams.usageFilter;

    const [nodeSort, setNodeSort] = React.useState<NodesSortParams>({
        sortOrder: undefined,
        sortValue: undefined,
    });
    const nodesSortParams = nodeSort.sortValue ? nodeSort : defaultSortNode;

    const [groupSort, setGroupSort] = React.useState<StorageSortParams>({
        sortOrder: undefined,
        sortValue: undefined,
    });
    const groupsSortParams = groupSort.sortOrder ? groupSort : getDefaultSortGroup(visibleEntities);

    const nodesQuery = storageApi.useGetStorageNodesInfoQuery(
        {database, visibleEntities, node_id: nodeId},
        {
            skip: storageType !== STORAGE_TYPES.nodes,
            pollingInterval: autoRefreshInterval,
        },
    );
    const groupsQuery = storageApi.useGetStorageGroupsInfoQuery(
        {database, with: visibleEntities, nodeId, shouldUseGroupsHandler: groupsHandlerAvailable},
        {
            skip: storageType !== STORAGE_TYPES.groups || !capabilitiesLoaded,
            pollingInterval: autoRefreshInterval,
        },
    );

    const {currentData, isFetching, error} =
        storageType === STORAGE_TYPES.nodes ? nodesQuery : groupsQuery;

    const {currentData: {nodes = []} = {}} = nodesQuery;
    const {currentData: {groups = []} = {}} = groupsQuery;
    const {nodes: _, groups: __, ...entitiesCount} = currentData ?? {found: 0, total: 0};

    const isLoading = currentData === undefined && isFetching;

    const storageNodes = React.useMemo(
        () => filterNodes(nodes, filter, uptimeFilter),
        [filter, nodes, uptimeFilter],
    );
    const storageGroups = React.useMemo(
        () => filterGroups(groups, filter, usageFilter),
        [filter, groups, usageFilter],
    );

    const usageFilterOptions = React.useMemo(() => getUsageFilterOptions(groups), [groups]);

    const [nodesSort, handleNodesSort] = useTableSort(nodesSortParams, (params) =>
        setNodeSort(params as NodesSortParams),
    );
    const [groupsSort, handleGroupsSort] = useTableSort(groupsSortParams, (params) =>
        setGroupSort(params as StorageSortParams),
    );

    const handleUsageFilterChange = (value: string[]) => {
        setQueryParams({usageFilter: value.length ? value : undefined}, 'replaceIn');
    };

    const handleTextFilterChange = (value: string) => {
        setQueryParams({search: value || undefined}, 'replaceIn');
    };

    const handleGroupVisibilityChange = (value: VisibleEntities) => {
        setQueryParams({visible: value}, 'replaceIn');
    };

    const handleStorageTypeChange = (value: StorageType) => {
        setQueryParams({type: value}, 'replaceIn');
    };

    const handleUptimeFilterChange = (value: NodesUptimeFilterValues) => {
        setQueryParams({uptimeFilter: value}, 'replaceIn');
    };

    const handleShowAllNodes = () => {
        handleGroupVisibilityChange(VISIBLE_ENTITIES.all);
        handleUptimeFilterChange(NodesUptimeFilterValues.All);
    };

    const renderDataTable = () => {
        return (
            <React.Fragment>
                {storageType === STORAGE_TYPES.groups && (
                    <StorageGroups
                        key="groups"
                        visibleEntities={visibleEntities}
                        data={storageGroups}
                        tableSettings={DEFAULT_TABLE_SETTINGS}
                        onShowAll={() => handleGroupVisibilityChange(VISIBLE_ENTITIES.all)}
                        sort={groupsSort}
                        handleSort={handleGroupsSort}
                    />
                )}
                {storageType === STORAGE_TYPES.nodes && (
                    <StorageNodes
                        key="nodes"
                        visibleEntities={visibleEntities}
                        nodesUptimeFilter={uptimeFilter}
                        data={storageNodes}
                        tableSettings={DEFAULT_TABLE_SETTINGS}
                        onShowAll={handleShowAllNodes}
                        additionalNodesProps={additionalNodesProps}
                        sort={nodesSort}
                        handleSort={handleNodesSort}
                        database={database}
                    />
                )}
            </React.Fragment>
        );
    };

    const renderControls = () => {
        return (
            <StorageControls
                searchValue={filter}
                handleSearchValueChange={handleTextFilterChange}
                withTypeSelector
                storageType={storageType}
                handleStorageTypeChange={handleStorageTypeChange}
                visibleEntities={visibleEntities}
                handleVisibleEntitiesChange={handleGroupVisibilityChange}
                nodesUptimeFilter={uptimeFilter}
                handleNodesUptimeFilterChange={handleUptimeFilterChange}
                groupsUsageFilter={usageFilter}
                groupsUsageFilterOptions={usageFilterOptions}
                handleGroupsUsageFilterChange={handleUsageFilterChange}
                entitiesCountCurrent={
                    storageType === STORAGE_TYPES.groups
                        ? storageGroups.length
                        : storageNodes.length
                }
                entitiesCountTotal={entitiesCount.total}
                entitiesLoading={isLoading}
            />
        );
    };

    if (isAccessError(error)) {
        return <AccessDenied position="left" />;
    }

    return (
        <TableWithControlsLayout>
            <TableWithControlsLayout.Controls>{renderControls()}</TableWithControlsLayout.Controls>
            {error ? <ResponseError error={error} /> : null}
            <TableWithControlsLayout.Table
                loading={isLoading || !capabilitiesLoaded}
                className={b('table')}
            >
                {currentData ? renderDataTable() : null}
            </TableWithControlsLayout.Table>
        </TableWithControlsLayout>
    );
};
