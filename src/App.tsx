import { useState } from 'react'
import './App.css'

interface CellProps {
    letter: string;
    index: number;
    active: boolean;
    selected: boolean;
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
                `
            }
            onClick={(e: React.MouseEvent) => props.clickHandler(props.index, e)}
            onKeyUp={(e: React.KeyboardEvent) => props.keyPressHandler(props.index, e)}
        >
            <span className="letter">{props.letter}</span>
        </div>
    )
}

enum SelectionDirection {
    Horizontal,
    Vertical,
}

function Grid() {
    let [letters, setLetters] = useState<(string)[]>(new Array(25).fill(""));
    let [active, setActive] = useState<number | undefined>();
    let [selectedRow, setSelectedRow] = useState<number | undefined>();
    let [selectedCol, setSelectedCol] = useState<number | undefined>();
    let [selectionDirection, setSelectionDirection] = useState<SelectionDirection>(SelectionDirection.Horizontal);

    function handleClick(index: number, _: React.MouseEvent) {
        if (active === index) {
            setSelectionDirection(selectionDirection === SelectionDirection.Vertical ? SelectionDirection.Horizontal : SelectionDirection.Vertical)
        } else {
            setActive(index);
        }

        const row = Math.floor(index / 5);
        setSelectedRow(row);

        const col = index % 5;
        setSelectedCol(col);
    }

    function handleKeyPress(_: number, e: React.KeyboardEvent) {
        console.log(e.key);
        const index = active !== undefined ? active : 0;
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
                    clickHandler={handleClick}
                    keyPressHandler={handleKeyPress}
                />
                )
            })
            }
        </div>
    )
}

function App() {
    return (
        <div className="App">
            <Grid />
        </div>
    )
}

export default App
