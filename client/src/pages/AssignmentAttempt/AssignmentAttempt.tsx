import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getAssignment, executeQuery, getHint } from '../../services/api';
import { Loader, DifficultyBadge } from '../../components/Shared/Shared';
import './AssignmentAttempt.scss';

interface Column {
    name: string;
    type: string;
}

interface SampleTable {
    tableName: string;
    columns: Column[];
    sampleRows: any[][];
}

interface Assignment {
    _id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question: string;
    sampleTables: SampleTable[];
    expectedOutputHint: string;
}

interface QueryResult {
    columns: string[];
    rows: Record<string, any>[];
    rowCount: number;
    executionTimeMs: number;
}

function AssignmentAttempt() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Data state
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Editor state
    const [sql, setSql] = useState('-- Write your SQL query here\nSELECT ');
    const [running, setRunning] = useState(false);

    // Results state
    const [result, setResult] = useState<QueryResult | null>(null);
    const [queryError, setQueryError] = useState('');

    // Hint state
    const [hintOpen, setHintOpen] = useState(false);
    const [hints, setHints] = useState<{ role: string; text: string }[]>([]);
    const [hintLoading, setHintLoading] = useState(false);

    // Panel state (for left panel tabs)
    const [leftTab, setLeftTab] = useState<'question' | 'schema'>('question');

    // Mobile view state
    const [mobileView, setMobileView] = useState<'question' | 'editor' | 'results'>('editor');

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await getAssignment(id!);
                setAssignment(res.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load assignment');
            } finally {
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id]);

    const handleRunQuery = useCallback(async () => {
        if (!sql.trim() || running) return;
        setRunning(true);
        setResult(null);
        setQueryError('');

        try {
            const res = await executeQuery(sql);
            setResult(res.data.data);
        } catch (err: any) {
            setQueryError(err.response?.data?.message || 'Query execution failed');
        } finally {
            setRunning(false);
        }
    }, [sql, running]);

    const handleGetHint = useCallback(async () => {
        if (!assignment || hintLoading) return;
        setHintOpen(true);
        setHintLoading(true);

        // Build table schema string for context
        const tableSchemas = assignment.sampleTables
            .map(
                (t) =>
                    `Table: ${t.tableName}\nColumns: ${t.columns
                        .map((c) => `${c.name} (${c.type})`)
                        .join(', ')}`
            )
            .join('\n\n');

        try {
            const res = await getHint({
                question: assignment.question,
                userQuery: sql,
                errorMessage: queryError || undefined,
                tableSchemas,
            });

            setHints((prev) => [
                ...prev,
                { role: 'user', text: sql || '(no query yet)' },
                { role: 'assistant', text: res.data.data.hint },
            ]);
        } catch {
            setHints((prev) => [
                ...prev,
                { role: 'assistant', text: 'Sorry, I was unable to generate a hint right now. Please try again.' },
            ]);
        } finally {
            setHintLoading(false);
        }
    }, [assignment, sql, queryError, hintLoading]);

    // Keyboard shortcut: Ctrl+Enter to run
    const handleEditorMount = (editor: any) => {
        editor.addAction({
            id: 'run-query',
            label: 'Run Query',
            keybindings: [2048 | 3], // Ctrl + Enter
            run: () => handleRunQuery(),
        });
    };

    if (loading) return <Loader text="Loading assignment..." />;
    if (error || !assignment) {
        return (
            <div className="attempt" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: '#ff4d6a' }}>⚠️ {error || 'Assignment not found'}</p>
            </div>
        );
    }

    return (
        <div className="attempt">
            {/* ─── Top Bar ───────────────────────────────────────── */}
            <div className="attempt__topbar">
                <button className="attempt__back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <span className="attempt__topbar-title">{assignment.title}</span>
                <DifficultyBadge level={assignment.difficulty} />
            </div>

            {/* ─── Mobile Tab Navigation ─────────────────────────── */}
            <div className="attempt__mobile-tabs">
                <button
                    className={`attempt__mobile-tab ${mobileView === 'question' ? 'attempt__mobile-tab--active' : ''}`}
                    onClick={() => setMobileView('question')}
                >
                    📋 Question
                </button>
                <button
                    className={`attempt__mobile-tab ${mobileView === 'editor' ? 'attempt__mobile-tab--active' : ''}`}
                    onClick={() => setMobileView('editor')}
                >
                    ✏️ Editor
                </button>
                <button
                    className={`attempt__mobile-tab ${mobileView === 'results' ? 'attempt__mobile-tab--active' : ''}`}
                    onClick={() => setMobileView('results')}
                >
                    📊 Results
                </button>
            </div>

            {/* ─── Main Content ──────────────────────────────────── */}
            <div className="attempt__content">
                {/* ─── Left Panel ──────────────────────────────────── */}
                <div
                    className="attempt__left"
                    style={{ display: (mobileView === 'question' || window.innerWidth >= 1024) ? undefined : 'none' }}
                >
                    <div className="attempt__left-tabs">
                        <button
                            className={`attempt__left-tab ${leftTab === 'question' ? 'attempt__left-tab--active' : ''}`}
                            onClick={() => setLeftTab('question')}
                        >
                            Question
                        </button>
                        <button
                            className={`attempt__left-tab ${leftTab === 'schema' ? 'attempt__left-tab--active' : ''}`}
                            onClick={() => setLeftTab('schema')}
                        >
                            Schema & Data
                        </button>
                    </div>

                    <div className="attempt__left-body">
                        {leftTab === 'question' ? (
                            <div className="question-panel">
                                <p className="question-panel__text">{assignment.question}</p>
                                {assignment.expectedOutputHint && (
                                    <>
                                        <p className="question-panel__hint-label">Expected Output Hint</p>
                                        <p className="question-panel__hint-text">{assignment.expectedOutputHint}</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="schema-viewer">
                                {assignment.sampleTables.map((table) => (
                                    <div key={table.tableName} className="schema-viewer__table">
                                        <div className="schema-viewer__table-name">📁 {table.tableName}</div>
                                        <div className="schema-viewer__columns">
                                            {table.columns.map((col) => (
                                                <div key={col.name} className="schema-viewer__col-row">
                                                    <span className="schema-viewer__col-name">{col.name}</span>
                                                    <span className="schema-viewer__col-type">{col.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {table.sampleRows.length > 0 && (
                                            <>
                                                <div className="schema-viewer__sample-label">Sample Data</div>
                                                <div className="schema-viewer__sample-data">
                                                    <table className="schema-viewer__sample-table">
                                                        <thead>
                                                            <tr>
                                                                {table.columns.map((col) => (
                                                                    <th key={col.name}>{col.name}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {table.sampleRows.map((row, ri) => (
                                                                <tr key={ri}>
                                                                    {row.map((val, ci) => (
                                                                        <td key={ci}>{String(val)}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Right Panel ─────────────────────────────────── */}
                <div
                    className="attempt__right"
                    style={{ display: (mobileView !== 'question' || window.innerWidth >= 1024) ? undefined : 'none' }}
                >
                    {/* ─── Editor ──────────────────────────────────── */}
                    <div
                        className="attempt__editor-area"
                        style={{ display: (mobileView === 'editor' || mobileView === 'results' || window.innerWidth >= 1024) ? undefined : 'none' }}
                    >
                        <div className="attempt__editor-toolbar">
                            <span className="attempt__editor-label">⟨/⟩ SQL Editor</span>
                            <div className="attempt__editor-actions">
                                <button
                                    className="attempt__btn attempt__btn--hint"
                                    onClick={handleGetHint}
                                    disabled={hintLoading}
                                >
                                    💡 Get Hint
                                </button>
                                <button
                                    className="attempt__btn attempt__btn--run"
                                    onClick={handleRunQuery}
                                    disabled={running}
                                >
                                    {running ? '⏳ Running...' : '▶ Run Query'}
                                </button>
                            </div>
                        </div>
                        <div className="attempt__editor-wrapper">
                            <Editor
                                height="100%"
                                defaultLanguage="sql"
                                value={sql}
                                onChange={(value) => setSql(value || '')}
                                onMount={handleEditorMount}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 12, bottom: 12 },
                                    lineNumbersMinChars: 3,
                                    wordWrap: 'on',
                                    automaticLayout: true,
                                    tabSize: 2,
                                    suggestOnTriggerCharacters: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* ─── Results ─────────────────────────────────── */}
                    <div
                        className="attempt__results-area"
                        style={{ display: (mobileView === 'results' || mobileView === 'editor' || window.innerWidth >= 1024) ? undefined : 'none' }}
                    >
                        <div className="attempt__results-header">
                            <span className="attempt__results-label">Results</span>
                            {result && (
                                <span className="attempt__results-meta">
                                    {result.rowCount} row{result.rowCount !== 1 ? 's' : ''} · {result.executionTimeMs}ms
                                </span>
                            )}
                        </div>
                        <div className="attempt__results-body">
                            {queryError ? (
                                <div className="results-error">{queryError}</div>
                            ) : result ? (
                                result.rows.length > 0 ? (
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                {result.columns.map((col) => (
                                                    <th key={col}>{col}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.rows.map((row, ri) => (
                                                <tr key={ri}>
                                                    {result.columns.map((col) => (
                                                        <td key={col}>{row[col] === null ? 'NULL' : String(row[col])}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="results-empty">
                                        <span className="results-empty__icon">✅</span>
                                        <span>Query executed successfully. No rows returned.</span>
                                    </div>
                                )
                            ) : (
                                <div className="results-empty">
                                    <span className="results-empty__icon">📊</span>
                                    <span>Run a query to see results here</span>
                                    <span style={{ fontSize: '12px', color: '#6b6b80' }}>Press Ctrl + Enter to run</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Hint Slide-Out Panel ──────────────────────────── */}
            {hintOpen && (
                <div className="hint-panel">
                    <div className="hint-panel__overlay" onClick={() => setHintOpen(false)} />
                    <div className="hint-panel__content">
                        <div className="hint-panel__header">
                            <span className="hint-panel__title">💡 AI Hints</span>
                            <button className="hint-panel__close" onClick={() => setHintOpen(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="hint-panel__body">
                            {hints.length === 0 && !hintLoading && (
                                <p style={{ color: '#6b6b80', textAlign: 'center', padding: '2rem' }}>
                                    Click "Ask for Hint" to get guidance on this problem.
                                </p>
                            )}
                            {hints.map((h, i) => (
                                <div
                                    key={i}
                                    className={`hint-panel__message ${h.role === 'user' ? 'hint-panel__message--user' : ''
                                        }`}
                                >
                                    {h.role === 'user' ? (
                                        <><strong>Your query:</strong><br /><code>{h.text}</code></>
                                    ) : (
                                        h.text
                                    )}
                                </div>
                            ))}
                            {hintLoading && (
                                <div className="hint-panel__loading">
                                    <div className="loader__spinner" style={{ width: 20, height: 20 }} />
                                    <span>Thinking...</span>
                                </div>
                            )}
                        </div>
                        <div className="hint-panel__footer">
                            <button
                                className="hint-panel__ask-btn"
                                onClick={handleGetHint}
                                disabled={hintLoading}
                            >
                                {hintLoading ? 'Generating...' : '💡 Ask for Another Hint'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentAttempt;
