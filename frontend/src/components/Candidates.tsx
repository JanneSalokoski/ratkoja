import { useEffect, useState } from 'react'

import './Candidates.css';

interface LetterBlockProps {
    value: string;
}

function LetterBlock(props: LetterBlockProps) {
    return (
        <span className="LetterBlock">
            {props.value}
        </span>
    )
}

interface CandidatesProps {
    known: string[];
    words: string[];
    selected: number;
}

export function Candidates(props: CandidatesProps) {
    let [candidates, setCandidates] = useState<string[][]>([]);

    useEffect(() => {
        let cancelled = false;

        async function computeCandidates() {
            const newCandidates: string[][] = Array.from({ length: props.known.length }, () => []);

            for (const word of props.words) {
                for (const [patIdx, pattern] of props.known.entries()) {
                    let matching = true;
                    for (const [index, value] of [...pattern].entries()) {
                        if (value === ".") {
                            continue;
                        }
                        if (word[index] && word[index].toLowerCase() !== value.toLowerCase()) {
                            matching = false;
                            break;
                        }
                    }
                    if (matching && word.length === pattern.length) {
                        newCandidates[patIdx].push(word);
                    }
                }

                if (props.words.length > 1000) { await Promise.resolve(); }
            }

            if (!cancelled) {
                setCandidates(newCandidates);
            }
        }
        computeCandidates();

        return () => {
            cancelled = true;
        };
    }, [props.known, props.words])

    return props.known[props.selected] !== undefined ? (
        <div className="Candidates">
            <span className="pattern">{[...props.known[props.selected]].map((letter) => <LetterBlock value={letter} />)}</span>
            <ul>
                {
                    candidates[props.selected]?.map(word => (
                        <li className="candidate">{[...word.toUpperCase()].map((letter) => <LetterBlock value={letter} />)}</li>
                    ))
                }
            </ul>
        </div>
    ) : (<></>)
}
