import { useEffect, useState, useMemo, useRef } from 'react'
import './App.css'

interface CellProps {
    letter: string;
    index: number;
    active: boolean;
    selected: boolean;
    disabled: boolean;
    startsGroups: number[];
    clickHandler: (index: number, e: React.MouseEvent) => void;
    keyPressHandler: (index: number, e: React.KeyboardEvent) => void;
}

function Cell(props: CellProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.active) {
            inputRef.current?.focus();
        }
    }, [props.active]);

    return (
        <div
            tabIndex={props.index}
            className={
                `Cell ${props.active ? "active" : ""}
                ${props.selected ? "selected" : ""}
                ${props.disabled ? "disabled" : ""}
                `
            }
            onClick={(e: React.MouseEvent) => props.clickHandler(props.index, e)}
        >
            <span className="groups">
                {
                    props.startsGroups.join(",")
                }
            </span>
            <span className="letter">
                {props.letter}
            </span>
            <input className="hidden-input"
                ref={inputRef}
                type="text"
                maxLength={1}
                value={props.letter}
                onKeyUp={(e: React.KeyboardEvent) => props.keyPressHandler(props.index, e)}
                onChange={() => { }}
                autoFocus={props.active}
                autoCapitalize="characters"
                inputMode="text"
            />
        </div>
    )
}

enum SelectionDirection {
    Horizontal,
    Vertical,
}

interface GridProps {
    disabling: boolean;
    gridSize: number;
    handleKnown: (newKnown: string[]) => void
    handleGroupSelect: (newSelectedGroup: any) => void
}

function Grid(props: GridProps) {
    let [letters, setLetters] = useState<(string)[]>(new Array(props.gridSize * props.gridSize).fill(""));
    useEffect(() => {
        setLetters(new Array(props.gridSize * props.gridSize).fill(""));
    }, [props.gridSize]);

    console.log(letters.length);
    let [active, setActive] = useState<number | undefined>();
    let [selectedRow, setSelectedRow] = useState<number | undefined>();
    let [selectedCol, setSelectedCol] = useState<number | undefined>();
    let [selectionDirection, setSelectionDirection] = useState<SelectionDirection>(SelectionDirection.Horizontal);
    let [disabled, setDisabled] = useState<number[]>([]);
    useEffect(() => {
        setDisabled([]);
    }, [props.gridSize]);

    let [groups, setGroups] = useState<number[][]>([]);

    useEffect(() => {
        let rowGroups: number[][] = [];
        let colGroups: number[][] = [];
        // rows
        let startNewRow = true;
        let startNewCol = true;
        for (let row = 0; row < props.gridSize; row++) {
            for (let col = 0; col < props.gridSize; col++) {
                if (startNewRow) {
                    rowGroups.push([]);
                }

                if (startNewCol) {
                    colGroups.push([]);
                }

                let rowIndex = row * props.gridSize + col;
                if (!disabled.includes(rowIndex)) {
                    startNewRow = false;
                    rowGroups[rowGroups.length - 1].push(rowIndex)
                } else {
                    startNewRow = true;
                }

                let colIndex = col * props.gridSize + row;
                if (!disabled.includes(colIndex)) {
                    startNewCol = false;
                    colGroups[colGroups.length - 1].push(colIndex)
                } else {
                    startNewCol = true;
                }

                if (col === props.gridSize - 1) {
                    startNewRow = true;
                }
            }
            startNewCol = true
        }

        let newGroups = rowGroups.concat(colGroups).filter((x) => x.length > 2);
        setGroups(newGroups);

    }, [disabled]);

    function updateSelectedGroup(index: number) {
        const matchingGroups = groups.filter(group => group.includes(index));

        let targetGroup = matchingGroups.find(group => {
            const start = group[0];
            const end = group[group.length - 1];

            if (selectionDirection === SelectionDirection.Horizontal) {
                return Math.floor(start / props.gridSize) === Math.floor(end / props.gridSize); // same row
            } else {
                return start % props.gridSize === end % props.gridSize; // same column
            }
        });

        if (targetGroup) {
            props.handleGroupSelect(groups.indexOf(targetGroup));
        } else {
            // props.handleGroupSelect(-1); // nothing selected
        }
    }


    useEffect(() => {
        let known: string[] = [];

        for (let group of groups) {
            let knownWord = "";
            for (let idx of group) {
                if (letters[idx] !== "") {
                    knownWord += letters[idx]
                } else {
                    knownWord += "."
                }
            }

            known.push(knownWord);
        }

        props.handleKnown(known);
    }, [groups, letters])

    useEffect(() => {
        if (active !== undefined) {
            updateSelectedGroup(active);
        }
    }, [selectionDirection]);


    function handleClick(index: number, _: React.MouseEvent) {
        if (!props.disabling) {
            if (active === index) {
                setSelectionDirection(selectionDirection === SelectionDirection.Vertical ? SelectionDirection.Horizontal : SelectionDirection.Vertical)
            } else {
                setActive(index);
            }

            const row = Math.floor(index / props.gridSize);
            setSelectedRow(row);

            const col = index % props.gridSize;
            setSelectedCol(col);

            updateSelectedGroup(index);

        } else {
            console.log(disabled);
            if (!disabled.includes(index)) {
                let newDisabled = [...disabled, index];
                setDisabled(newDisabled);
            }
            else {
                let newDisabled = disabled.filter((x: number) => x !== index);
                setDisabled(newDisabled);
            }
        }
    }

    function handleKeyPress(_: number, e: React.KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (active !== undefined) {
            const index = active;
            const newChar = e.key === "Backspace" ? "" : e.key.toUpperCase();

            const directionDelta = selectionDirection === SelectionDirection.Horizontal ? 1 : props.gridSize;
            const offset = newChar === "" ? -directionDelta : directionDelta;

            let newIndex = index + offset;

            if (selectionDirection === SelectionDirection.Horizontal) {
                const currentRow = Math.floor(index / props.gridSize);
                const targetRow = Math.floor(newIndex / props.gridSize);
                if (targetRow !== currentRow || newIndex < 0 || newIndex >= props.gridSize * props.gridSize) {
                    newIndex = index;
                }
            } else {
                if (newIndex < 0 || newIndex >= props.gridSize * props.gridSize) {
                    newIndex = index;
                }
            }

            let newLetters = [...letters];
            newLetters[index] = newChar;

            setLetters(newLetters);
            setActive(newIndex);

            updateSelectedGroup(index);

            if (disabled.includes(newIndex)) {
                setActive(undefined);
            }
        }
    }

    const startsGroupsForIndex = useMemo(() => {
        return letters.map((_, index) =>
            groups
                .map((group, idx) => ({ group, idx }))
                .filter(({ group }) => group[0] === index)
                .map(({ idx }) => idx + 1)
        );
    }, [groups, letters])

    return (
        <div className="Grid" style={{ "--grid-size": props.gridSize } as React.CSSProperties}>
            {letters.map((letter, index) => {
                const row = Math.floor(index / props.gridSize);
                const col = index % props.gridSize;

                return (<Cell
                    index={index}
                    letter={letter}
                    active={active == index}
                    selected={selectionDirection === SelectionDirection.Horizontal && selectedRow === row || selectionDirection === SelectionDirection.Vertical && selectedCol === col}
                    disabled={disabled.includes(index)}
                    clickHandler={handleClick}
                    keyPressHandler={handleKeyPress}
                    startsGroups={startsGroupsForIndex[index]}
                />
                )
            })
            }
        </div>
    )
}

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

