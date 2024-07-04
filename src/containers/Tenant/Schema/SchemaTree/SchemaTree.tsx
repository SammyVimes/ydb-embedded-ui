// todo: tableTree is very smart, so it is impossible to update it without re-render
// It is need change NavigationTree to dump component and pass props from parent component
// In this case we can store state of tree - uploaded entities, opened nodes, selected entity and so on
import React from 'react';

import {NavigationTree} from 'ydb-ui-components';

import {schemaApi} from '../../../../store/reducers/schema/schema';
import type {EPathType} from '../../../../types/api/schema';
import {useQueryModes, useTypedDispatch} from '../../../../utils/hooks';
import {isChildlessPathType, mapPathTypeToNavigationTreeType} from '../../utils/schema';
import {getActions} from '../../utils/schemaActions';
import {getControls} from '../../utils/schemaControls';
import {CreateDirectoryDialog} from '../CreateDirectoryDialog/CreateDirectoryDialog';

interface SchemaTreeProps {
    rootPath: string;
    rootName: string;
    rootType?: EPathType;
    currentPath?: string;
    onActivePathUpdate: (path: string) => void;
}

export function SchemaTree(props: SchemaTreeProps) {
    const {rootPath, rootName, rootType, currentPath, onActivePathUpdate} = props;
    const dispatch = useTypedDispatch();

    const [_, setQueryMode] = useQueryModes();
    const [createDirectoryOpen, setCreateDirectoryOpen] = React.useState(false);
    const [parentPath, setParentPath] = React.useState('');
    const [schemaTreeKey, setSchemaTreeKey] = React.useState('');

    const fetchPath = async (path: string) => {
        const promise = dispatch(
            schemaApi.endpoints.getSchema.initiate({path}, {forceRefetch: true}),
        );
        const {data} = await promise;
        promise.unsubscribe();
        if (!data) {
            throw new Error(`no describe data about path ${path}`);
        }
        const {PathDescription: {Children = []} = {}} = data;

        const childItems = Children.map((childData) => {
            const {Name = '', PathType, PathSubType} = childData;

            return {
                name: Name,
                type: mapPathTypeToNavigationTreeType(PathType, PathSubType),
                // FIXME: should only be explicitly set to true for tables with indexes
                // at the moment of writing there is no property to determine this, fix later
                expandable: !isChildlessPathType(PathType, PathSubType),
            };
        });

        return childItems;
    };
    React.useEffect(() => {
        // if the cached path is not in the current tree, show root
        if (!currentPath?.startsWith(rootPath)) {
            onActivePathUpdate(rootPath);
        }
    }, [currentPath, onActivePathUpdate, rootPath]);

    const handleSuccessSubmit = (relativePath: string) => {
        const newPath = `${parentPath}/${relativePath}`;
        onActivePathUpdate(newPath);
        setSchemaTreeKey(newPath);
    };

    const handleCloseDialog = () => {
        setCreateDirectoryOpen(false);
    };

    const handleOpenCreateDirectoryDialog = (value: string) => {
        setParentPath(value);
        setCreateDirectoryOpen(true);
    };
    return (
        <React.Fragment>
            <CreateDirectoryDialog
                onClose={handleCloseDialog}
                open={createDirectoryOpen}
                parentPath={parentPath}
                onSuccess={handleSuccessSubmit}
            />
            <NavigationTree
                key={schemaTreeKey}
                rootState={{
                    path: rootPath,
                    name: rootName,
                    type: mapPathTypeToNavigationTreeType(rootType),
                    collapsed: false,
                }}
                fetchPath={fetchPath}
                getActions={getActions(dispatch, {
                    setActivePath: onActivePathUpdate,
                    setQueryMode,
                    showCreateDirectoryDialog: handleOpenCreateDirectoryDialog,
                })}
                renderAdditionalNodeElements={getControls(dispatch, {
                    setActivePath: onActivePathUpdate,
                })}
                activePath={currentPath}
                onActivePathUpdate={onActivePathUpdate}
                cache={false}
                virtualize
            />
        </React.Fragment>
    );
}
