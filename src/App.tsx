import { useEffect, useState } from 'react'
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
            onKeyUp={(e: React.KeyboardEvent) => props.keyPressHandler(props.index, e)}
        >
            <span className="groups">
                {
                    props.startsGroups.join(",")
                }
            </span>
            <span className="letter">{props.letter}</span>
        </div>
    )
}

enum SelectionDirection {
    Horizontal,
    Vertical,
}

interface GridProps {
    disabling: boolean;
    handleKnown: (newKnown: string[]) => void
}

function Grid(props: GridProps) {
    let [letters, setLetters] = useState<(string)[]>(new Array(25).fill(""));
    let [active, setActive] = useState<number | undefined>();
    let [selectedRow, setSelectedRow] = useState<number | undefined>();
    let [selectedCol, setSelectedCol] = useState<number | undefined>();
    let [selectionDirection, setSelectionDirection] = useState<SelectionDirection>(SelectionDirection.Horizontal);
    let [disabled, setDisabled] = useState<number[]>([]);

    let [groups, setGroups] = useState<number[][]>([]);

    useEffect(() => {
        let rowGroups: number[][] = [];
        let colGroups: number[][] = [];
        // rows
        let startNewRow = true;
        let startNewCol = true;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (startNewRow) {
                    rowGroups.push([]);
                }

                if (startNewCol) {
                    colGroups.push([]);
                }

                let rowIndex = row * 5 + col;
                if (!disabled.includes(rowIndex)) {
                    startNewRow = false;
                    rowGroups[rowGroups.length - 1].push(rowIndex)
                } else {
                    startNewRow = true;
                }

                let colIndex = col * 5 + row;
                if (!disabled.includes(colIndex)) {
                    startNewCol = false;
                    colGroups[colGroups.length - 1].push(colIndex)
                } else {
                    startNewCol = true;
                }

                if (col === 4) {
                    startNewRow = true;
                }
            }
            startNewCol = true
        }

        let newGroups = rowGroups.concat(colGroups).filter((x) => x.length > 2);
        setGroups(newGroups);
    }, [disabled]);

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

    function handleClick(index: number, _: React.MouseEvent) {
        if (!props.disabling) {
            if (active === index) {
                setSelectionDirection(selectionDirection === SelectionDirection.Vertical ? SelectionDirection.Horizontal : SelectionDirection.Vertical)
            } else {
                setActive(index);
            }

            const row = Math.floor(index / 5);
            setSelectedRow(row);

            const col = index % 5;
            setSelectedCol(col);
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

            const directionDelta = selectionDirection === SelectionDirection.Horizontal ? 1 : 5;
            const offset = newChar === "" ? -directionDelta : directionDelta;

            let newIndex = index + offset;

            if (selectionDirection === SelectionDirection.Horizontal) {
                const currentRow = Math.floor(index / 5);
                const targetRow = Math.floor(newIndex / 5);
                if (targetRow !== currentRow || newIndex < 0 || newIndex >= 25) {
                    newIndex = index;
                }
            } else {
                if (newIndex < 0 || newIndex >= 25) {
                    newIndex = index;
                }
            }

            let newLetters = [...letters];
            newLetters[index] = newChar;

            setLetters(newLetters);
            setActive(newIndex);

            if (disabled.includes(newIndex)) {
                setActive(undefined);
            }
        }
    }

    return (
        <div className="Grid">
            {letters.map((letter, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;

                return (<Cell
                    index={index}
                    letter={letter}
                    active={active == index}
                    selected={selectionDirection === SelectionDirection.Horizontal && selectedRow === row || selectionDirection === SelectionDirection.Vertical && selectedCol === col}
                    disabled={disabled.includes(index)}
                    clickHandler={handleClick}
                    keyPressHandler={handleKeyPress}
                    startsGroups={
                        groups.map((group, idx) => ({ group, idx }))
                            .filter(({ group }) => group[0] === index)
                            .map(({ idx }) => idx + 1)
                    }
                />
                )
            })
            }
        </div>
    )
}

interface CandidatesProps {
    known: string[];
}

function Candidates(props: CandidatesProps) {
    return (
        <ol className="Candidates">
            {
                props.known.map((known, idx) => (
                    <li key={idx}>{known}</li>
                ))
            }
        </ol>
    )
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

    return (
        <div className="App" tabIndex={-1} onKeyUp={keyUpHandler}>
            <Grid disabling={disabling} handleKnown={knownHandler} />
            <div className="Controls">
                <label htmlFor="disabling">
                    Disabling:
                    <input type="checkbox"
                        id="disabling"
                        onChange={handleSelect}
                        checked={disabling}
                    />
                </label>
            </div>
            <Candidates known={known} />
        </div>
    )
}

export default App