function Candidates(props: CandidatesProps) {
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

function App() {
    let [disabling, setDisabling] = useState<boolean>(false);

    function handleSelect(_: React.ChangeEvent) {
        setDisabling(!disabling);
    }

    function keyUpHandler(e: React.KeyboardEvent) {
        if (e.key.toLowerCase() == "d") {
            setDisabling(!disabling);
        }
    }

    let [known, setKnown] = useState<string[]>([]);
    function knownHandler(newKnown: string[]) {
        setKnown(newKnown);
    }

    let [words, setWords] = useState<string[]>([]);

    let [gridSize, setGridSize] = useState<number>(5);

    useEffect(() => {
        fetch("/words/finnish.txt")
            .then((res) => res.text())
            .then((text) => {
                const newWords = text
                    .split("\n")
                    .map(word => word.trim())
                    .filter(Boolean);

                setWords(newWords.filter(word => word.length <= gridSize));
            })
    }, [gridSize]);

    let [selectedGroup, setSelectedGroup] = useState<number>(0);

    function groupSelectHandler(newSelectedGroup: number) {
        setSelectedGroup(newSelectedGroup);
    }

    return (
        <div className="App" tabIndex={-1} onKeyUp={keyUpHandler}>
            <div className="Header">
                <h1>Ratkoja</h1>
            </div>
            <div className="Controls">
                <label htmlFor="disabling">
                    Disabling:
                    <input type="checkbox"
                        id="disabling"
                        onChange={handleSelect}
                        checked={disabling}
                    />
                </label>
                <label htmlFor="gridSize">
                    Grid size:
                    <input type="number" id="gridSize" min={0} max={100} step={1} value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} />
                </label>
            </div>
            <Grid disabling={disabling} handleKnown={knownHandler} handleGroupSelect={groupSelectHandler} gridSize={gridSize} />

            <Candidates known={known} words={words} selected={selectedGroup} />
            <div className="Footer">
                (c) Janne Salokoski 2025
            </div>
        </div>
    )
}

export default App
