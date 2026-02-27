import './Shared.scss';

export function Loader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="loader">
            <div className="loader__spinner" />
            <p className="loader__text">{text}</p>
        </div>
    );
}

interface DifficultyBadgeProps {
    level: 'Easy' | 'Medium' | 'Hard';
}

export function DifficultyBadge({ level }: DifficultyBadgeProps) {
    return (
        <span className={`difficulty-badge difficulty-badge--${level.toLowerCase()}`}>
            {level}
        </span>
    );
}
