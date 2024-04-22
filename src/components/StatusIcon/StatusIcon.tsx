import {Icon} from '@gravity-ui/uikit';

import {EFlag} from '../../types/api/enums';
import {cn} from '../../utils/cn';

import CircleExclamationFillIcon from '@gravity-ui/icons/svgs/circle-exclamation-fill.svg';
import CircleInfoFillIcon from '@gravity-ui/icons/svgs/circle-info-fill.svg';
import TriangleExclamationFillIcon from '@gravity-ui/icons/svgs/triangle-exclamation-fill.svg';

import './StatusIcon.scss';

const b = cn('ydb-status-icon');

const icons = {
    [EFlag.Blue]: CircleInfoFillIcon,
    [EFlag.Yellow]: CircleExclamationFillIcon,
    [EFlag.Orange]: TriangleExclamationFillIcon,
    [EFlag.Red]: CircleExclamationFillIcon,
};

export type StatusIconMode = 'color' | 'icons';
export type StatusIconSize = 'xs' | 's' | 'm' | 'l';

interface StatusIconProps {
    status?: EFlag;
    size?: StatusIconSize;
    mode?: StatusIconMode;
    className?: string;
}

export function StatusIcon({
    status = EFlag.Grey,
    size = 's',
    mode = 'color',
    className,
}: StatusIconProps) {
    const modifiers = {state: status.toLowerCase(), size};

    if (mode === 'icons' && status in icons) {
        return (
            <Icon
                className={b('status-icon', modifiers, className)}
                data={icons[status as keyof typeof icons]}
            />
        );
    }

    return <div className={b('status-color', modifiers, className)} />;
}