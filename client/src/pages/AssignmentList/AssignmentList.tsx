import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments } from '../../services/api';
import { Loader, DifficultyBadge } from '../../components/Shared/Shared';
import './AssignmentList.scss';

interface Assignment {
    _id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    createdAt: string;
}

function AssignmentList() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await getAssignments();
                setAssignments(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    if (loading) return <Loader text="Loading assignments..." />;

    if (error) {
        return (
            <div className="assignment-list">
                <div className="assignment-list__empty">
                    <p>⚠️ {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="assignment-list">
            <div className="assignment-list__header">
                <h1 className="assignment-list__title">SQL Assignments</h1>
                <p className="assignment-list__subtitle">
                    Practice your SQL skills with real-world scenarios. Select an assignment to begin.
                </p>
            </div>

            {assignments.length === 0 ? (
                <div className="assignment-list__empty">
                    No assignments available yet. Check back soon!
                </div>
            ) : (
                <div className="assignment-list__grid">
                    {assignments.map((a) => (
                        <div
                            key={a._id}
                            className="assignment-card"
                            onClick={() => navigate(`/assignment/${a._id}`)}
                        >
                            <div className="assignment-card__header">
                                <DifficultyBadge level={a.difficulty} />
                            </div>
                            <h3 className="assignment-card__title">{a.title}</h3>
                            <p className="assignment-card__description">{a.description}</p>
                            <div className="assignment-card__footer">
                                <span className="assignment-card__date">
                                    {new Date(a.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                                <span className="assignment-card__arrow">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AssignmentList;
