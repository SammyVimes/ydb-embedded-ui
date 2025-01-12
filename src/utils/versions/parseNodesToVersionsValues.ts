import type {NodesGroup} from '../../store/reducers/nodes/types';
import type {TSystemStateInfo} from '../../types/api/nodes';
import type {VersionToColorMap, VersionValue} from '../../types/versions';

import {getMinorVersion} from './parseVersion';

export const parseNodesToVersionsValues = (
    nodes: TSystemStateInfo[] = [],
    versionsToColor?: VersionToColorMap,
): VersionValue[] => {
    const versionsCount = nodes.reduce<Record<string, number>>((acc, node) => {
        if (node.Version) {
            if (acc[node.Version]) {
                acc[node.Version] = acc[node.Version] + 1;
            } else {
                acc[node.Version] = 1;
            }
        }
        return acc;
    }, {});

    return Object.keys(versionsCount).map((version) => {
        return {
            title: version,
            version: version,
            color: versionsToColor?.get(getMinorVersion(version)),
            value: (versionsCount[version] / nodes.length) * 100,
        };
    });
};

export function parseNodeGroupsToVersionsValues(
    groups: NodesGroup[],
    versionsToColor?: VersionToColorMap,
) {
    return groups.map((group) => {
        return {
            title: group.name,
            version: group.name,
            color: versionsToColor?.get(group.name),
            value: group.count,
        };
    });
}
